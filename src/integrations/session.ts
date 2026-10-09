/**
 * Browser-side session identity.
 *
 * Replaces the Convex-helpers `SessionProvider`: the same UUID that used to
 * live in `open-planning-session-id` is still the player's identity, and the
 * display name is now kept next to it in localStorage instead of in a
 * `sessions` table on the server.
 */

const SESSION_ID_KEY = 'open-planning-session-id';
const SESSION_NAME_KEY = 'open-planning-session-name';

export interface SessionInfo {
  sessionId: string;
  /** `null` until the player picks a name in the welcome popup. */
  name: string | null;
}

function createSessionId(): string {
  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

function persistSession(session: SessionInfo): SessionInfo {
  localStorage.setItem(SESSION_ID_KEY, session.sessionId);
  if (session.name === null) {
    localStorage.removeItem(SESSION_NAME_KEY);
  } else {
    localStorage.setItem(SESSION_NAME_KEY, session.name);
  }
  return session;
}

/** Loads (or initializes) the local session. Safe to call during render. */
export function loadSession(): SessionInfo {
  if (typeof window === 'undefined') {
    return { sessionId: '', name: null };
  }

  const storedId = localStorage.getItem(SESSION_ID_KEY);
  const storedName = localStorage.getItem(SESSION_NAME_KEY);
  return {
    sessionId: storedId ?? createSessionId(),
    name: storedName ?? null,
  };
}

/** Stores the player's display name (completing the session). */
export function saveSessionName(name: string): SessionInfo {
  return persistSession({ ...loadSession(), name });
}

/**
 * Logs out: regenerates the session UUID and clears the name, so the next
 * visit behaves like a brand-new player (same as refreshing the old
 * SessionProvider id).
 */
export function resetSession(): SessionInfo {
  localStorage.removeItem(SESSION_NAME_KEY);
  const sessionId = crypto.randomUUID();
  return persistSession({ sessionId, name: null });
}
