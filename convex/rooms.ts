import { v } from 'convex/values';
import {
  roomMutationWithSession,
  queryWithSession,
  playerMutationWithSession,
} from './lib/sessions';
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
 * Deletes a room using the roomId from the context.
 */
export const remove = roomMutationWithSession({
  args: {},
  handler: async (ctx) => {
    await ctx.db.delete(ctx.roomId);
  },
});

/**
 * Creates a new room with the specified ID, voting system, and initial admin player.
 * @param roomOptions - The romm default or custom options.
 */
export const create = playerMutationWithSession({
  args: {
    roomName: v.string(),
    voteSystem: v.string(),
    playerReveal: v.boolean(),
    playerChangeVote: v.boolean(),
    playerAddTicket: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find the player creating the room
    const creatorPlayer = await ctx.db
      .query('players')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', ctx.sessionId))
      .first();

    if (!creatorPlayer) {
      console.error(`Creator player not found: ${ctx.sessionId}`);
      // prevent creation of a room without an admin
      throw new Error(`Creator player not found: ${ctx.sessionId}`);
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

    // Construct the initial admin participant object
    const adminParticipant = {
      playerId: creatorPlayer._id, // Use internal Convex ID
      vote: '',
      isAdmin: true,
      isAllowedVote: true,
    };

    await ctx.db.insert('rooms', {
      roomSlug: finalRoomSlug,
      prettyName: args.roomName,
      isLocked: false,
      isRevealed: false,
      voteSystem: args.voteSystem,
      currentStoryUrl: '',
      participants: [adminParticipant],
      updatedAt: Date.now(),
    });

    return finalRoomSlug;
  },
});

/**
 * Adds a participant to a room.
 * @param roomId - The ID of the room to add the participant to.
 * Adds a participant to the room specified in the context.
 * @param playerId - The ID of the participant player to add.
 */
export const addParticipant = roomMutationWithSession({
  args: { playerId: v.id('players') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(ctx.roomId);

    if (!room) {
      console.error(`Room not found: ${ctx.roomId}`);
      return;
    }

    // Find the player using the external playerId string
    const player = await ctx.db.get(args.playerId);

    if (!player) {
      console.error(`Player not found: ${args.playerId}`);
      return;
    }

    // Check if participant (by internal _id) is already in the room
    const participantExists = room.participants.some(
      (p) => p.playerId === player._id
    );

    if (!participantExists) {
      const newParticipant = {
        playerId: player._id,
        vote: '', // Default vote is blank
        isAdmin: false, // todo make sure there is already an admin
        isAllowedVote: true, // todo make this dependant of room
      };

      // Add the new participant object to the array
      const updatedParticipants = [...room.participants, newParticipant];
      await ctx.db.patch(room._id, { participants: updatedParticipants });
    } else {
      console.log(`Participant ${args.playerId} already in room ${ctx.roomId}`);
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
 * Clear inactive rooms that are not used in the last month
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
        await ctx.db.delete(room._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
