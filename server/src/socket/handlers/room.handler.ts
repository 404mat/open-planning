import { Server, Socket } from 'socket.io';
import { Room, Participant, CallbackResponse } from '../types';
import { generateRoomId } from '../../utils/roomIdGenerator';
import { getIO } from '../service';
import { rooms } from '../store';

export function registerRoomSocketHandlers(socket: Socket) {
  console.log('Client connected:', socket.id);

  // Handle creating a new room
  socket.on(
    'create-room',
    (
      participantName: string,
      providedRoomId: string,
      callback: (response: CallbackResponse) => void
    ) => {
      const roomId = providedRoomId ?? generateRoomId();
      const room: Room = {
        id: roomId,
        participants: [
          {
            id: socket.id,
            name: participantName,
            isHost: true,
          },
        ],
        votes: {},
        revealed: false,
      };

      rooms.set(roomId, room);
      socket.join(roomId);

      callback({ roomId, room });
    }
  );

  // Handle joining a room
  socket.on(
    'join-room',
    (
      roomId: string,
      participantName: string,
      callback: (response: CallbackResponse) => void
    ) => {
      const room = rooms.get(roomId);

      if (!room) {
        callback({ error: 'Room not found' });
        return;
      }

      const participant: Participant = {
        id: socket.id,
        name: participantName,
        isHost: false,
      };

      room.participants.push(participant);
      socket.join(roomId);

      socket.to(roomId).emit('participant-joined', participant);
      callback({ room });
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
          getIO().to(roomId).emit('participant-left', socket.id);
        }
        break;
      }
    }
  });
}
