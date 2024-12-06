import { Socket } from 'socket.io';
import { Room, Participant } from '../types';
import { getIO } from '../service';
import { rooms, updateRoom } from '../store';
import { generateNameWithEmoji } from '../../utils/nameGenerator';
import { handleError } from '../../utils/errorUtils';

export function registerRoomSocketHandlers(socket: Socket) {
  console.log('Client connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', (roomId: string, data: any) => {
    const room: Room | undefined = rooms.get(roomId);

    if (!room) {
      handleError(socket, `Room '${roomId}' not found`);
      return;
    }
    if (room.participants.find((el) => el.id === socket.id)) {
      handleError(socket, `User '${roomId}' is already part of the room`);
      return;
    }

    // TODO: generate name if not provided before checking for duplicates

    const nameIsTaken = room.participants.find(
      (el) => el.name === data?.participantName
    );

    const participant: Participant = {
      id: socket.id,
      name: nameIsTaken
        ? generateNameWithEmoji(data?.participantName)
        : data?.participantName,
      isHost: room.participants.length === 0 ? true : false,
    };

    room.participants.push(participant);
    updateRoom(room);

    socket.join(roomId);

    console.log(room);
    socket.to(roomId).emit('game-state', room);
  });

  // Handle leaving a room
  socket.on('leave-room', (roomId: string) => {
    const room: Room | undefined = rooms.get(roomId);

    if (!room) {
      handleError(socket, `Room '${roomId}' not found`);
      return;
    }

    const indexOfParticipant = room.participants.findIndex(
      (el) => el.id === socket.id
    );
    if (indexOfParticipant !== -1) {
      room.participants.splice(indexOfParticipant, 1);
    }

    updateRoom(room);

    console.log(room);
    socket.to(roomId).emit('game-state', room);
  });

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
