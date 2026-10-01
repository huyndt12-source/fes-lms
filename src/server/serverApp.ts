import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { seedDatabaseIfNeeded } from './db/seed';
import { authRouter } from './routes/authRoutes';
import { adminRouter } from './routes/adminRoutes';
import { studentRouter } from './routes/studentRoutes';
import { testRouter } from './routes/testRoutes';
import { authMiddleware } from './middleware/authMiddleware';

export async function bootstrap() {
  console.log('[FES Academy] Initializing database...');
  seedDatabaseIfNeeded();

  const app = express();

  // Middleware for parsing JSON and large file uploads (CSV / Excel)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Intercept and authenticate Firebase ID tokens for all API routes
  app.use('/api', authMiddleware);

  // Mount API Endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/test', testRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.log('[FES Academy] Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[FES Academy] Production mode: Serving static files from dist...');
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[FES Academy] Server successfully listening at http://0.0.0.0:${PORT}`);
      resolve();
    });
    server.on('error', reject);
  });
}
