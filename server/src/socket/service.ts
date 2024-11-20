import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerRoomSocketHandlers } from './handlers/room.handler';
import { registerGameSocketHandlers } from './handlers/game.handler';

let io: Server | null = null;

export function initializeSocketIO(httpServer: HttpServer) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

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
