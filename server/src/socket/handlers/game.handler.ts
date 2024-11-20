import { Socket } from 'socket.io';
import { getIO } from '../service';
import { rooms } from '../store';

export function registerGameSocketHandlers(socket: Socket) {
  // Handle submitting a vote
  socket.on('submit-vote', (roomId: string, vote: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.votes[socket.id] = vote;

    getIO().to(roomId).emit('vote-submitted', {
      participantId: socket.id,
      hasVoted: true,
    });
  });

  // Handle revealing votes (host only)
  socket.on('reveal-votes', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === socket.id);
    if (!participant?.isHost) return;

    room.revealed = true;
    getIO().to(roomId).emit('votes-revealed', room.votes);
  });

  // Handle starting a new round
  socket.on('start-new-round', (roomId: string, story: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === socket.id);
    if (!participant?.isHost) return;

    room.votes = {};
    room.revealed = false;
    room.currentStory = story;

    getIO().to(roomId).emit('round-started', { story });
  });
}
