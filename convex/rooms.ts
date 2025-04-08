import { query } from './_generated/server';
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { mutationWithSession } from './lib/sessions';

/**
 * Retrieves a room by its ID.
 * @param roomId - The ID of the room to retrieve.
 * @returns The room object if found, otherwise null.
 */
export const get = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    return room;
  },
});

/**
 * Deletes a room by its ID.
 * @param roomId - The ID of the room to delete.
 */
export const remove = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    if (room) {
      await ctx.db.delete(room._id);
    }
  },
});

/**
 * Creates a new room with the specified ID, voting system, and initial admin player.
 * @param roomId - The unique ID for the new room.
 * @param voteSystem - The voting system to be used in the room.
 * @param playerId - The external ID (string) of the player creating the room, who will be set as admin.
 */
export const create = mutationWithSession({
  args: {
    roomId: v.string(),
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
      throw new Error(`Creator player not found: ${ctx.sessionId}`); // Throw error to prevent room creation without admin
    }

    // Construct the initial admin participant object
    const adminParticipant = {
      playerId: creatorPlayer._id, // Use internal Convex ID
      vote: '',
      isAdmin: true, // Set as admin
      isAllowedVote: true,
    };

    // Insert the new room with the admin participant
    await ctx.db.insert('rooms', {
      roomId: args.roomId,
      isLocked: false,
      isRevealed: false,
      voteSystem: args.voteSystem,
      currentStoryUrl: '',
      participants: [adminParticipant], // Initialize with the admin
      updatedAt: Date.now(),
    });
  },
});

/**
 * Adds a participant to a room.
 * @param roomId - The ID of the room to add the participant to.
 * @param playerId - The external ID (string) of the participant to add.
 */
export const addParticipant = mutation({
  args: { roomId: v.string(), playerId: v.string() },
  handler: async (ctx, args) => {
    // Find the room
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();

    if (!room) {
      console.error(`Room not found: ${args.roomId}`);
      return; // Or throw an error
    }

    // Find the player using the external playerId string
    const player = await ctx.db
      .query('players')
      .withIndex('by_playerId', (q) => q.eq('playerId', args.playerId))
      .first();

    if (!player) {
      console.error(`Player not found: ${args.playerId}`);
      return; // Or throw an error
    }

    // Check if participant (by internal _id) is already in the room
    const participantExists = room.participants.some(
      (p) => p.playerId === player._id
    );

    if (!participantExists) {
      // Construct the new participant object
      const newParticipant = {
        playerId: player._id, // Use the internal Convex ID
        vote: '', // Default vote is blank
        isAdmin: false, // Default admin status
        isAllowedVote: true, // Default voting permission
      };

      // Add the new participant object to the array
      const updatedParticipants = [...room.participants, newParticipant];
      await ctx.db.patch(room._id, { participants: updatedParticipants });
    } else {
      console.log(
        `Participant ${args.playerId} already in room ${args.roomId}`
      );
    }
  },
});

/**
 * Updates the lock status of a room.
 * @param roomId - The ID of the room to update.
 * @param isLocked - The new lock status of the room.
 */
export const updateLock = mutation({
  args: { roomId: v.string(), isLocked: v.boolean() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    if (room) {
      await ctx.db.patch(room._id, { isLocked: args.isLocked });
    }
  },
});

/**
 * Updates the reveal status of a room.
 * @param roomId - The ID of the room to update.
 * @param isRevealed - The new reveal status of the room.
 */
export const updateReveal = mutation({
  args: { roomId: v.string(), isRevealed: v.boolean() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    if (room) {
      await ctx.db.patch(room._id, { isRevealed: args.isRevealed });
    }
  },
});

/**
 * Updates the current story URL of a room.
 * @param roomId - The ID of the room to update.
 * @param currentStoryUrl - The new current story URL of the room.
 */
export const updateCurrentStoryUrl = mutation({
  args: { roomId: v.string(), currentStoryUrl: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    if (room) {
      await ctx.db.patch(room._id, { currentStoryUrl: args.currentStoryUrl });
    }
  },
});
