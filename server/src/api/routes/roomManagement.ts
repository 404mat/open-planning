import { Router } from 'express';
import { generateRoomId, isValidRoomId } from '../../utils/roomIdGenerator';
import { roomExists, createRoom } from '../../socket/store';
import { NewRoomResponse } from '@poker-planning/shared/dist/models/api/NewRoomResponse';
import { ApiError } from '@poker-planning/shared/dist/models/api/ApiError';

export function roomManagementRoutes() {
  const router = Router();

  router.post('/create-room/:id?', (_req, res) => {
    const roomId = _req.params['id'] ?? generateRoomId();

    if (!isValidRoomId(roomId)) {
      res.status(400).json({
        message: 'Provided room name is not valid',
      });
    }
    if (roomExists(roomId)) {
      res.status(400).json({
        message: 'Room already exists.',
      });
    }

    if (createRoom(roomId)) {
      res.status(200).json({
        roomId: roomId,
        socketConnection: 'join-room',
      } as NewRoomResponse);
    } else {
      res.status(500).json({
        message: 'Could not create room.',
      } as ApiError);
    }
  });

  return router;
}
