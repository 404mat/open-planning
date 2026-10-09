# Open Planning

This is a web application for collaborative planning (planning poker). Built with
TanStack Start, and running entirely on [Cloudflare Workers](https://workers.cloudflare.com/):
room state lives in a [Durable Object](https://developers.cloudflare.com/durable-objects/)
([PartyServer](https://github.com/cloudflare/partykit)) and players connect over WebSockets.

## Getting Started

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    Runs `cf dev`, which starts Vite with the Cloudflare Vite plugin — the app and
    the room Durable Object both run locally in workerd. State persists across
    restarts in `.cloudflare/state/`.

3.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## How it works

- **One Durable Object per room** (`server/planning-room.ts`, PartyServer `Server`):
  it owns the room state (settings, reveal flag, participants, votes), validates
  every action (admin checks, lock checks, permissions) and broadcasts a full
  state snapshot to every connected WebSocket after each change.
- **Worker entrypoint** (`server/worker.ts`): routes `POST /api/rooms` (room
  creation with unique-slug checks), `/parties/planning-room/:slug` (WebSocket
  connections), and everything else to the TanStack Start app.
- **Client** (`src/hooks/use-room.ts`): connects with
  [partysocket](https://github.com/cloudflare/partykit) (auto-reconnect), sends
  typed `ClientMessage`s and renders whatever state it receives.
- **UI kit** (`src/components/ui/`): the shadcn/ui components built on
  [Base UI](https://base-ui.com) (`@base-ui/react`), with its design-token CSS
  in `src/styles/shadcn.css`.
- **Player identity**: a UUID + display name kept in localStorage
  (`open-planning-session-id` / `-name`). Kicked players get a `kicked` push and
  are redirected; participants and votes otherwise persist until the room is
  deleted or 30 days after the last activity (Durable Object alarm).

## Deploy

```bash
cf auth login   # once, if needed
pnpm deploy     # runs `cf deploy` (builds via Vite and uploads the Worker)
```

Configure the Worker in `cloudflare.config.ts` (typed config — name, bindings,
Durable Objects). `cf build --dry-run` / `cf deploy --dry-run` validate a build
without uploading.
