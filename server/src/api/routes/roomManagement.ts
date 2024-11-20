import { Router } from 'express';
import { generateRoomId } from '../../utils/roomIdGenerator';

export function roomManagementRoutes() {
  const router = Router();

  router.get('/create-room', (_req, res) => {
    const roomId = generateRoomId();
    res.json({
      roomId: roomId,
    });
  });

  return router;
}
