import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'clear inactive players',
  { hours: 12 },
  internal.players.clearInactivePlayers
);

crons.interval(
  'clear inactive rooms',
  { hours: 12 },
  internal.rooms.clearInactiveRooms
);

export default crons;
