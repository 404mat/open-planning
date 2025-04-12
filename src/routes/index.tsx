import CookieBanner from '@/components/cookie-banner';
import NameAvatar from '@/components/name-avatar';
import PillComment from '@/components/pill-comment';
import { CreateRoomBox } from '@/features/homepage/create-room-box';
import { JoinRoomBox } from '@/features/homepage/join-room-box';
import { SocialLinks } from '@/features/homepage/social-links';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSessionAuth } from '@/hooks/useSessionAuth';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [playerName, setPlayerName] = useState('');

  const { sessionId, player, showWelcomePopup, createPlayer } =
    useSessionAuth();

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-background py-8 realtive">
      <div className="flex flex-col justify-between items-center w-full gap-20">
        {/* top navbar */}
        <div className="flex justify-between items-center w-full max-w-[1440px] px-4">
          <SocialLinks />
          <div
            className={`${sessionId ? '' : 'opacity-0 pointer-events-none'}`}
          >
            <NameAvatar userName={player?.name ?? ''} />
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

      {/* welcome popup - Show based on hook state */}
      {/* Optionally add !isLoading check if popup shouldn't flash during initial load */}
      {showWelcomePopup && (
        <div className="absolute top-0 left-0 h-screen w-screen flex items-center justify-center">
          <WelcomePopup
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onClose={() => {
              if (playerName.trim()) {
                createPlayer(playerName.trim());
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
