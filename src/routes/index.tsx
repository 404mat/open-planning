import CookieBanner from '@/components/cookie-banner';
import HomepageAvatar from '@/components/homepage-avatar';
import PillComment from '@/components/pill-comment';
import { CreateRoomBox } from '@/features/homepage/create-room-box';
import { JoinRoomBox } from '@/features/homepage/join-room-box';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { SESSION_ID_KEY } from '@/lib/constants';
import { getLocalStorageValue, setLocalStorageValue } from '@/lib/localStorage';
import { api } from '@convex/_generated/api';
import { createFileRoute } from '@tanstack/react-router';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');

  const createPlayer = useSessionMutation(api.players.create);

  async function createNewPlayer(): Promise<string> {
    const { sessionId } = await createPlayer({ name: playerName });
    return sessionId;
  }

  useEffect(() => {
    const result = getLocalStorageValue(SESSION_ID_KEY);
    if (result) {
      setSessionId(result);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-background py-8 realtive">
      <div className="flex flex-col justify-between items-center w-full gap-20">
        {/* top navbar */}
        <div className="flex justify-end w-full max-w-[1440px] px-4">
          <HomepageAvatar />
        </div>

        {/* main content */}
        <div className="flex flex-col items-center gap-16">
          <div className="flex flex-col gap-4 items-center">
            <PillComment
              text={`Already used by <strong className="text-foreground font-medium">thousands</strong> of teams.`}
            />
            <h1 className="font-bold text-5xl">OpenPlanning</h1>
          </div>

          {/* 2 main panels */}
          <div className="flex gap-6">
            <CreateRoomBox />
            <JoinRoomBox />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px]">
        <CookieBanner />
      </div>

      {/* welcome popup */}
      {!sessionId && (
        <div className="absolute top-0 left-0 h-screen w-screen flex items-center justify-center">
          <WelcomePopup
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onClose={() => {
              console.log('Player name entered:', playerName);
              createNewPlayer().then((sessionId) => {
                setSessionId(sessionId);
                setLocalStorageValue(SESSION_ID_KEY, sessionId);
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
