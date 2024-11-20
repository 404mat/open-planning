import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { generateRoomId } from '../../utils/roomIdGenerator';

export async function roomManagementRoutes(server: FastifyInstance) {
  server.get(
    '/new-room',
    {
      schema: {
        response: {
          200: Type.Object({
            roomId: Type.String(),
          }),
        },
      },
    },
    async () => {
      const roomId = generateRoomId();
      return {
        roomId,
      };
    }
  );
}
