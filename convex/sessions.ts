import { v } from 'convex/values';
import { mutationWithSession, queryWithSession } from './lib/auth';
import { internalMutation } from './_generated/server';
import { BATCH_SIZE, THIRTY_DAYS_MS } from './lib/constants';

/**
 * Returns the current session for the authenticated user.
 * The session is already looked up by queryWithSession via ctx.session.
 * @returns The session document if found, otherwise null.
 */
export const me = queryWithSession({
  args: {},
  handler: async (ctx) => {
    return ctx.session ?? null;
  },
});

/**
 * Creates a new session with the current sessionId from SessionProvider.
 * @param name - The display name of the user.
 * @returns An object containing the session doc ID and session string ID.
 */
export const create = mutationWithSession({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    // Check if session already exists (avoid duplicates)
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', ctx.sessionId))
      .first();

    if (existingSession) {
      // Session already exists, just update the name and lastSeenAt
      await ctx.db.patch(existingSession._id, {
        name,
        lastSeenAt: Date.now(),
      });
      return { sessionDocId: existingSession._id, sessionId: ctx.sessionId };
    }

    // Create new session
    const sessionDocId = await ctx.db.insert('sessions', {
      name,
      sessionId: ctx.sessionId,
      lastSeenAt: Date.now(),
    });

    return { sessionDocId, sessionId: ctx.sessionId };
  },
});

/**
 * Clear all sessions that were not seen in the last 30 days.
 * Also cleans up participant entries for deleted sessions.
 * @returns void
 */
export const clearInactiveSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const THIRTY_DAYS_AGO = Date.now() - THIRTY_DAYS_MS;
    let deletedCount = 0;

    while (true) {
      const inactiveSessions = await ctx.db
        .query('sessions')
        .withIndex('by_lastSeenAt', (q) => q.lt('lastSeenAt', THIRTY_DAYS_AGO))
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
