import { Socket } from 'socket.io';
import { getIO } from '../service';
import { rooms, updateRoom } from '../store';
import { Room } from '../types';
import { handleError } from '../../utils/errorUtils';

export function registerGameSocketHandlers(socket: Socket) {
  // Handle submitting a vote
  socket.on('submit-vote', (roomId: string, vote: string) => {
    const room: Room | undefined = rooms.get(roomId);

    if (!room) {
      handleError(socket, `Room '${roomId}' not found`);
      return;
    }

    room.votes[socket.id] = vote ?? null;

    updateRoom(room);

    console.log(room);
    getIO().to(roomId).emit('game-state', room);
  });

  // Handle revealing votes (host only)
  socket.on('reveal-votes', (roomId: string) => {
    const room = rooms.get(roomId);

    if (!room) {
      handleError(socket, `Room '${roomId}' not found`);
      return;
    }

    const participant = room.participants.find((p) => p.id === socket.id);
    if (!participant?.isHost) {
      handleError(
        socket,
        'Participant is not host, and cannot reveal the votes'
      );
      return;
    }

    room.revealed = true;
    updateRoom(room);

    console.log(room);
    getIO().to(roomId).emit('game-state', room);
  });

  // Handle starting a new round
  socket.on('start-new-round', (roomId: string, story: string) => {
    const room = rooms.get(roomId);

    if (!room) {
      handleError(socket, `Room '${roomId}' not found`);
      return;
    }

    const participant = room.participants.find((p) => p.id === socket.id);
    if (!participant?.isHost) {
      handleError(
        socket,
        'Participant is not host, and cannot start a new round'
      );
      return;
    }

    Object.keys(room.votes).forEach((key) => {
      delete room.votes[key];
    });
    room.revealed = false;
    room.currentStory = story ?? null;
    updateRoom(room);

    console.log(room);
    getIO().to(roomId).emit('game-state', room);
  });
}
