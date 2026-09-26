/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { EnvironmentController } from '../controllers/environment.controller';

const router = Router();

// STEP 1: Full Normalized Metocean Conditions
// GET /api/environment?latitude=...&longitude=...&timestamp=...
router.get('/', EnvironmentController.getEnvironment);

// STEP 2: Live Weather & 72-Hour Change Detection (OpenWeatherMap API)
// GET /api/environment/weather?latitude=...&longitude=...
router.get('/weather', EnvironmentController.getWeather);

// STEP 3: Global Fishing Watch (GFW) Vessel Tracking Intelligence
// GET /api/environment/vessels?latitude=...&longitude=...&radius=...
router.get('/vessels', EnvironmentController.getVessels);

// STEP 4: GFW Vessel Identity Resolution
// GET /api/environment/vessels/identity?query=...
router.get('/vessels/identity', EnvironmentController.getVesselIdentity);

// STEP 5: GFW Multi-Factor Maritime Vessel Risk Assessment
// POST /api/environment/vessels/risk-assessment
router.post('/vessels/risk-assessment', EnvironmentController.assessVesselRisk);

// STEP 6: GFW Apparent Fishing Effort (AFE) 4Wings Spatial Heatmap
// GET /api/environment/fishing-effort?latitude=...&longitude=...&radius=...
router.get('/fishing-effort', EnvironmentController.getFishingEffort);

export default router;
