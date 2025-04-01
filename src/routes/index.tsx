import { api } from '@convex/_generated/api';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from 'convex/react';
import { useState } from 'react';

//todo remove these values
const addButtonStyle =
  'bg-amber-100 p-2 rounded-md hover:bg-amber-300 active:bg-amber-500';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [nameInputValue, setNameInputValue] = useState('');
  const [roomInputValue, setRoomInputValue] = useState('');

  const createRoomDb = useMutation(api.rooms.create);
  function createPlayerAndRoom() {
    createRoomDb({
      roomId: 'custom-name-room',
      playerId: '1',
      voteSystem: 'fibonacci',
    });
  }
  return (
    <div className="flex flex-col gap-3 items-center justify-center p-32">
      <h1>Welcome page</h1>

      <div>
        <form onSubmit={createPlayerAndRoom}>
          {' '}
          <label>
            Name:
            <input
              type="text"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              className="border-2"
            />{' '}
          </label>
          <label>
            Room:
            <input
              type="text"
              value={roomInputValue}
              onChange={(e) => setRoomInputValue(e.target.value)}
              className="border-2"
            />{' '}
          </label>
          <input type="submit" value="Submit" className={addButtonStyle} />
        </form>
      </div>
    </div>
  );
}
