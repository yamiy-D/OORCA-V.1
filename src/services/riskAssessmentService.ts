/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DangerAssessment, 
  EcologicalInhabitant, 
  ShorelineImpact, 
  SimulationParameters 
} from '../types/simulation';
import { calculateDangerAssessment, calculateShorelineArrivals } from '../utils/riskCalculations';
import { DEFAULT_ECOLOGICAL_DATA } from '../data/ecologicalData';

export class RiskAssessmentService {
  private static instance: RiskAssessmentService;

  private constructor() {}

  public static getInstance(): RiskAssessmentService {
    if (!RiskAssessmentService.instance) {
      RiskAssessmentService.instance = new RiskAssessmentService();
    }
    return RiskAssessmentService.instance;
  }

  public assessDanger(params: SimulationParameters, elapsedHours: number): DangerAssessment {
    // Offshore distance approx 22 km
    const distanceKm = 22;
    return calculateDangerAssessment(
      params.spillDetails.amount,
      params.spillDetails.oilType,
      distanceKm,
      elapsedHours
    );
  }

  public getEcologicalRisks(params: SimulationParameters): EcologicalInhabitant[] {
    // In demo mode, return the curated habitat list from ecological data
    return DEFAULT_ECOLOGICAL_DATA;
  }

  public getShorelineImpacts(
    elapsedHours: number, 
    driftSpeedKts: number, 
    params?: SimulationParameters
  ): ShorelineImpact[] {
    return calculateShorelineArrivals(elapsedHours, driftSpeedKts, params);
  }
}

export const riskAssessmentService = RiskAssessmentService.getInstance();
