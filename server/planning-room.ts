import { Server, type Connection } from 'partyserver';
import {
  type ClientMessage,
  type CreateRoomPayload,
  type Participant,
  type Room,
  type RoomState,
  type ServerMessage,
  isVoteSystem,
} from '../shared/protocol';

/** Rooms untouched for this long are deleted by the DO alarm. */
export const ROOM_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** WebSocket close code used when an admin kicks a player. */
const KICK_CLOSE_CODE = 4003;

const ROOM_KEY = 'room';

/**
 * The single source of truth for one planning-poker room.
 *
 * One Durable Object instance per room slug (PartyServer addresses each
 * instance by room name). Clients connect over a WebSocket, send
 * `ClientMessage`s, and receive full `RoomState` snapshots after every
 * change. This service replaces the Convex `rooms` / `participants` /
 * `sessions` tables and their functions.
 */
export class PlanningRoom extends Server<Env> {
  static options = {
    // Persist room state in DO storage and hibernate when idle.
    hibernate: true,
  };

  private room: RoomState | null = null;

  /* ---------- Lifecycle ---------- */

  async onStart(): Promise<void> {
    this.room = (await this.ctx.storage.get<RoomState>(ROOM_KEY)) ?? null;
  }

  /* ---------- HTTP API (internal, used by the Worker) ---------- */

  /**
   * The Worker calls these endpoints through the room's Durable Object stub
   * during room creation:
   * - `GET /exists`  → `{ exists }` — does this slug already have a room?
   * - `POST /init`   → creates the room with the creator as admin.
   */
  async onRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.endsWith('/exists')) {
      return Response.json({ exists: this.room !== null });
    }

    if (pathname.endsWith('/init') && request.method === 'POST') {
      let payload: CreateRoomPayload;
      try {
        payload = (await request.json()) as CreateRoomPayload;
      } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
      return this.initRoom(payload);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async initRoom(payload: CreateRoomPayload): Promise<Response> {
    const validationError = validateCreatePayload(payload);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    if (this.room) {
      // Someone created a room with this slug between the existence probe
      // and this call. The Worker retries with a unique slug.
      return Response.json({ error: 'Room already exists' }, { status: 409 });
    }

    // The DO is named after the room slug, so `this.name` is the final slug.
    const room: Room = {
      roomSlug: this.name,
      prettyName: payload.roomName || this.name,
      isLocked: false,
      isRevealed: false,
      usersCanReveal: payload.playerReveal,
      voteSystem: payload.voteSystem,
      currentStoryUrl: '',
      updatedAt: Date.now(),
    };

    // The creator joins as the room's first admin, mirroring the previous
    // Convex `rooms.create` behavior.
    this.room = {
      room,
      participants: [
        {
          sessionId: payload.creatorSessionId,
          name: payload.creatorName.trim(),
          vote: '',
          isAdmin: true,
          isAllowedVote: true,
          lastSeenAt: Date.now(),
        },
      ],
    };
    await this.save();

    return Response.json({ roomSlug: room.roomSlug });
  }

  /* ---------- WebSocket handling ---------- */

  async onConnect(connection: Connection): Promise<void> {
    // Greet every connection with the current state (or a not-found signal
    // for a slug that has no room).
    if (!this.room) {
      this.send(connection, { type: 'room-not-found' });
      return;
    }
    this.send(connection, { type: 'state', state: this.room });
  }

  async onMessage(connection: Connection, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(message);
    } catch {
      this.send(connection, { type: 'error', message: 'Malformed message' });
      return;
    }

    const sessionId = getSessionId(connection);
    if (!sessionId) {
      this.send(connection, { type: 'error', message: 'Missing session' });
      return;
    }

    const msg = parsed as Partial<ClientMessage>;

    switch (msg.type) {
      case 'join':
        await this.handleJoin(sessionId, msg);
        return;
      case 'vote':
        await this.handleVote(sessionId, msg);
        return;
      case 'reveal':
        await this.handleReveal(sessionId, msg);
        return;
      case 'reset-votes':
        await this.handleResetVotes(sessionId);
        return;
      case 'set-vote-system':
        await this.handleSetVoteSystem(sessionId, msg);
        return;
      case 'set-locked':
        await this.handleSetLocked(sessionId, msg);
        return;
      case 'set-users-can-reveal':
        await this.handleSetUsersCanReveal(sessionId, msg);
        return;
      case 'set-story-url':
        await this.handleSetStoryUrl(sessionId, msg);
        return;
      case 'promote-admin':
        await this.handlePromoteAdmin(sessionId, msg);
        return;
      case 'kick':
        await this.handleKick(sessionId, msg);
        return;
      case 'set-allowed-vote':
        await this.handleSetAllowedVote(sessionId, msg);
        return;
      case 'leave':
        await this.handleLeave(sessionId);
        return;
      case 'delete-room':
        await this.handleDeleteRoom(sessionId);
        return;
      default:
        this.send(connection, {
          type: 'error',
          message: 'Unknown message type',
        });
    }
  }

  async onClose(): Promise<void> {
    // Participants persist after disconnect (same as the previous Convex
    // behavior): their votes stay on the table until a reset, a kick, or
    // the 30-day cleanup removes them.
  }

  /* ---------- Cleanup alarm ---------- */

  async onAlarm(): Promise<void> {
    const lastActivity = this.room?.room.updatedAt ?? 0;
    if (Date.now() - lastActivity < ROOM_TTL_MS) {
      // Room became active again since the alarm was scheduled.
      await this.scheduleCleanup();
      return;
    }
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    this.room = null;
  }

  /* ---------- Handlers ---------- */

  private async handleJoin(sessionId: string, msg: { name?: unknown }): Promise<void> {
    const state = this.requireRoom();
    if (!state || typeof msg.name !== 'string' || msg.name.trim() === '') {
      // Missing name is only possible from hand-crafted payload; a socket
      // without a room has already been told so on connect.
      if (state && typeof msg.name !== 'string') {
        this.replyError(sessionId, 'Missing player name');
      }
      return;
    }

    const name = msg.name.trim();
    const existing = state.participants.find((p) => p.sessionId === sessionId);
    if (existing) {
      existing.name = name;
      existing.lastSeenAt = Date.now();
    } else {
      state.participants.push({
        sessionId,
        name,
        vote: '',
        isAdmin: false,
        isAllowedVote: true,
        lastSeenAt: Date.now(),
      });
    }

    await this.save();
    this.broadcastState();
  }

  private async handleVote(sessionId: string, msg: { vote?: unknown }): Promise<void> {
    const state = this.requireRoom();
    if (!state || typeof msg.vote !== 'string') {
      this.replyError(sessionId, 'Invalid vote');
      return;
    }
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAllowedVote) {
      this.replyError(sessionId, 'An admin has disabled voting for you in this room.');
      return;
    }
    if (state.room.isLocked) {
      this.replyError(sessionId, 'An admin has locked this feature for now.');
      return;
    }

    participant.vote = msg.vote;
    await this.save();
    this.broadcastState();
  }

  private async handleReveal(sessionId: string, msg: { isRevealed?: unknown }): Promise<void> {
    const state = this.requireRoom();
    if (!state || typeof msg.isRevealed !== 'boolean') {
      this.replyError(sessionId, 'Invalid reveal value');
      return;
    }
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAdmin && !state.room.usersCanReveal) {
      this.replyError(sessionId, 'Only admins can reveal votes when users reveal is disabled');
      return;
    }

    state.room.isRevealed = msg.isRevealed;
    await this.save();
    this.broadcastState();
  }

  private async handleResetVotes(sessionId: string): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAdmin && !state.room.usersCanReveal) {
      this.replyError(sessionId, 'Only admins can reset votes when users reveal is disabled');
      return;
    }

    for (const p of state.participants) {
      p.vote = '';
    }
    state.room.isRevealed = false;
    await this.save();
    this.broadcastState();
  }

  private async handleSetVoteSystem(
    sessionId: string,
    msg: { voteSystem?: unknown }
  ): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    if (!this.requireAdmin(state, sessionId, 'set the voting system')) return;
    if (!isVoteSystem(msg.voteSystem)) {
      this.replyError(sessionId, 'Unknown voting system');
      return;
    }

    // Changing the system resets every vote and hides the table — the
    // previous client-side sequence (updateVoteSystem + resetAllVotes +
    // updateReveal), now atomic.
    state.room.voteSystem = msg.voteSystem;
    for (const p of state.participants) {
      p.vote = '';
    }
    state.room.isRevealed = false;
    await this.save();
    this.broadcastState();
  }

  private async handleSetLocked(sessionId: string, msg: { isLocked?: unknown }): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    if (!this.requireAdmin(state, sessionId, 'lock voting')) return;
    if (typeof msg.isLocked !== 'boolean') {
      this.replyError(sessionId, 'Invalid lock value');
      return;
    }

    state.room.isLocked = msg.isLocked;
    await this.save();
    this.broadcastState();
  }

  private async handleSetUsersCanReveal(
    sessionId: string,
    msg: { usersCanReveal?: unknown }
  ): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    if (!this.requireAdmin(state, sessionId, 'update this setting')) return;
    if (typeof msg.usersCanReveal !== 'boolean') {
      this.replyError(sessionId, 'Invalid reveal permission value');
      return;
    }

    state.room.usersCanReveal = msg.usersCanReveal;
    await this.save();
    this.broadcastState();
  }

  private async handleSetStoryUrl(
    sessionId: string,
    msg: { currentStoryUrl?: unknown }
  ): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    if (!this.requireAdmin(state, sessionId, 'update the story URL')) return;
    if (typeof msg.currentStoryUrl !== 'string') {
      this.replyError(sessionId, 'Invalid story URL');
      return;
    }

    state.room.currentStoryUrl = msg.currentStoryUrl;
    await this.save();
    this.broadcastState();
  }

  private async handlePromoteAdmin(
    sessionId: string,
    msg: { targetSessionId?: unknown; isAdmin?: unknown }
  ): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAdmin) {
      this.replyError(sessionId, 'Admin access required');
      return;
    }
    if (typeof msg.targetSessionId !== 'string') {
      this.replyError(sessionId, 'Missing target player');
      return;
    }
    const target = this.getParticipant(state, msg.targetSessionId);
    if (!target) {
      this.replyError(sessionId, 'Participant not found in this room');
      return;
    }

    const makeAdmin = msg.isAdmin !== false;
    if (makeAdmin) {
      // Single-admin rule: anointing a new admin un-admins everyone else.
      for (const p of state.participants) {
        p.isAdmin = false;
      }
    }
    target.isAdmin = makeAdmin;
    await this.save();
    this.broadcastState();
  }

  private async handleKick(sessionId: string, msg: { targetSessionId?: unknown }): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAdmin) {
      this.replyError(sessionId, 'Admin access required');
      return;
    }
    if (typeof msg.targetSessionId !== 'string') {
      this.replyError(sessionId, 'Missing target player');
      return;
    }
    if (msg.targetSessionId === sessionId) {
      this.replyError(sessionId, 'Cannot remove yourself from the room');
      return;
    }
    const target = this.getParticipant(state, msg.targetSessionId);
    if (!target) {
      this.replyError(sessionId, 'Participant not found in this room');
      return;
    }

    state.participants = state.participants.filter((p) => p.sessionId !== msg.targetSessionId);
    await this.save();
    this.broadcastState();

    // Tell the removed player and drop their connections. If the removed
    // player reconnects later (e.g. reloads the page) they simply rejoin.
    for (const connection of this.getConnections()) {
      if (getSessionId(connection) === msg.targetSessionId) {
        this.send(connection, { type: 'kicked' });
        connection.close(KICK_CLOSE_CODE, 'kicked');
      }
    }
  }

  private async handleSetAllowedVote(
    sessionId: string,
    msg: { targetSessionId?: unknown; isAllowedVote?: unknown }
  ): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    if (!this.requireAdmin(state, sessionId, 'update voting permissions')) {
      return;
    }
    if (typeof msg.targetSessionId !== 'string') {
      this.replyError(sessionId, 'Missing target player');
      return;
    }
    if (typeof msg.isAllowedVote !== 'boolean') {
      this.replyError(sessionId, 'Invalid voting permission value');
      return;
    }
    const target = this.getParticipant(state, msg.targetSessionId);
    if (!target) {
      this.replyError(sessionId, 'Participant not found in this room');
      return;
    }

    target.isAllowedVote = msg.isAllowedVote;
    await this.save();
    this.broadcastState();
  }

  private async handleLeave(sessionId: string): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    state.participants = state.participants.filter((p) => p.sessionId !== sessionId);
    await this.save();
    this.broadcastState();
  }

  private async handleDeleteRoom(sessionId: string): Promise<void> {
    const state = this.requireRoom();
    if (!state) return;
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return;
    }
    if (!participant.isAdmin) {
      this.replyError(sessionId, 'Admin access required');
      return;
    }

    this.room = null;
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();

    // Everyone is disconnected; on reconnect they are told the room is gone.
    for (const connection of this.getConnections()) {
      connection.close(1000, 'room deleted');
    }
  }

  /* ---------- Helpers ---------- */

  /** Returns the persisted room state, logging if the room is missing. */
  private requireRoom(): RoomState | null {
    if (!this.room) {
      console.warn(`[${this.name}] received a message for a missing room`);
    }
    return this.room;
  }

  private getParticipant(state: RoomState, sessionId: string): Participant | undefined {
    return state.participants.find((p) => p.sessionId === sessionId);
  }

  private requireAdmin(state: RoomState, sessionId: string, action: string): boolean {
    const participant = this.getParticipant(state, sessionId);
    if (!participant) {
      this.replyError(sessionId, 'Not a participant in this room');
      return false;
    }
    if (!participant.isAdmin) {
      this.replyError(sessionId, `Only admins can ${action}`);
      return false;
    }
    return true;
  }

  private replyError(sessionId: string, message: string): void {
    for (const connection of this.getConnections()) {
      if (getSessionId(connection) === sessionId) {
        this.send(connection, { type: 'error', message });
      }
    }
  }

  private send(connection: Connection, message: ServerMessage): void {
    connection.send(JSON.stringify(message));
  }

  private broadcastState(): void {
    if (!this.room) return;
    const message: ServerMessage = { type: 'state', state: this.room };
    this.broadcast(JSON.stringify(message));
  }

  private async save(): Promise<void> {
    if (!this.room) return;
    this.room.room.updatedAt = Date.now();
    await this.ctx.storage.put(ROOM_KEY, this.room);
    await this.scheduleCleanup();
  }

  private async scheduleCleanup(): Promise<void> {
    // Pushes the 30-day cleanup alarm forward on every change; replaces the
    // previous Convex cron jobs that swept inactive sessions and rooms.
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);
  }
}

/* ---------- Module helpers ---------- */

/**
 * Extracts the player's session id from the WebSocket upgrade URL.
 * The client always connects with `?session=<uuid>`, and the URL is
 * persisted on the connection so it survives hibernation.
 */
export function getSessionId(connection: Connection): string | null {
  if (!connection.uri) return null;
  try {
    const url = new URL(connection.uri);
    return url.searchParams.get('session');
  } catch {
    return null;
  }
}

function validateCreatePayload(payload: CreateRoomPayload): string | null {
  if (typeof payload.creatorSessionId !== 'string' || payload.creatorSessionId === '') {
    return 'Missing creator session';
  }
  if (typeof payload.creatorName !== 'string' || payload.creatorName === '') {
    return 'Missing creator name';
  }
  if (
    typeof payload.roomName !== 'string' ||
    (payload.roomName !== '' && (payload.roomName.length < 5 || payload.roomName.length > 20))
  ) {
    return 'Room name must be between 5 and 20 characters if specified';
  }
  if (!isVoteSystem(payload.voteSystem)) {
    return 'Unknown voting system';
  }
  return null;
}
