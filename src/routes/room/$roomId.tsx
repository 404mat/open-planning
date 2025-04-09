import { createFileRoute } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { CardSelector } from '@/features/room/card-selector';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();

  const roomData = useSessionQuery(api.rooms.get, { roomId: roomId });

  const [selectedCard] = useState(null);

  return (
    <div className="flex flex-col justify-between items-center w-full max-w-[1920px] py-5 h-screen">
      {/* header */}
      <div className="flex items-center justify-center">
        <h1 className="text-xl font-semibold">{roomData?.prettyName}</h1>
      </div>

      {/* table */}
      <div>table</div>

      {/* cards */}
      <div>
        <CardSelector
          cards={getVotingSystemvalues(roomData?.voteSystem ?? '')}
          selectedCard={selectedCard}
          onSelectCard={() => console.log('to be implemented')}
        />
      </div>
    </div>
  );
}
