import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();

  const data = useQuery(api.rooms.getRooms, { roomId: roomId });

  return (
    <div>
      {`Room ${roomId}`}
      <p>{data?.currentStoryUrl ?? 'No room found yet'}</p>
    </div>
  );
}
