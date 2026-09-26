/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { SimulationService } from '../services/simulation.service';
import { SimulationInput } from '../models/simulation.model';

export class SimulationController {
  /**
   * POST /api/simulation/start
   * Body: SimulationInput
   */
  public static async startSimulation(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as SimulationInput;

      if (!body) {
        res.status(400).json({ error: 'Request body is empty.' });
        return;
      }

      if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
        res.status(400).json({ error: 'Latitude and Longitude numbers are required.' });
        return;
      }

      if (typeof body.oilQuantity !== 'number' || body.oilQuantity <= 0) {
        res.status(400).json({ error: 'oilQuantity must be a positive number (metric tonnes).' });
        return;
      }

      const result = await SimulationService.startSimulation(body);
      res.status(201).json(result);
    } catch (err: any) {
      console.error('[SimulationController] Error starting simulation:', err);
      res.status(500).json({
        error: 'Failed to execute oil spill simulation',
        details: err.message,
      });
    }
  }

  /**
   * GET /api/simulation/:id
   */
  public static async getSimulation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const sim = SimulationService.getSimulation(id);

    if (!sim) {
      res.status(404).json({ error: `Simulation with ID "${id}" not found.` });
      return;
    }

    res.status(200).json(sim);
  }

  /**
   * GET /api/simulation/:id/timeline
   */
  public static async getTimeline(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const timeline = SimulationService.getTimeline(id);

    if (!timeline) {
      res.status(404).json({ error: `Simulation with ID "${id}" not found.` });
      return;
    }

    res.status(200).json({
      simulationId: id,
      totalSteps: timeline.length,
      timeline,
    });
  }

  /**
   * GET /api/simulation/:id/measurements
   */
  public static async getMeasurements(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const measurements = SimulationService.getMeasurements(id);

    if (!measurements) {
      res.status(404).json({ error: `Simulation with ID "${id}" not found.` });
      return;
    }

    res.status(200).json({
      simulationId: id,
      measurements,
    });
  }

  /**
   * GET /api/simulation
   * Lists recent simulations
   */
  public static async listSimulations(req: Request, res: Response): Promise<void> {
    const list = SimulationService.listSimulations();
    res.status(200).json({
      count: list.length,
      simulations: list,
    });
  }
}
