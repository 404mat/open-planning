import { FastifyInstance } from 'fastify';
import { pingRoutes } from './routes/ping';
import { roomManagementRoutes } from './routes/roomManagement';

export async function registerRoutes(server: FastifyInstance) {
  // Register all API routes
  await server.register(
    async (fastify) => {
      await pingRoutes(fastify);
      await roomManagementRoutes(fastify);
    },
    // Prefix all routes with /api
    { prefix: '/api' }
  );
}
