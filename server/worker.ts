/**
 * Worker entrypoint.
 *
 * Routing order:
 * 1. `POST /api/rooms`     — room creation (needs cross-slug uniqueness checks)
 * 2. `/parties/:party/:room` — WebSocket + HTTP routes to the room Durable Object
 * 3. everything else       — the TanStack Start application
 */

import startEntry from '@tanstack/react-start/server-entry';
import { routePartykitRequest } from 'partyserver';
import { PlanningRoom } from './planning-room';
import { handleCreateRoom } from './rooms-api';

// The TanStack Start server entry forwards the raw Worker fetch arguments to
// the app handler; retype it to match how it is used below.
const appEntry = startEntry as unknown as {
  fetch: (request: Request, env: Env) => Promise<Response>;
};

// Re-export the Durable Object class so the runtime can bind to it.
export { PlanningRoom };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'POST' && pathname === '/api/rooms') {
      try {
        return await handleCreateRoom(request, env);
      } catch (error) {
        console.error('Room creation failed:', error);
        return Response.json(
          { error: 'There was an error creating the room. Please try again.' },
          { status: 500 }
        );
      }
    }

    const partyResponse = await routePartykitRequest(request, env);
    if (partyResponse) return partyResponse;

    return appEntry.fetch(request, env);
  },
};
