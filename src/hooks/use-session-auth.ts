import { useCallback, useMemo } from 'react';
import {
  useSessionId,
  useSessionMutation,
  useSessionQuery,
} from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';

type Session = Doc<'sessions'>;

/**
 * Hook to manage user session authentication.
 * Uses SessionProvider's sessionId as the single source of truth.
 * The session is stored in localStorage and persists across browser restarts.
 *
 * @returns {object} - An object containing session state and control functions:
 *  - `sessionId: string | null`: The session ID from SessionProvider.
 *  - `session: Session | null`: The authenticated session data from the database.
 *  - `isLoading: boolean`: True while the session query is loading.
 *  - `showWelcomePopup: boolean`: True if no session exists and user needs to create one.
 *  - `createSession: (name: string) => Promise<void>`: Function to create a new session.
 *  - `logout: () => void`: Function to log out and regenerate session ID.
 */
export function useSessionAuth() {
  // Get the sessionId from SessionProvider (stored in localStorage)
  const [sessionId, refreshSessionId] = useSessionId();

  // Query for the current session using the sessionId
  // The queryWithSession custom function looks up the session by sessionId
  const sessionQueryResult = useSessionQuery(api.sessions.me, {});

  // Mutation to create a new session
  const createSessionMutation = useSessionMutation(api.sessions.create);

  // Derive session state
  const session = useMemo<Session | null>(() => {
    if (sessionQueryResult === undefined) return null;
    return sessionQueryResult;
  }, [sessionQueryResult]);

  // Loading state: true if query hasn't returned yet
  const isLoading = sessionQueryResult === undefined;

  // Show welcome popup if not loading and no session exists
  const showWelcomePopup = !isLoading && session === null;

  // Create a new session with the given name
  const createSession = useCallback(
    async (name: string) => {
      if (!name.trim()) return;

      try {
        await createSessionMutation({ name: name.trim() });
      } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
      }
    },
    [createSessionMutation]
  );

  // Logout: regenerate the session ID, effectively creating a new anonymous session
  const logout = useCallback(() => {
    // refreshSessionId generates a new UUID and updates localStorage
    // This effectively logs out the user since the new sessionId won't have a session doc
    refreshSessionId();
  }, [refreshSessionId]);

  return {
    sessionId,
    session,
    // Backwards compatibility aliases
    player: session,
    createPlayer: createSession,
    isLoading,
    showWelcomePopup,
    createSession,
    logout,
  };
}
