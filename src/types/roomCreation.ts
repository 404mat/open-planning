import { type } from 'arktype';

const RoomNameType = type.string
  .atLeastLength(5)
  .atMostLength(20)
  .or("''")
  .describe('Room name must be between 5 and 20 characters if specified.');

export const createRoomSchema = type({
  roomName: RoomNameType,
  voteSystem: type("'fibonacci' | 'tshirt' | 'numbers'").default('fibonacci'),
  playerReveal: type('boolean').default(true),
  playerChangeVote: type('boolean').default(false),
  playerAddTicket: type('boolean').default(false),
});
