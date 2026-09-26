/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { SimulationController } from '../controllers/simulation.controller';

const router = Router();

// POST /api/simulation/start - Initiates new simulation
router.post('/start', SimulationController.startSimulation);

// GET /api/simulation - List all simulations
router.get('/', SimulationController.listSimulations);

// GET /api/simulation/:id - Retrieve full simulation result
router.get('/:id', SimulationController.getSimulation);

// GET /api/simulation/:id/timeline - Retrieve full time-series timeline steps
router.get('/:id/timeline', SimulationController.getTimeline);

// GET /api/simulation/:id/measurements - Retrieve latest calculated measurements
router.get('/:id/measurements', SimulationController.getMeasurements);

export default router;
