import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

//todo remove these values
const addButtonStyle =
  'bg-amber-100 p-2 rounded-md hover:bg-amber-300 active:bg-amber-500';
const voteButtonStyle =
  'bg-cyan-100 p-2 rounded-md hover:bg-cyan-300 active:bg-cyan-500';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();
  const data = useQuery(api.rooms.get, { roomId: roomId });

  // todo temporary test structure for backend integration
  const addingPerson = useMutation(api.rooms.addParticipant);
  function addParticipant() {
    addingPerson({ roomId: roomId, playerId: '1' });
  }

  return (
    <div className="p-32">
      <h1>{`Room ${data?.roomId ?? '...'}`}</h1>
      <h3>{`ID: ${data?._id}`}</h3>
      <br />
      <p>{`is revealed: ${data?.isRevealed}`}</p>
      <p>{`is locked: ${data?.isLocked}`}</p>
      <p>{`vote system: ${data?.voteSystem}`}</p>
      <br />
      <p>All participants and their vote :</p>
      {data?.participants.map((participant) => {
        return (
          <div>
            <p>{`id: ${participant.playerId}`}</p>
            <p>{`vote: ${participant.vote}`}</p>
          </div>
        );
      })}
      <br />
      <div className="flex gap-2">
        <button className={addButtonStyle} onClick={addParticipant}>
          Add random participant
        </button>
        <button className={addButtonStyle}>Remove random participant</button>
      </div>
      <br />
      <div className="flex gap-2">
        <button className={voteButtonStyle}>
          participant 1 vote random fibonacci
        </button>
        <button className={voteButtonStyle}>
          participant 2 vote random fibonacci
        </button>
      </div>
    </div>
  );
}
