import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const sitesBundle = {
  name: 'sites-bundle',
  closeBundle() {
    mkdirSync('dist/server', { recursive: true });
    mkdirSync('dist/.openai', { recursive: true });
    copyFileSync('.openai/hosting.json', 'dist/.openai/hosting.json');
    writeFileSync(
      'dist/server/index.js',
      `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;
    const fallback = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallback, request));
  }
};
`,
    );
  },
};

export default defineConfig({
  plugins: [react(), sitesBundle],
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          database: ['@supabase/supabase-js'],
          framework: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
});
