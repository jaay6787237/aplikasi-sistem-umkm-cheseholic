/**
 * Cheeseholic Fullstack Node.js + Express + Vite Server
 * Provides REST Database APIs and mounts Vite middlewares in dev mode.
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/api';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Parse JSON payloads
  app.use(express.json());

  // Mount API Router
  app.use('/api', apiRouter);

  if (!isProd) {
    // In dev: load Vite server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In prod: serve compiled client assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cheeseholic Server] Running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
    console.log(`[Cheeseholic Database] API Endpoints ready at /api/* with x-api-key security.`);
  });
}

startServer().catch((err) => {
  console.error('[Cheeseholic Server] Startup error:', err);
  process.exit(1);
});
