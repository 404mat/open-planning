import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    isLocked: v.boolean(),
    isRevealed: v.boolean(),
    voteSystem: v.string(),
    currentStoryUrl: v.string(),
    participants: v.array(
      v.object({
        playerId: v.id('players'),
        vote: v.string(),
        isAdmin: v.boolean(),
        isAllowedVote: v.boolean(),
      })
    ),
    updatedAt: v.number(),
  }).index('by_roomId', ['roomId']),

  players: defineTable({
    playerId: v.string(),
    name: v.string(),
    updatedAt: v.number(),
  }).index('by_playerId', ['playerId']),
});
