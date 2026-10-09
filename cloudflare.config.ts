import { bindings, defineConfig, exports } from 'cf/config';

export default defineConfig(({ isPreview }) => ({
  worker: {
    name: 'open-planning',
    compatibilityDate: '2026-01-05',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: './server/worker.ts',
    observability: {
      enabled: true,
    },
    exports: {
      PlanningRoom: exports.durableObject({ storage: 'sqlite' }),
    },
    env: {
      PLANNING_ROOM: isPreview
        ? {
            type: 'unsafe:durable_object_namespace',
            class_name: 'PlanningRoom',
          }
        : bindings.durableObject({
            worker: 'open-planning',
            exportName: 'PlanningRoom',
          }),
    },
  },
}));
