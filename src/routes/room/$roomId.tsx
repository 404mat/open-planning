import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();
  return <div>{`Hello from room ${roomId}`}</div>;
}
