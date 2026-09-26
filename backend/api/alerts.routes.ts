/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { AlertsController } from '../controllers/alerts.controller';

const router = Router();

// GET /api/alerts/incidents - Retrieve normalized incidents with filtering
router.get('/incidents', AlertsController.getIncidents);

// GET /api/alerts/incident/:id - Retrieve full single incident record
router.get('/incident/:id', AlertsController.getIncidentById);

// POST /api/alerts/scan - Execute authentic data-driven manual or automated scan
router.post('/scan', AlertsController.runScan);

// GET /api/alerts/sources - Get operational status of connected feeds (NOAA, Copernicus, Open-Meteo)
router.get('/sources', AlertsController.getSourcesStatus);

export default router;
