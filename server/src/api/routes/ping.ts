import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

export async function pingRoutes(server: FastifyInstance) {
  server.get(
    '/ping',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
            timestamp: Type.Number(),
          }),
        },
      },
    },
    async () => {
      return {
        message: 'pong',
        timestamp: Date.now(),
      };
    }
  );
}
