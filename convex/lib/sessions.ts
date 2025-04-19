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
import { QueryCtx, MutationCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { PRESENCE_UPDATE_MS } from './constants';
import { v } from 'convex/values';

/* ---- Helper functions ---- */

async function getUserBySession(ctx: QueryCtx, sessionId: SessionId) {
  const user = await ctx.db
    .query('players')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
    .first();
  return user;
}

async function handleUserPresenceAndUpdate(
  ctx: MutationCtx,
  sessionId: SessionId
) {
  const user = await getUserBySession(ctx, sessionId);
  if (user) {
    const userId = user._id;
    if (!user.lastSeenAt || Date.now() - user.lastSeenAt > PRESENCE_UPDATE_MS) {
      try {
        await ctx.db.patch(userId as Id<'players'>, {
          lastSeenAt: Date.now(),
        });
      } catch (error) {
        console.error(`Failed to update presence for user ${userId}:`, error);
        // todo decide if the mutation should fail or just log the error
      }
    }
  }
  return user;
}

async function handleRoomActivityUpdate(ctx: MutationCtx, roomId: Id<'rooms'>) {
  try {
    if (!roomId) {
      console.error(
        '[handleRoomActivityUpdate] Error: roomId is invalid!',
        roomId
      );
      return; // Prevent patch call with invalid ID
    }
    await ctx.db.patch(roomId, {
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error(`Failed to update activity for room ${roomId}:`, error);
  }
}

/* ---- Custom actions ---- */

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

/* ---- Custom mutations ---- */

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const user = await getUserBySession(ctx, sessionId);
    return { ctx: { ...ctx, user, sessionId }, args: {} };
  },
});

export const playerMutationWithSession = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const user = await handleUserPresenceAndUpdate(ctx, sessionId);

    return { ctx: { ...ctx, user, sessionId }, args: {} };
  },
});

const RoomMutationArgs = {
  ...SessionIdArg,
  roomId: v.id('rooms'),
};
export const roomMutationWithSession = customMutation(mutation, {
  args: RoomMutationArgs,
  input: async (ctx, args) => {
    const { roomId, sessionId, ...restArgs } = args;

    await handleRoomActivityUpdate(ctx, roomId);
    const user = await handleUserPresenceAndUpdate(ctx, sessionId);

    return {
      ctx: { ...ctx, user, sessionId, roomId },
      args: restArgs,
    };
  },
});
