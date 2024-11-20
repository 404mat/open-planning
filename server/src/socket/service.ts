import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { registerRoomSocketHandlers } from './handlers/room.handler';
import { registerGameSocketHandlers } from './handlers/game.handler';

let io: Server | null = null;

export function initializeSocketIO(server: FastifyInstance) {
  if (io) return io;

  io = new Server(server.server);

  io.on('connection', (socket) => {
    registerRoomSocketHandlers(socket);
    registerGameSocketHandlers(socket);
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}
