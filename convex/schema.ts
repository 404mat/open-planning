import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    prettyName: v.string(),
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
  })
    .index('by_roomId', ['roomId'])
    .index('by_updatedAt', ['updatedAt']),

  players: defineTable({
    playerId: v.string(),
    sessionId: v.string(),
    name: v.string(),
    lastSeenAt: v.number(),
  })
    .index('by_playerId', ['playerId'])
    .index('by_sessionId', ['sessionId'])
    .index('by_lastSeenAt', ['lastSeenAt']),
});
