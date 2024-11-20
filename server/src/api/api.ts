import { Express } from 'express';
import { pingRoutes } from './routes/ping';
import { roomManagementRoutes } from './routes/roomManagement';

export function registerRoutes(app: Express) {
  // Register all routes under /api
  app.use('/api', pingRoutes());
  app.use('/api', roomManagementRoutes());
}
