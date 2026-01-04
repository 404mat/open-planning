import { v } from 'convex/values';
import { mutationWithSession, queryWithSession } from './lib/auth';
import { internalMutation } from './_generated/server';
import { BATCH_SIZE, FOURTEEN_DAYS_MS } from './lib/constants';

/**
 * Creates a new session with a unique ID.
 * @param name - The name of the user.
 * @returns An object containing the user's name, session doc ID, and session string ID.
 */
export const create = mutationWithSession({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const sessionDocId = await ctx.db.insert('sessions', {
      name,
      sessionId: ctx.sessionId,
      lastSeenAt: Date.now(),
    });

    return { name, sessionDocId, sessionId: ctx.sessionId };
  },
});

/**
 * Retrieves a session by its session string ID.
 * @param localSessionId - The session ID string to look up.
 * @returns The session document if found, otherwise null.
 */
export const find = queryWithSession({
  args: { localSessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.localSessionId))
      .first();
    return session;
  },
});

/**
 * Clear all sessions that were not seen in the last few days.
 * Also cleans up participant entries for deleted sessions.
 * @returns void
 */
export const clearInactiveSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const FOURTEEN_DAYS_AGO = Date.now() - FOURTEEN_DAYS_MS;
    let deletedCount = 0;

    while (true) {
      const inactiveSessions = await ctx.db
        .query('sessions')
        .withIndex('by_lastSeenAt', (q) =>
          q.lt('lastSeenAt', FOURTEEN_DAYS_AGO)
        )
        .order('asc')
        .take(BATCH_SIZE);

      if (inactiveSessions.length === 0) break;

      for (const session of inactiveSessions) {
        // Clean up participant entries for this session
        const participations = await ctx.db
          .query('participants')
          .filter((q) => q.eq(q.field('sessionId'), session._id))
          .collect();

        for (const p of participations) {
          await ctx.db.delete(p._id);
        }

        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
