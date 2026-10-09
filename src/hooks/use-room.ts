import { useCallback, useEffect, useRef, useState } from 'react';
import { usePartySocket } from 'partysocket/react';
import {
  type ClientMessage,
  type Participant,
  type Room,
  type ServerMessage,
  type VoteSystem,
} from 'shared/protocol';

const PARTY_NAME = 'planning-room';

/** Where the connection stands from the player's point of view. */
export type RoomPhase =
  | 'loading' // no room state received yet
  | 'active' // room state is live
  | 'not-found' // the room does not exist
  | 'kicked'; // an admin removed us from the room

export interface RoomActions {
  vote: (vote: string) => void;
  reveal: (isRevealed: boolean) => void;
  resetVotes: () => void;
  setVoteSystem: (voteSystem: string) => void;
  setLocked: (isLocked: boolean) => void;
  setUsersCanReveal: (usersCanReveal: boolean) => void;
  setStoryUrl: (currentStoryUrl: string) => void;
  promoteAdmin: (targetSessionId: string) => void;
  kick: (targetSessionId: string) => void;
}

interface UseRoomOptions {
  roomSlug: string;
  sessionId: string;
  name: string;
  /** Called when the server rejects an operation. */
  onError?: (message: string) => void;
}

export interface UseRoomResult {
  room: Room | undefined;
  participants: Participant[];
  phase: RoomPhase;
  actions: RoomActions;
}

/**
 * Connects the player to a room over WebSocket and streams its state.
 *
 * Replaces the former pair of Convex live queries (room + participants) and
 * all `useSessionMutation` calls. One `PlanningRoom` Durable Object owns the
 * state; every change is broadcast to the room as a full snapshot.
 */
export function useRoom({
  roomSlug,
  sessionId,
  name,
  onError,
}: UseRoomOptions): UseRoomResult {
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<RoomPhase>('loading');

  // Latest values for use inside socket event handlers.
  const phaseRef = useRef<RoomPhase>(phase);
  phaseRef.current = phase;
  const socketRef = useRef<ReturnType<typeof usePartySocket> | null>(null);

  // Fallback for the "was removed while we were disconnected" case: once we
  // have seen ourselves in the room during this visit, a later snapshot that
  // no longer contains us means we were kicked offline.
  const everJoinedRef = useRef(false);

  const send = useCallback((message: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(message));
  }, []);

  const handleMessage = useCallback(
    (data: string) => {
      let message: ServerMessage;
      try {
        message = JSON.parse(data) as ServerMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case 'state':
          // A snapshot without our session implies we were removed from the
          // room (e.g. by an admin while we were offline).
          if (
            everJoinedRef.current &&
            !message.state.participants.some((p) => p.sessionId === sessionId)
          ) {
            everJoinedRef.current = false;
            setPhase('kicked');
            return;
          }
          if (
            message.state.participants.some((p) => p.sessionId === sessionId)
          ) {
            everJoinedRef.current = true;
          }
          setRoom(message.state.room);
          setParticipants(message.state.participants);
          setPhase('active');
          return;
        case 'room-not-found':
          setPhase('not-found');
          return;
        case 'kicked':
          setPhase('kicked');
          return;
        case 'error':
          onError?.(message.message);
          return;
      }
    },
    [onError, sessionId]
  );

  const ready = Boolean(roomSlug && sessionId && name);

  const socket = usePartySocket({
    room: roomSlug,
    party: PARTY_NAME,
    query: { session: sessionId },
    enabled: ready && phase !== 'kicked',
    onOpen: () => {
      // (Re)identify ourselves with the room on every connection. On a
      // reconnect this just refreshes our presence — the participant
      // record persists server-side and never adopts a new identity.
      if (phaseRef.current !== 'kicked') {
        send({ type: 'join', sessionId, name });
      }
    },
    onMessage: (event) => {
      if (typeof event.data === 'string') handleMessage(event.data);
    },
  });
  socketRef.current = socket;

  // If we were kicked, hang up for good so the auto-reconnector stops.
  useEffect(() => {
    if (phase === 'kicked') {
      socket.close();
    }
  }, [phase, socket]);

  const actions: RoomActions = {
    vote: (vote) => send({ type: 'vote', vote }),
    reveal: (isRevealed) => send({ type: 'reveal', isRevealed }),
    resetVotes: () => send({ type: 'reset-votes' }),
    setVoteSystem: (voteSystem) =>
      send({ type: 'set-vote-system', voteSystem: voteSystem as VoteSystem }),
    setLocked: (isLocked) => send({ type: 'set-locked', isLocked }),
    setUsersCanReveal: (usersCanReveal) =>
      send({ type: 'set-users-can-reveal', usersCanReveal }),
    setStoryUrl: (currentStoryUrl) =>
      send({ type: 'set-story-url', currentStoryUrl }),
    promoteAdmin: (targetSessionId) =>
      send({ type: 'promote-admin', targetSessionId }),
    kick: (targetSessionId) => send({ type: 'kick', targetSessionId }),
  };

  return { room, participants, phase, actions };
}
