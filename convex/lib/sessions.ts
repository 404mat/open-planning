import { action, mutation, query } from '../_generated/server';
import {
  customAction,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import {
  SessionId,
  SessionIdArg,
  runSessionFunctions,
} from 'convex-helpers/server/sessions';
import { QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { PRESENCE_UPDATE_MS } from './constants';

async function getUser(ctx: QueryCtx, sessionId: SessionId) {
  const user = await ctx.db
    .query('players')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
    .first();
  return user;
}

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const user = await getUser(ctx, sessionId);
    return { ctx: { ...ctx, user, sessionId }, args: {} };
  },
});

export const mutationWithSession = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const user = await getUser(ctx, sessionId);

    // Update user presence according to set timing
    if (user) {
      const userId = user._id;
      if (
        !user.lastSeenAt ||
        Date.now() - user.lastSeenAt > PRESENCE_UPDATE_MS
      ) {
        try {
          await ctx.db.patch(userId as Id<'players'>, {
            lastSeenAt: Date.now(),
          });
        } catch (error) {
          console.error(`Failed to update presence for user ${userId}:`, error);
          // todo Decide if the mutation should fail or just log the error
        }
      }
    }

    return { ctx: { ...ctx, user, sessionId }, args: {} };
  },
});

export const actionWithSession = customAction(action, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    return {
      ctx: {
        ...ctx,
        ...runSessionFunctions(ctx, sessionId),
        sessionId,
      },
      args: {},
    };
  },
});
