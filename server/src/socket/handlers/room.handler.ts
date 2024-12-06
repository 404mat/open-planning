import { Socket } from 'socket.io';
import { Room, Participant, CallbackResponse } from '../types';
import { getIO } from '../service';
import { rooms } from '../store';
import { generateNameWithEmoji } from '../../utils/nameGenerator';
import { handleError } from '../../utils/errorUtils';

export function registerRoomSocketHandlers(socket: Socket) {
  console.log('Client connected:', socket.id);

  // Handle joining a room
  socket.on(
    'join-room',
    (
      roomId: string,
      participantName: string,
      callback: (response: CallbackResponse) => void
    ) => {
      const room: Room | undefined = rooms.get(roomId);

      if (!room) {
        handleError(callback, 'Room not found');
        return;
      }
      if (room.participants.find((el) => el.id === socket.id)) {
        handleError(callback, 'User is already part of the room');
        return;
      }

      const nameIsTaken = room.participants.find(
        (el) => el.name === participantName
      );

      const participant: Participant = {
        id: socket.id,
        name: nameIsTaken
          ? generateNameWithEmoji(participantName)
          : participantName,
        isHost: room.participants.length === 0 ? true : false,
      };

      room.participants.push(participant);
      socket.join(roomId);

      console.log(room);

      socket.to(roomId).emit('game-state', room);

      // if (callback) {
      //   callback({ room });
      // }
    }
  );

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      const participantIndex = room.participants.findIndex(
        (p) => p.id === socket.id
      );
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
        delete room.votes[socket.id];

        if (room.participants.length === 0) {
          rooms.delete(roomId);
        } else {
          getIO().to(roomId).emit('game-state', room);
        }
        break;
      }
    }
  });
}
