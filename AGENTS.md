This document describes the architecture conventions for this project.

# Stack

- **Frontend**: TanStack Start (Vite), React 19, TanStack Router, Tailwind 4.
- **Backend**: One Cloudflare Worker. All state lives in a single Durable Object
  class, `PlanningRoom` (`server/planning-room.ts`), built with
  [PartyServer](https://github.com/cloudflare/partykit). Clients talk to it over
  WebSockets (typed messages in `shared/protocol.ts`) with the `partysocket`
  React hook.
- **Tooling**: the `cf` Cloudflare CLI (`cf dev` / `cf build` / `cf deploy`).
  The project is configured by the typed `cloudflare.config.ts` — do not add a
  `wrangler.jsonc`.

# Conventions

- The Worker entrypoint is `server/worker.ts`: `POST /api/rooms` (room creation),
  `/parties/*` (PartyServer routing), everything else goes to the TanStack Start
  handler. Keep that three-step routing order.
- Room state is only ever mutated inside the Durable Object. Never trust client
  state: re-validate permissions (admin-only flags, `isLocked`, reveal rules)
  inside `PlanningRoom` before mutating, then persist via `save()` and call
  `broadcastState()`.
- The room Durable Object is addressed by slug via `idFromName` (PartyServer
  requirement); the connection's `session` query parameter is the player identity.
- Shared message/state types live in `shared/protocol.ts` — imported by both
  `src/` and `server/`, keep it runtime-dependency-free.
- Env `Env` types come from the generated `.cloudflare/types/index.d.ts`
  (`cf workers types`, or written automatically by the Vite plugin).
