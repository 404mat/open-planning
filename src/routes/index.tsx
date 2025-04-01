import CookieBanner from '@/components/cookie-banner';
import HomepageAvatar from '@/components/homepage-avatar';
import PillComment from '@/components/pill-comment';
import { CreateRoomBox } from '@/features/homepage/create-room-box';
import { JoinRoomBox } from '@/features/homepage/join-room-box';
import { api } from '@convex/_generated/api';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from 'convex/react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const createRoomDb = useMutation(api.rooms.create);
  function createPlayerAndRoom() {
    createRoomDb({
      roomId: 'custom-name-room',
      playerId: '1',
      voteSystem: 'fibonacci',
    });
  }
  return (
    <div className="flex flex-col justify-between py-8 items-center h-screen">
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
          <h1 className="font-bold text-5xl">ScrumPokr</h1>
        </div>

        {/* 2 main panels */}
        <div className="flex gap-6">
          <CreateRoomBox />
          <JoinRoomBox />
        </div>
      </div>

      <div className="max-w-[1440px]">
        <CookieBanner />
      </div>
    </div>
  );
}
