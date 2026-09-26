/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { EnvironmentalDataService } from '../services/environmentalData.service';
import { WeatherProvider } from '../providers/weather.provider';
import { GfwProvider } from '../providers/gfw.provider';

export class EnvironmentController {
  /**
   * STEP 1: GET /api/environment
   * Full normalized metocean conditions (Weather + Ocean Currents + Waves + Region Context)
   */
  public static async getEnvironment(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, timestamp } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          error: 'Missing required query parameters: latitude and longitude are required.',
          example: '/api/environment?latitude=17.6500&longitude=83.4000',
        });
        return;
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        res.status(400).json({
          error: `Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180. Received (${latitude}, ${longitude}).`,
        });
        return;
      }

      const envData = await EnvironmentalDataService.getNormalizedEnvironment(
        lat,
        lng,
        timestamp ? (timestamp as string) : undefined
      );

      res.status(200).json(envData);
    } catch (err: any) {
      console.error('[EnvironmentController] Error fetching environmental data:', err);
      res.status(500).json({
        error: 'Failed to retrieve environmental conditions',
        details: err.message,
      });
    }
  }

  /**
   * STEP 2: GET /api/environment/weather
   * Dedicated OpenWeatherMap Live Weather & 72-Hour Change Detection
   */
  public static async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({ error: 'latitude and longitude are required' });
        return;
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ error: 'Invalid numeric coordinates' });
        return;
      }

      const weatherData = await WeatherProvider.getWeatherData(lat, lng);
      res.status(200).json(weatherData);
    } catch (err: any) {
      console.error('[EnvironmentController] Error fetching weather:', err);
      res.status(500).json({ error: 'Failed to fetch weather', details: err.message });
    }
  }

  /**
   * STEP 3: GET /api/environment/vessels
   * Global Fishing Watch (GFW) AIS Vessel Tracking Intelligence
   */
  public static async getVessels(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius } = req.query;

      const lat = latitude ? parseFloat(latitude as string) : 17.65;
      const lng = longitude ? parseFloat(longitude as string) : 83.4;
      const radiusNm = radius ? parseFloat(radius as string) : 30;

      const vesselData = await GfwProvider.searchVesselsAroundLocation(lat, lng, radiusNm);
      res.status(200).json(vesselData);
    } catch (err: any) {
      console.error('[EnvironmentController] Error querying GFW vessels:', err);
      res.status(500).json({ error: 'Failed to query GFW vessels', details: err.message });
    }
  }

  // =========================================================================
  // STEP 4: GET /api/environment/vessels/identity & /api/vessels/search
  // Resolve Vessel Identity with Strict Identifier Hierarchy & Provenance
  // =========================================================================
  public static async getVesselIdentity(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const searchQuery = (query as string) || '';

      const resolution = await GfwProvider.searchVesselIdentity(searchQuery);
      res.status(200).json(resolution);
    } catch (err: any) {
      console.error('[EnvironmentController] Error resolving vessel identity:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to resolve vessel identity', 
        details: err.message,
        identityStatus: 'IDENTITY_UNCONFIRMED',
      });
    }
  }

  // =========================================================================
  // STEP 5: POST /api/environment/vessels/risk-assessment
  // Assess Maritime Vessel Risk via GFW Behavioral Telemetry & Attribution
  // =========================================================================
  public static async assessVesselRisk(req: Request, res: Response): Promise<void> {
    try {
      const { vessel, spillOrigin } = req.body;

      if (!vessel) {
        res.status(400).json({ error: 'Vessel record is required in request body.' });
        return;
      }

      const assessment = GfwProvider.assessVesselRisk(vessel, spillOrigin);
      res.status(200).json({
        success: true,
        assessment,
      });
    } catch (err: any) {
      console.error('[EnvironmentController] Error assessing vessel risk:', err);
      res.status(500).json({ error: 'Failed to assess vessel risk', details: err.message });
    }
  }

  // =========================================================================
  // STEP 6: GET /api/environment/fishing-effort
  // Apparent Fishing Effort (AFE) Mapping & Heatmap Grid (GFW 4Wings)
  // =========================================================================
  public static async getFishingEffort(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius } = req.query;

      const lat = latitude ? parseFloat(latitude as string) : 18.92;
      const lng = longitude ? parseFloat(longitude as string) : 72.83;
      const radiusKm = radius ? parseFloat(radius as string) : 60;

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ error: 'Invalid numeric latitude/longitude' });
        return;
      }

      const effortData = GfwProvider.getApparentFishingEffort(lat, lng, radiusKm);
      res.status(200).json(effortData);
    } catch (err: any) {
      console.error('[EnvironmentController] Error retrieving apparent fishing effort:', err);
      res.status(500).json({ error: 'Failed to calculate apparent fishing effort', details: err.message });
    }
  }
}

