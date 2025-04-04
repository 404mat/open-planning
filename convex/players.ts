import { v } from 'convex/values';
import { mutationWithSession } from './lib/sessions';

export const create = mutationWithSession({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const newPlayerId = crypto.randomUUID();
    const playerId = await ctx.db.insert('players', {
      playerId: newPlayerId, // Generate a unique ID for the player
      name,
      sessionId: ctx.sessionId,
      updatedAt: Date.now(),
    });

    return { name, playerId, sessionId: ctx.sessionId };
  },
});
