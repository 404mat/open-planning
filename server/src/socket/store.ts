import { Room } from './types';

// Store rooms in memory (consider using Redis for production)
export const rooms = new Map<string, Room>();
