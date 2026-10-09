import { useCallback, useState } from 'react';
import {
  loadSession,
  resetSession,
  saveSessionName,
  type SessionInfo,
} from '@/integrations/session';

/**
 * Hook to manage user session authentication.
 *
 * The session (id + display name) is kept in localStorage as the single
 * source of truth and persists across browser restarts. It replaces the
 * previous Convex-backed session: the room Durable Object records the
 * player when their socket joins, so no server round-trip is needed here.
 *
 * @returns {object} - An object containing session state and control functions:
 *  - `sessionId: string`: The player's stable UUID.
 *  - `session: SessionInfo | null`: The authenticated session data (null until named).
 *  - `isLoading: boolean`: Always false — the session is read synchronously.
 *  - `showWelcomePopup: boolean`: True if no name exists yet and the player needs to create one.
 *  - `createSession: (name: string) => Promise<void>`: Function to set the player's name.
 *  - `logout: () => void`: Function to log out and regenerate the session ID.
 */
export function useSessionAuth() {
  const [session, setSession] = useState<SessionInfo>(() => loadSession());

  // The session is read synchronously from localStorage; there is no
  // asynchronous load anymore, but the flag is kept for API compatibility.
  const isLoading = false;

  // Show welcome popup if the player has no name yet
  const showWelcomePopup = !isLoading && session.name === null;

  // Authenticated session data, null until the name is chosen
  const authedSession = session.name === null ? null : session;

  // Create a new session with the given name
  const createSession = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setSession(saveSessionName(name.trim()));
  }, []);

  // Logout: regenerate the session ID and clear the name, effectively
  // creating a new anonymous session
  const logout = useCallback(() => {
    setSession(resetSession());
  }, []);

  return {
    sessionId: session.sessionId,
    session: authedSession,
    // Backwards compatibility aliases
    player: authedSession,
    createPlayer: createSession,
    isLoading,
    showWelcomePopup,
    createSession,
    logout,
  };
}
