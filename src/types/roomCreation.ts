import { type } from 'arktype';

export const createRoomSchema = type({
  roomName: type.string
    .atLeastLength(3)
    .describe('Room name must be at least 3 characters long.'),
});
