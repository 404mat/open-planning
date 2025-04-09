import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { CardSelector } from '@/features/room/card-selector';

// todo: delete this and replace with room card system
const POKER_CARDS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();
  const data = useQuery(api.rooms.get, { roomId: roomId });

  return (
    <div className="flex flex-col justify-between items-center w-full max-w-[1920px] py-5 h-screen">
      {/* header */}
      <div className="flex items-center justify-center">
        <h1 className="text-xl font-semibold">{data?.prettyName}</h1>
      </div>

      {/* table */}
      <div>table</div>

      {/* cards */}
      <div>
        <CardSelector
          cards={POKER_CARDS}
          selectedCard={null}
          onSelectCard={() => console.log('to be implemented')}
        />
      </div>
    </div>
  );
}
