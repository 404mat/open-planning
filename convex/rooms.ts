import { v } from 'convex/values';
import {
  roomMutationWithSession,
  queryWithSession,
  mutationWithSession,
} from './lib/auth';
import {
  formatStringToRoomSlug,
  appendRandomSuffix,
} from './lib/room_id_generator';
import { internalMutation } from './_generated/server';
import { BATCH_SIZE, THIRTY_DAYS_MS } from './lib/constants';

/**
 * Retrieves a room by its slug name.
 * @param roomSlug - The slug of the room to retrieve.
 * @returns The room object if found, otherwise null.
 */
export const get = queryWithSession({
  args: { roomSlug: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomSlug', (q) => q.eq('roomSlug', args.roomSlug))
      .first();
    return room;
  },
});

/**
 * Retrieves all participants for a room.
 * @param roomId - The ID of the room.
 * @returns Array of participant documents with session data.
 */
export const getParticipants = queryWithSession({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .collect();

    // Fetch session data for each participant
    const participantsWithSessions = await Promise.all(
      participants.map(async (p) => {
        const session = await ctx.db.get(p.sessionId);
        return {
          ...p,
          name: session?.name ?? 'Unknown',
        };
      })
    );

    return participantsWithSessions;
  },
});

/**
 * Deletes a room using the roomId from the context.
 * Also cleans up all participant entries.
 */
export const remove = roomMutationWithSession({
  args: {},
  handler: async (ctx) => {
    // Clean up all participants for this room
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', ctx.roomId))
      .collect();

    for (const p of participants) {
      await ctx.db.delete(p._id);
    }

    await ctx.db.delete(ctx.roomId);
  },
});

/**
 * Creates a new room with the specified options and adds the creator as admin.
 * @param roomOptions - The room default or custom options.
 */
export const create = mutationWithSession({
  args: {
    roomName: v.string(),
    voteSystem: v.string(),
    playerReveal: v.boolean(),
    playerChangeVote: v.boolean(),
    playerAddTicket: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find the session creating the room
    const creatorSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', ctx.sessionId))
      .first();

    if (!creatorSession) {
      console.error(`Creator session not found: ${ctx.sessionId}`);
      throw new Error(`Creator session not found: ${ctx.sessionId}`);
    }

    const formattedRoomSlug = formatStringToRoomSlug(args.roomName);

    // Check if this formatted slug already exists, and append random number if it does
    const existingRoom = await ctx.db
      .query('rooms')
      .withIndex('by_roomSlug', (q) => q.eq('roomSlug', formattedRoomSlug))
      .first();
    const finalRoomSlug = existingRoom
      ? appendRandomSuffix(formattedRoomSlug)
      : formattedRoomSlug;

    // Create the room
    const roomId = await ctx.db.insert('rooms', {
      roomSlug: finalRoomSlug,
      prettyName: args.roomName || finalRoomSlug,
      isLocked: false,
      isRevealed: false,
      voteSystem: args.voteSystem,
      currentStoryUrl: '',
      updatedAt: Date.now(),
    });

    // Add the creator as an admin participant
    await ctx.db.insert('participants', {
      roomId,
      sessionId: creatorSession._id,
      vote: '',
      isAdmin: true,
      isAllowedVote: true,
    });

    return finalRoomSlug;
  },
});

/**
 * Adds a participant to a room.
 * @param roomId - The ID of the room.
 * @param sessionDocId - The document ID of the session to add.
 */
export const addParticipant = roomMutationWithSession({
  args: { sessionDocId: v.id('sessions') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(ctx.roomId);

    if (!room) {
      console.error(`Room not found: ${ctx.roomId}`);
      return;
    }

    const session = await ctx.db.get(args.sessionDocId);

    if (!session) {
      console.error(`Session not found: ${args.sessionDocId}`);
      return;
    }

    // Check if participant already exists in the room
    const existingParticipant = await ctx.db
      .query('participants')
      .withIndex('by_room_session', (q) =>
        q.eq('roomId', ctx.roomId).eq('sessionId', args.sessionDocId)
      )
      .first();

    if (!existingParticipant) {
      await ctx.db.insert('participants', {
        roomId: ctx.roomId,
        sessionId: args.sessionDocId,
        vote: '',
        isAdmin: false,
        isAllowedVote: true,
      });
    } else {
      console.log(
        `Participant ${args.sessionDocId} already in room ${ctx.roomId}`
      );
    }
  },
});

/**
 * Updates the lock status of the room specified in the context.
 * @param isLocked - The new lock status of the room.
 */
export const updateLock = roomMutationWithSession({
  args: { isLocked: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.roomId, { isLocked: args.isLocked });
  },
});

/**
 * Updates the reveal status of the room specified in the context.
 * @param isRevealed - The new reveal status of the room.
 */
export const updateReveal = roomMutationWithSession({
  args: { isRevealed: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.roomId, { isRevealed: args.isRevealed });
  },
});

/**
 * Updates the current story URL of the room specified in the context.
 * @param currentStoryUrl - The new current story URL of the room.
 */
export const updateCurrentStoryUrl = roomMutationWithSession({
  args: { currentStoryUrl: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.roomId, { currentStoryUrl: args.currentStoryUrl });
  },
});

/**
 * Clear inactive rooms that are not used in the last month.
 * Also cleans up participant entries for deleted rooms.
 * @returns void
 */
export const clearInactiveRooms = internalMutation({
  args: {},
  handler: async (ctx) => {
    const THIRTY_DAYS_AGO = Date.now() - THIRTY_DAYS_MS;
    let deletedCount = 0;

    while (true) {
      const inactiveRooms = await ctx.db
        .query('rooms')
        .withIndex('by_updatedAt', (q) => q.lt('updatedAt', THIRTY_DAYS_AGO))
        .order('asc')
        .take(BATCH_SIZE);

      if (inactiveRooms.length === 0) break;

      for (const room of inactiveRooms) {
        // Clean up participant entries for this room
        const participants = await ctx.db
          .query('participants')
          .withIndex('by_room', (q) => q.eq('roomId', room._id))
          .collect();

        for (const p of participants) {
          await ctx.db.delete(p._id);
        }

        await ctx.db.delete(room._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
