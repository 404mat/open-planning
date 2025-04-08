import { v } from 'convex/values';
import { mutationWithSession } from './lib/sessions';
import { queryWithSession } from './lib/sessions';

/**
 * Creates a new player with a unique ID and associates it with a session.
 * @param name - The name of the player.
 * @returns An object containing the player's name, ID, and session ID.
 */
export const create = mutationWithSession({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const newPlayerId = crypto.randomUUID();
    const playerId = await ctx.db.insert('players', {
      playerId: newPlayerId, // Generate a unique ID for the player
      name,
      sessionId: ctx.sessionId,
      lastSeenAt: Date.now(),
    });

    return { name, playerId, sessionId: ctx.sessionId };
  },
});

/**
 * Retrieves a player by their session ID.
 * @param localSessionId - The session ID of the player to retrieve.
 * @returns The player object if found, otherwise null.
 */
export const find = queryWithSession({
  args: { localSessionId: v.string() },
  handler: async (ctx) => {
    const player = await ctx.db
      .query('players')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', ctx.sessionId))
      .first();
    return player;
  },
});
