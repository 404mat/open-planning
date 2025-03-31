import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();

  const data = useQuery(api.rooms.get, { roomId: roomId });

  return (
    <div>
      <p>{`Room ${data?.roomId ?? '...'}`}</p>
      <p>{`ID: ${data?._id}`}</p>
      <p>{`is revealed: ${data?.isRevealed}`}</p>
      <p>{`is locked: ${data?.isLocked}`}</p>
      <p>{`participants: ${data?.participants}`}</p>
      <p>{`vote system: ${data?.voteSystem}`}</p>
    </div>
  );
}
