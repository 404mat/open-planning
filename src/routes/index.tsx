import CookieBanner from '@/components/cookie-banner';
import HomepageAvatar from '@/components/homepage-avatar';
import PillComment from '@/components/pill-comment';
import { CreateRoomBox } from '@/features/homepage/create-room-box';
import { JoinRoomBox } from '@/features/homepage/join-room-box';
import { SocialLinks } from '@/features/homepage/social-links';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { SESSION_ID_KEY } from '@/lib/constants';
import { getLocalStorageValue, setLocalStorageValue } from '@/lib/localStorage';
import { api } from '@convex/_generated/api';
import { createFileRoute } from '@tanstack/react-router';
import {
  useSessionMutation,
  useSessionQuery,
} from 'convex-helpers/react/sessions';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');

  // State to track if we've checked local storage initially
  const [initialLocalStorageId, setInitialLocalStorageId] = useState<
    string | null
  >(null);
  const [checkedInitialId, setCheckedInitialId] = useState(false);

  // player creation
  const createPlayer = useSessionMutation(api.players.create);
  async function createNewPlayer(): Promise<string> {
    const { sessionId: newSessionId } = await createPlayer({
      name: playerName,
    });
    return newSessionId;
  }

  // player fetching
  const foundPlayer = useSessionQuery(api.players.find, {
    localSessionId: sessionId ?? 'skip',
  });

  // ------ INIT SEQUENCE ------ //

  // 1. Read initial sessionId from localStorage on mount and set state
  useEffect(() => {
    const storedSessionId = getLocalStorageValue(SESSION_ID_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId); // Trigger query with the stored id
      setInitialLocalStorageId(storedSessionId); // Keep track of original local id
    }
    setCheckedInitialId(true);
  }, []);

  // 2. Validate the session id once the query result is available or initial check is done
  useEffect(() => {
    // Only run validation *after* the initial check and if we initially found an ID
    if (checkedInitialId && initialLocalStorageId) {
      // foundPlayer can be undefined during loading state
      if (foundPlayer === null) {
        // If query ran (foundPlayer is not undefined) and returned null (player not found)
        setSessionId(null);
        setInitialLocalStorageId(null);
        setLocalStorageValue(SESSION_ID_KEY, '');
      } else if (foundPlayer?.sessionId === initialLocalStorageId) {
        // Player found and matches the initial ID, ensure state is correct
        setSessionId(initialLocalStorageId);
      }
      // If foundPlayer is still undefined, the query is likely still loading, do nothing yet.
    } else if (checkedInitialId && !initialLocalStorageId) {
      // If we checked initially and found no ID, ensure state is null
      setSessionId(null);
    }
  }, [foundPlayer, initialLocalStorageId, checkedInitialId]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-background py-8 realtive">
      <div className="flex flex-col justify-between items-center w-full gap-20">
        {/* top navbar */}
        <div className="flex justify-between items-center w-full max-w-[1440px] px-4">
          {/* todo add github and social informations here */}
          <SocialLinks />
          <div
            className={`${sessionId ? '' : 'opacity-0 pointer-events-none'}`}
          >
            <HomepageAvatar userName={foundPlayer?.name} />
          </div>
        </div>

        {/* main content */}
        <div className="flex flex-col justify-between items-center gap-8">
          <div className="flex flex-col gap-4 items-center">
            <PillComment
              text={`Already used by <strong className="text-foreground font-medium">thousands</strong> of teams.`}
            />
            <h1 className="font-brand font-bold text-6xl">OpenPlanning</h1>
          </div>

          {/* 2 main panels */}
          <div className="flex gap-6">
            <CreateRoomBox />
            <JoinRoomBox />
          </div>
          <p className="text-center text-sm text-muted-foreground max-w-lg">
            OpenPlanning is an open-source poker planning application designed
            to facilitate collaborative estimation and planning sessions.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px]">
        <CookieBanner />
      </div>

      {/* welcome popup - Show if checkedInitialId is true AND sessionId is null */}
      {checkedInitialId && !sessionId && (
        <div className="absolute top-0 left-0 h-screen w-screen flex items-center justify-center">
          <WelcomePopup
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onClose={() => {
              if (playerName.trim()) {
                // Only create if name is not empty
                console.log('Player name entered:', playerName);
                createNewPlayer().then((newSessionId) => {
                  setSessionId(newSessionId);
                  setLocalStorageValue(SESSION_ID_KEY, newSessionId);
                  setInitialLocalStorageId(newSessionId); // Update tracked initial id
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
