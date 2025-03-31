import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Update a participant's vote in a room
export const updateParticipantVote = mutation({
  args: {
    roomId: v.string(),
    playerId: v.id('players'),
    vote: v.string(),
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
        return { ...participant, vote: args.vote };
      }
      return participant;
    });

    await ctx.db.patch(room._id, { participants: updatedParticipants });
  },
});

// Update a participant's isAllowedVote status in a room
export const updateParticipantisAllowedVote = mutation({
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

// Update a participant's isAdmin status in a room
export const updateParticipantIsAdmin = mutation({
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
