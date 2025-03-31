import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    isLocked: v.boolean(),
    isRevealed: v.boolean(),
    voteSystem: v.string(),
    currentStoryUrl: v.string(),
    participants: v.array(
      v.object({
        playerId: v.string(),
        vote: v.string(),
        isAdmin: v.boolean(),
        isVoting: v.boolean(),
      })
    ),
    updatedAt: v.number(),
  }),

  players: defineTable({
    playerId: v.string(),
    name: v.string(),
    updatedAt: v.number(),
  })
});