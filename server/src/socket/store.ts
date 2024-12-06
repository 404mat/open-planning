import { Room } from './types';

// Store rooms in memory (consider using Redis for production)
export const rooms = new Map<string, Room>();

export function roomExists(roomId: string): boolean {
  return rooms.get(roomId) !== (null || undefined);
}

export function createRoom(roomId: string): boolean {
  const room: Room = {
    id: roomId,
    participants: [],
    votes: {},
    revealed: false,
  };
  rooms.set(roomId, room);
  return true;
}

export function deleteRoom(roomId: string): boolean {
  rooms.delete(roomId);
  return true;
}
