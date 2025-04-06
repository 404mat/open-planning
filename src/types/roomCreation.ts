import { type } from 'arktype';

export const createRoomSchema = type({
  roomName: type.string
    .atLeastLength(5)
    .atMostLength(20)
    .or("''")
    .describe('Room name must be between 5 and 20 characters if specified.'),
});
