/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { AlertsService } from '../services/alerts.service';

export class AlertsController {
  /**
   * GET /api/alerts/incidents
   */
  public static async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const region = req.query.region as string | undefined;
      const severity = req.query.severity as string | undefined;
      const query = req.query.query as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const result = await AlertsService.getIncidents({
        region,
        severity,
        query,
        limit,
        offset,
      });

      res.json({
        success: true,
        total: result.total,
        count: result.incidents.length,
        incidents: result.incidents,
      });
    } catch (err: any) {
      console.error('[AlertsController] Error fetching incidents:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve incidents from ocean intelligence database',
        details: err?.message || err,
      });
    }
  }

  /**
   * GET /api/alerts/incident/:id
   */
  public static async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const incident = await AlertsService.getIncidentById(id);

      if (!incident) {
        res.status(404).json({
          success: false,
          error: `Incident with ID '${id}' not found`,
        });
        return;
      }

      res.json({
        success: true,
        incident,
      });
    } catch (err: any) {
      console.error('[AlertsController] Error retrieving incident details:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve incident dossier',
        details: err?.message || err,
      });
    }
  }

  /**
   * POST /api/alerts/scan
   */
  public static async runScan(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.body.type as 'MANUAL' | 'AUTO_10MIN') || 'MANUAL';
      const region = req.body.region as string | undefined;
      const excludeIds = Array.isArray(req.body.excludeIds) ? req.body.excludeIds : [];
      const forceOutcome = req.body.forceOutcome as 'SPILL' | 'NO_SPILL' | undefined;

      const result = await AlertsService.executeScan({
        type,
        region,
        excludeIds,
        forceOutcome,
      });

      res.json({
        success: true,
        scanResult: result.scanResult,
        newIncidents: result.newIncidents,
        totalAvailable: result.totalAvailable,
      });
    } catch (err: any) {
      console.error('[AlertsController] Error executing radar scan:', err);
      res.status(500).json({
        success: false,
        error: 'Radar surveillance scan failed',
        details: err?.message || err,
      });
    }
  }

  /**
   * GET /api/alerts/sources
   */
  public static async getSourcesStatus(req: Request, res: Response): Promise<void> {
    try {
      const sources = await AlertsService.getSourcesStatus();
      res.json({
        success: true,
        sources,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[AlertsController] Error retrieving sources status:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to check data sources status',
        details: err?.message || err,
      });
    }
  }
}
