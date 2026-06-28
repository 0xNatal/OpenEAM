// Vite build/dev config for the web SPA: enables the TanStack Router (file-based
// routes + code-splitting), React, and Tailwind plugins, and proxies /graphql,
// /health, and /api to the API during development.

import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_ORIGIN = process.env.VITE_DEV_API_ORIGIN ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/graphql': { target: API_ORIGIN, changeOrigin: true },
      '/health': { target: API_ORIGIN, changeOrigin: true },
      '/api': { target: API_ORIGIN, changeOrigin: true },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
