import { v } from 'convex/values';
import {
  roomMutationWithSession,
  getParticipant,
  requireAdmin,
} from './lib/auth';

/**
 * Update a participant's vote in a room.
 * Uses the current session from context.
 * @param roomId - The ID of the room.
 * @param vote - The new vote value.
 */
export const updateVote = roomMutationWithSession({
  args: { vote: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.session) {
      throw new Error('Not authenticated');
    }

    const participant = await getParticipant(ctx, ctx.roomId, ctx.session._id);

    if (!participant) {
      throw new Error('Not a participant in this room');
    }

    await ctx.db.patch(participant._id, { vote: args.vote });
  },
});

/**
 * Update a specific participant's isAllowedVote status in a room.
 * @param roomId - The ID of the room.
 * @param targetSessionId - The session ID of the participant to update.
 * @param isAllowedVote - The new isAllowedVote status.
 */
export const updateIsAllowedVote = roomMutationWithSession({
  args: {
    targetSessionId: v.id('sessions'),
    isAllowedVote: v.boolean(),
  },
  handler: async (ctx, args) => {
    const participant = await getParticipant(
      ctx,
      ctx.roomId,
      args.targetSessionId
    );

    if (!participant) {
      throw new Error('Participant not found in this room');
    }

    await ctx.db.patch(participant._id, { isAllowedVote: args.isAllowedVote });
  },
});

/**
 * Reset all participant votes in a room.
 * @param roomId - The ID of the room (from context).
 */
export const resetAllVotes = roomMutationWithSession({
  args: {},
  handler: async (ctx) => {
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', ctx.roomId))
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, { vote: '' });
    }
  },
});

/**
 * Update a specific participant's isAdmin status in a room.
 * Only admins can update this.
 * @param roomId - The ID of the room.
 * @param targetSessionId - The session ID of the participant to update.
 * @param isAdmin - The new isAdmin status.
 */
export const updateIsAdmin = roomMutationWithSession({
  args: {
    targetSessionId: v.id('sessions'),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!ctx.session) {
      throw new Error('Not authenticated');
    }

    // Require admin access
    await requireAdmin(ctx, ctx.roomId, ctx.session._id);

    const participant = await getParticipant(
      ctx,
      ctx.roomId,
      args.targetSessionId
    );

    if (!participant) {
      throw new Error('Participant not found in this room');
    }

    // remove all other admins from the room
    const otherAdmins = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', ctx.roomId))
      .filter((q) => q.eq(q.field('isAdmin'), true))
      .collect();

    for (const admin of otherAdmins) {
      await ctx.db.patch(admin._id, { isAdmin: false });
    }

    await ctx.db.patch(participant._id, { isAdmin: args.isAdmin });
  },
});

/**
 * Remove a participant from a room.
 * Only admins can remove participants.
 * @param roomId - The ID of the room.
 * @param targetSessionId - The session ID of the participant to remove.
 */
export const removeParticipant = roomMutationWithSession({
  args: {
    targetSessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    if (!ctx.session) {
      throw new Error('Not authenticated');
    }

    // Require admin access
    await requireAdmin(ctx, ctx.roomId, ctx.session._id);

    const participant = await getParticipant(
      ctx,
      ctx.roomId,
      args.targetSessionId
    );

    if (!participant) {
      throw new Error('Participant not found in this room');
    }

    // Don't allow removing yourself
    if (participant.sessionId === ctx.session._id) {
      throw new Error('Cannot remove yourself from the room');
    }

    // Remove the participant
    await ctx.db.delete(participant._id);
  },
});
