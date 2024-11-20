import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import websocket from '@fastify/websocket';
import { registerRoutes } from './api/api';
import { initializeSocketIO } from './socket/service';

const server = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Register WebSocket support
server.register(websocket);

// Register API routes
server.register(registerRoutes);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Initialize Socket.IO
initializeSocketIO(server);

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
