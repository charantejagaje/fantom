import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // PLATFORM_PROXY_TARGET lets the dev server point /api/v1 at the Dockerized
  // stack (e.g. http://localhost:8080) for end-to-end verification.
  // Default unchanged: local FastAPI platform backend on :8100.
  const platformTarget = process.env.PLATFORM_PROXY_TARGET || 'http://localhost:8100';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        // Multi-page build: platform.html must be emitted to dist/ or the
        // Docker/nginx deployment 500s on /platform.html (dev serves it from
        // source, which is why this only broke in Docker).
        input: {
          main: path.resolve(__dirname, 'index.html'),
          platform: path.resolve(__dirname, 'platform.html'),
          worker: path.resolve(__dirname, 'worker.html'),
        },
      },
    },
    server: {
      // Proxy API calls: /api/v1 -> FastAPI platform backend (port 8100);
      // all other /api paths -> legacy Express analytics API (port 8000).
      proxy: {
        '/api/v1': {
          target: platformTarget,
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
