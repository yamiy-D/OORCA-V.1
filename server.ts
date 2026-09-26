/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import simulationRoutes from './backend/api/simulation.routes';
import environmentRoutes from './backend/api/environment.routes';
import alertsRoutes from './backend/api/alerts.routes';
import { EnvironmentController } from './backend/controllers/environment.controller';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = '0.0.0.0';

  // Request body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic CORS headers for local/cross-origin calls
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health and API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'OORCA Ocean Simulation Backend Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Simulation, Environmental Data & Ocean Intelligence Alerts APIs
  app.use('/api/simulation', simulationRoutes);
  app.use('/api/environment', environmentRoutes);
  app.use('/api/alerts', alertsRoutes);

  // Dedicated Maritime Vessel Search & Identity Resolution endpoint (Section 17 requirement)
  app.get('/api/vessels/search', EnvironmentController.getVesselIdentity);

  // Vite middleware for development vs Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware integrated in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production static assets from ${distPath}`);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[OORCA] Simulation Engine server active at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error starting OORCA backend server:', err);
  process.exit(1);
});
