import { v } from 'convex/values';
import { mutationWithSession } from './lib/sessions';

/**
 * Update a participant's vote in a room
 * @param roomId - The ID of the room to retrieve.
 * @params playerId - The ID of the player to update.
 * @params vote - The new vote value.
 * @returns { success: boolean, message: string } - Indicates success or failure with a message.
 */
export const updateVote = mutationWithSession({
  args: {
    roomId: v.string(),
    playerId: v.id('players'),
    vote: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const room = await ctx.db
        .query('rooms')
        .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
        .first();

      if (!room) {
        return {
          success: false,
          message: `Room with roomId ${args.roomId} not found`,
        };
      }

      // Check if the participant exists in the room
      const participantExists = room.participants.some(
        (p) => p.playerId === args.playerId
      );
      if (!participantExists) {
        return {
          success: false,
          message: `Participant with playerId ${args.playerId} not found in room ${args.roomId}`,
        };
      }

      const updatedParticipants = room.participants.map((participant) => {
        if (participant.playerId === args.playerId) {
          return { ...participant, vote: args.vote };
        }
        return participant;
      });

      await ctx.db.patch(room._id, { participants: updatedParticipants });

      return { success: true, message: 'Vote updated successfully' };
    } catch (error) {
      console.error('Failed to update vote:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },
});

/**
 * Update a participant's isAllowedVote status in a room
 * @param roomId - The ID of the room to retrieve.
 * @params playerId - The ID of the player to update.
 * @params isAllowedVote - The new isAllowedVote status.
 */
export const updateIsAllowedVote = mutationWithSession({
  args: {
    roomId: v.string(),
    playerId: v.id('players'),
    isAllowedVote: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();

    if (!room) {
      throw new Error(`Room with roomId ${args.roomId} not found`); //todo: handle this later
    }

    const updatedParticipants = room.participants.map((participant) => {
      if (participant.playerId === args.playerId) {
        return { ...participant, isAllowedVote: args.isAllowedVote };
      }
      return participant;
    });

    await ctx.db.patch(room._id, { participants: updatedParticipants });
  },
});

/**
 * Update a participant's isAdmin status in a room
 * @param roomId - The ID of the room to retrieve.
 * @params playerId - The ID of the player to update.
 * @params isAdmin - The new isAdmin status.
 */
export const updateIsAdmin = mutationWithSession({
  args: {
    roomId: v.string(),
    playerId: v.id('players'),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();

    if (!room) {
      throw new Error(`Room with roomId ${args.roomId} not found`); //todo: handle this later
    }

    const updatedParticipants = room.participants.map((participant) => {
      if (participant.playerId === args.playerId) {
        return { ...participant, isAdmin: args.isAdmin };
      }
      return participant;
    });

    await ctx.db.patch(room._id, { participants: updatedParticipants });
  },
});
