import { appendRandomSuffix, formatStringToRoomSlug } from './lib/room-id-generator';
import { type CreateRoomPayload, type CreateRoomResult } from '../shared/protocol';

const MAX_SLUG_ATTEMPTS = 10;

/**
 * Creates a room: picks a unique slug and initializes its Durable Object.
 *
 * Replaces the previous Convex `rooms.create` mutation. Slug generation and
 * the "append a suffix if taken" behavior are identical; the uniqueness
 * check now works by probing the Durable Object for the slug.
 */
export async function handleCreateRoom(request: Request, env: Env): Promise<Response> {
  let payload: CreateRoomPayload;
  try {
    payload = (await request.json()) as CreateRoomPayload;
  } catch {
    return Response.json({ error: 'There was an error creating the room.' }, { status: 400 });
  }

  if (typeof payload.creatorSessionId !== 'string' || !payload.creatorSessionId) {
    return Response.json({ error: 'You need a player profile to create a room.' }, { status: 400 });
  }
  if (typeof payload.creatorName !== 'string' || !payload.creatorName.trim()) {
    return Response.json({ error: 'You need a player name to create a room.' }, { status: 400 });
  }
  if (
    typeof payload.roomName === 'string' &&
    payload.roomName !== '' &&
    (payload.roomName.length < 5 || payload.roomName.length > 20)
  ) {
    return Response.json(
      { error: 'Room name must be between 5 and 20 characters if specified.' },
      { status: 400 }
    );
  }

  const base = formatStringToRoomSlug(payload.roomName ?? '');
  let slug = base;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const stub = getRoomStub(env, slug);
    const exists = await stub.fetch('https://planning-room/exists');

    if (!exists.ok || !((await exists.json()) as { exists: boolean }).exists) {
      // The slug is free: initialize the room on its Durable Object.
      const init = await stub.fetch('https://planning-room/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (init.ok) {
        const result: CreateRoomResult = {
          roomSlug: slug,
        };
        return Response.json(result);
      }

      if (init.status === 409) {
        // Lost a create race with the same slug; try a different one.
        slug = appendRandomSuffix(base);
        continue;
      }

      return Response.json(
        { error: 'There was an error creating the room. Please try again.' },
        { status: 500 }
      );
    }

    slug = appendRandomSuffix(base);
  }

  return Response.json(
    { error: 'Could not find a unique room name. Please try again.' },
    { status: 503 }
  );
}

/** Returns the Durable Object stub for the room identified by `slug`. */
export function getRoomStub(env: Env, slug: string) {
  const id = env.PLANNING_ROOM.idFromName(slug);
  return env.PLANNING_ROOM.get(id);
}
