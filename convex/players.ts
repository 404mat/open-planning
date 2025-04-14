import { v } from 'convex/values';
import { mutationWithSession } from './lib/sessions';
import { queryWithSession } from './lib/sessions';
import { internalMutation } from './_generated/server';
import { BATCH_SIZE, FOURTEEN_DAYS_MS } from './lib/constants';

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
 * Retrieves multiple players by their internal Convex IDs.
 * @param playerIds - An array of internal Convex player IDs (`_id`).
 * @returns An array of player objects matching the provided IDs. Returns null for IDs not found.
 */
export const getPlayersByIds = queryWithSession({
  args: { playerIds: v.array(v.id('players')) },
  handler: async (ctx, args) => {
    // Fetch players in parallel
    const players = await Promise.all(
      args.playerIds.map((playerId) => ctx.db.get(playerId))
    );
    return players;
  },
});

/**
 * Retrieves a player by their session ID.
 * @param localSessionId - The session ID of the player to retrieve.
 * @returns The player object if found, otherwise null.
 */
export const find = queryWithSession({
  args: { localSessionId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query('players')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.localSessionId))
      .first();
    return player;
  },
});

/**
 * Clear all players that were not seen in the last few days.
 * @returns void
 */
export const clearInactivePlayers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const FOURTEEN_DAYS_AGO = Date.now() - FOURTEEN_DAYS_MS;
    let deletedCount = 0;

    while (true) {
      const inactivePlayers = await ctx.db
        .query('players')
        .withIndex('by_lastSeenAt', (q) =>
          q.lt('lastSeenAt', FOURTEEN_DAYS_AGO)
        )
        .order('asc')
        .take(BATCH_SIZE);

      if (inactivePlayers.length === 0) break;

      for (const player of inactivePlayers) {
        await ctx.db.delete(player._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
