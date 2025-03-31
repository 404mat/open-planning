import { query } from './_generated/server';
import { v } from 'convex/values';

export const getRooms = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
      .first();
    return room;
  },
});
