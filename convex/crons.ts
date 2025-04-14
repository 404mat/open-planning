import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'clear inactive players',
  { hours: 6 },
  internal.players.clearInactivePlayers
);

export default crons;
