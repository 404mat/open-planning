import CookieBanner from '@/components/cookie-banner';
import HomepageAvatar from '@/components/homepage-avatar';
import RequiredInput from '@/components/inputs/required-input';
import SimpleInput from '@/components/inputs/simple-Input';
import PillComment from '@/components/pill-comment';
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
      <div className="flex flex-col items-center gap-4">
        <PillComment
          text={`Already used by <strong className="text-foreground font-medium">thousands</strong> of teams.`}
        />
        <h1>ScrumPokr</h1>

        {/* 2 main panels */}
        <div className="flex gap-6">
          <div className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md">
            <h4>Create a new room</h4>
            <SimpleInput
              label="Room name"
              helperText="Use a friendly and unique name"
            />
          </div>
          <div className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md">
            <h4>Join a room</h4>
            <RequiredInput label="Room name" />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px]">
        <CookieBanner />
      </div>
    </div>
  );
}
