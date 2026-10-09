import { bindings, defineConfig, exports } from 'cf/config';

/**
 * One Durable Object instance (`PlanningRoom`, PartyServer) per room owns
 * all room state. The binding below is how the Worker reaches it.
 */
export default defineConfig({
  worker: {
    name: 'open-planning',
    compatibilityDate: '2026-01-05',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: './server/worker.ts',
    observability: {
      enabled: true,
    },
    // Declares the live Durable Object class (replaces the Wrangler
    // `migrations` history; the class starts with SQLite storage).
    exports: {
      PlanningRoom: exports.durableObject({ storage: 'sqlite' }),
    },
    env: {
      PLANNING_ROOM: bindings.durableObject({
        worker: 'open-planning',
        exportName: 'PlanningRoom',
      }),
    },
  },
});
