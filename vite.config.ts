import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

const config = defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      shared: new URL('./shared', import.meta.url).pathname,
    },
  },
  // The Worker (SSR) environment runs inside workerd via the Cloudflare
  // plugin; pre-bundling churn there crashes the runner on cold starts.
  environments: {
    ssr: {
      optimizeDeps: {
        noDiscovery: true,
      },
    },
  },
  plugins: [
    devtools(),
    // The Cloudflare plugin must come before tanstackStart: it turns the
    // Worker entrypoint (cloudflare.config.ts `worker.entrypoint`) into the
    // input of the "ssr" environment, both in dev and for builds.
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      compiler: true,
    }),
  ],
});

export default config;
