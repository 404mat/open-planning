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

async function getSessionBySessionId(ctx: QueryCtx, sessionId: SessionId) {
  const session = await ctx.db
    .query('sessions')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
    .first();
  return session;
}

async function handleSessionPresenceUpdate(
  ctx: MutationCtx,
  sessionId: SessionId
) {
  const session = await getSessionBySessionId(ctx, sessionId);
  if (session) {
    if (
      !session.lastSeenAt ||
      Date.now() - session.lastSeenAt > PRESENCE_UPDATE_MS
    ) {
      try {
        await ctx.db.patch(session._id, {
          lastSeenAt: Date.now(),
        });
      } catch (error) {
        console.error(
          `Failed to update presence for session ${session._id}:`,
          error
        );
      }
    }
  }
  return session;
}

async function handleRoomActivityUpdate(ctx: MutationCtx, roomId: Id<'rooms'>) {
  try {
    if (!roomId) {
      console.error(
        '[handleRoomActivityUpdate] Error: roomId is invalid!',
        roomId
      );
      return;
    }
    await ctx.db.patch(roomId, {
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error(`Failed to update activity for room ${roomId}:`, error);
  }
}

/* ---- Participant Auth Helpers ---- */

export async function getParticipant(
  ctx: QueryCtx,
  roomId: Id<'rooms'>,
  sessionDocId: Id<'sessions'>
) {
  return ctx.db
    .query('participants')
    .withIndex('by_room_session', (q) =>
      q.eq('roomId', roomId).eq('sessionId', sessionDocId)
    )
    .first();
}

export async function requireParticipant(
  ctx: QueryCtx,
  roomId: Id<'rooms'>,
  sessionDocId: Id<'sessions'>
) {
  const participant = await getParticipant(ctx, roomId, sessionDocId);
  if (!participant) throw new Error('Not a participant in this room');
  return participant;
}

export async function requireAdmin(
  ctx: QueryCtx,
  roomId: Id<'rooms'>,
  sessionDocId: Id<'sessions'>
) {
  const participant = await requireParticipant(ctx, roomId, sessionDocId);
  if (!participant.isAdmin) throw new Error('Admin access required');
  return participant;
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

/* ---- Custom queries and mutations ---- */

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const session = await getSessionBySessionId(ctx, sessionId);
    return { ctx: { ...ctx, session, sessionId }, args: {} };
  },
});

export const mutationWithSession = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const session = await handleSessionPresenceUpdate(ctx, sessionId);
    return { ctx: { ...ctx, session, sessionId }, args: {} };
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
    const session = await handleSessionPresenceUpdate(ctx, sessionId);

    return {
      ctx: { ...ctx, session, sessionId, roomId },
      args: restArgs,
    };
  },
});
