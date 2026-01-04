import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  sessions: defineTable({
    name: v.string(),
    sessionId: v.string(),
    lastSeenAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_lastSeenAt', ['lastSeenAt']),

  rooms: defineTable({
    roomSlug: v.string(),
    prettyName: v.string(),
    isLocked: v.boolean(),
    isRevealed: v.boolean(),
    usersCanReveal: v.boolean(),
    voteSystem: v.string(),
    currentStoryUrl: v.string(),
    updatedAt: v.number(),
  })
    .index('by_roomSlug', ['roomSlug'])
    .index('by_updatedAt', ['updatedAt']),

  participants: defineTable({
    roomId: v.id('rooms'),
    sessionId: v.id('sessions'),
    vote: v.string(),
    isAdmin: v.boolean(),
    isAllowedVote: v.boolean(),
  })
    .index('by_room', ['roomId'])
    .index('by_room_session', ['roomId', 'sessionId']),
});
