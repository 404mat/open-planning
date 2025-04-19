import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  rooms: defineTable({
    roomSlug: v.string(),
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
    .index('by_roomSlug', ['roomSlug'])
    .index('by_updatedAt', ['updatedAt']),

  players: defineTable({
    name: v.string(),
    sessionId: v.string(),
    lastSeenAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_lastSeenAt', ['lastSeenAt']),
});
