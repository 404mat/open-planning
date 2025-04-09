import { useEffect, useState } from 'react';
import {
  useSessionMutation,
  useSessionQuery,
} from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { getLocalStorageValue, setLocalStorageValue } from '@/lib/localStorage';
import { SESSION_ID_KEY } from '@/lib/constants';

type Player = Doc<'players'>;

/**
 * Hook to manage user session authentication and welcome popup display.
 * Handles reading session ID from localStorage, validating it with the backend,
 * and creating a new player/session if needed via a welcome popup.
 *
 * @returns {object} - An object containing session state and control functions:
 *  - `sessionId: string | null`: The validated session ID, or null if not authenticated.
 *  - `player: Player | null`: The authenticated player data, or null.
 *  - `isLoading: boolean`: True during the initial session check.
 *  - `showWelcomePopup: boolean`: True if the welcome popup should be displayed.
 *  - `createPlayer: (name: string) => Promise<void>`: Function to create a new player.
 */
export function useSessionAuth() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Internal state for initial check
  const [checkedInitialId, setCheckedInitialId] = useState(false);
  const [initialLocalStorageId, setInitialLocalStorageId] = useState<
    string | null
  >(null);

  // 1. Read initial sessionId from localStorage on mount
  useEffect(() => {
    const storedSessionId = getLocalStorageValue(SESSION_ID_KEY);
    if (storedSessionId) {
      setInitialLocalStorageId(storedSessionId);
    }
    setCheckedInitialId(true);
    // We don't set isLoading false here yet, wait for validation
  }, []);

  // 2. Query to find player based on the initial ID (if any)
  const foundPlayer = useSessionQuery(api.players.find, {
    // Use 'skip' if no ID was found initially to prevent unnecessary query
    localSessionId: initialLocalStorageId ?? 'skip',
  });

  // 3. Validate the session ID once the query result is available or initial check is done
  useEffect(() => {
    // Only run validation *after* the initial check
    if (!checkedInitialId) {
      return;
    }

    if (initialLocalStorageId) {
      // Case 1: We found an ID in localStorage initially
      if (foundPlayer === undefined) {
        // Query is still loading, wait...
        setIsLoading(true);
        return;
      }

      if (foundPlayer === null) {
        // Query finished, but player not found (invalid/expired session)
        console.log('Session ID invalid, clearing...');
        setLocalStorageValue(SESSION_ID_KEY, '');
        setSessionId(null);
        setPlayer(null);
        setShowWelcomePopup(true);
        setInitialLocalStorageId(null);
      } else {
        // Query finished, player found (valid session)
        console.log('Session ID valid:', foundPlayer.sessionId);
        setSessionId(foundPlayer.sessionId);
        setPlayer(foundPlayer);
        setShowWelcomePopup(false);
        // Ensure localStorage is up-to-date (redundant but safe)
        setLocalStorageValue(SESSION_ID_KEY, foundPlayer.sessionId);
      }
    } else {
      // Case 2: No ID found in localStorage initially
      console.log('No initial Session ID found.');
      setSessionId(null);
      setPlayer(null);
      setShowWelcomePopup(true);
    }

    // Validation complete (or determined unnecessary)
    setIsLoading(false);
  }, [foundPlayer, initialLocalStorageId, checkedInitialId]);

  // 4. Mutation to create a new player
  const createPlayerMutation = useSessionMutation(api.players.create);

  // 5. Function to handle player creation
  const createPlayer = async (name: string) => {
    if (!name.trim()) return; // Avoid creating player with empty name

    setIsLoading(true); // Show loading state during creation
    try {
      const { sessionId: newSessionId, playerId } = await createPlayerMutation({
        name: name.trim(),
      });
      console.log('Player created, new Session ID:', newSessionId);
      setLocalStorageValue(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);
      // Set player state immediately based on creation result
      setPlayer({
        _id: playerId, // Note: The mutation returns playerId, not _id. Adjust if your Player type expects _id.
        _creationTime: Date.now(),
        name: name.trim(),
        playerId: playerId,
        sessionId: newSessionId,
        lastSeenAt: Date.now(),
      } as Player);
      setShowWelcomePopup(false);
      setInitialLocalStorageId(newSessionId); // Update tracked initial ID
    } catch (error) {
      console.error('Failed to create player:', error);
      // todo: handle error state, show toast, etc.
    } finally {
      setIsLoading(false);
    }
  };

  return { sessionId, player, isLoading, showWelcomePopup, createPlayer };
}
