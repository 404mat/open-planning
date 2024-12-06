import { Socket } from 'socket.io';
import { getIO } from '../service';
import { rooms } from '../store';
import { CallbackResponse, Room } from '../types';
import { handleError } from '../../utils/errorUtils';

export function registerGameSocketHandlers(socket: Socket) {
  // Handle submitting a vote
  socket.on(
    'submit-vote',
    (
      roomId: string,
      vote: string,
      callback: (response: CallbackResponse) => void
    ) => {
      const room: Room | undefined = rooms.get(roomId);

      if (!room) {
        handleError(callback, 'Room not found');
        return;
      }

      room.votes[socket.id] = vote;

      getIO().to(roomId).emit('game-state', room);
    }
  );

  // Handle revealing votes (host only)
  socket.on(
    'reveal-votes',
    (roomId: string, callback: (response: CallbackResponse) => void) => {
      const room = rooms.get(roomId);

      if (!room) {
        handleError(callback, 'Room not found');
        return;
      }

      const participant = room.participants.find((p) => p.id === socket.id);
      if (!participant?.isHost) {
        handleError(
          callback,
          'Participant is not host, and cannot reveal the votes'
        );
        return;
      }

      room.revealed = true;

      getIO().to(roomId).emit('game-state', room);
    }
  );

  // Handle starting a new round
  socket.on(
    'start-new-round',
    (
      roomId: string,
      story: string,
      callback: (response: CallbackResponse) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const participant = room.participants.find((p) => p.id === socket.id);
      if (!participant?.isHost) return;

      room.votes = {};
      room.revealed = false;
      room.currentStory = story;

      getIO().to(roomId).emit('game-state', room);
    }
  );
}
