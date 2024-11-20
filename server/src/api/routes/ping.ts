import { Router } from 'express';

export function pingRoutes() {
  const router = Router();

  router.get('/ping', (_req, res) => {
    res.json({
      message: 'pong',
      timestamp: Date.now(),
    });
  });

  return router;
}
