import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { registerRoutes } from './api/api';
import { initializeSocketIO } from './socket/service';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Register API routes
registerRoutes(app);

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Socket.IO with the HTTP server
initializeSocketIO(httpServer);

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
