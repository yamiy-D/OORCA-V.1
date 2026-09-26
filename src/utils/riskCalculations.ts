/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DangerAssessment, ShorelineImpact, RiskLevel, OverallRisk, SimulationParameters } from '../types/simulation';
import { DEFAULT_SHORELINE_DATA } from '../data/shorelineData';

export function calculateDangerAssessment(
  tonnes: number,
  oilType: string,
  distanceToShoreKm: number,
  elapsedHours: number
): DangerAssessment {
  // Score based on oil toxicity and persistence
  let toxicityScore = 3; // 1 to 5
  if (oilType === 'Heavy Fuel Oil' || oilType === 'Marine Fuel Oil') toxicityScore = 4.5;
  else if (oilType === 'Crude Oil') toxicityScore = 4.0;
  else if (oilType === 'Diesel') toxicityScore = 3.2;

  // Volume score
  const volumeScore = Math.min(5, (tonnes / 30));

  // Proximity score (closer to shore = higher risk)
  const proximityScore = Math.max(1, 5 - (distanceToShoreKm / 15));

  const aggregateScore = (toxicityScore * 0.35) + (volumeScore * 0.35) + (proximityScore * 0.30);

  let overallRisk: OverallRisk = 'HIGH';
  if (aggregateScore >= 4.0 || tonnes >= 80) overallRisk = 'HIGH';
  else if (aggregateScore >= 2.8) overallRisk = 'MEDIUM';
  else overallRisk = 'LOW';

  let riskToEnvironment: RiskLevel = tonnes > 50 ? 'High' : 'Medium';
  let riskToShoreline: RiskLevel = distanceToShoreKm < 25 ? 'High' : 'Medium';
  let riskToHumanHealth: RiskLevel = 'Medium';
  let cleanUpDifficulty: RiskLevel = (oilType === 'Crude Oil' || oilType === 'Heavy Fuel Oil') && tonnes > 40 ? 'High' : 'Medium';

  return {
    overallRisk,
    riskToEnvironment,
    riskToShoreline,
    riskToHumanHealth,
    cleanUpDifficulty,
  };
}

export function calculateShorelineArrivals(
  elapsedHours: number,
  driftSpeedKts: number,
  params?: SimulationParameters
): ShorelineImpact[] {
  // Update arrival time windows based on current elapsed simulation hour
  return DEFAULT_SHORELINE_DATA.map((shore) => {
    // Dynamic arrival window
    let arrivalTime = shore.arrivalTime;
    let impactLevel = shore.impactLevel;
    let location = shore.location;
    let coordinates = shore.coordinates;

    if (shore.id === 'shore-1' && params?.vesselDetails?.vesselName) {
      const locArea = params.location?.locationName
        ? params.location.locationName.split(',')[0].trim()
        : 'Bay of Bengal';
      location = `${params.vesselDetails.vesselName} (${locArea})`;
      if (params.location?.latitude && params.location?.longitude) {
        coordinates = [params.location.latitude + 0.15, params.location.longitude - 0.85];
      }
    }

    if (elapsedHours >= 48) {
      if (shore.id === 'shore-1') {
        arrivalTime = '36 - 48 h';
        impactLevel = 'High';
      } else if (shore.id === 'shore-2') {
        arrivalTime = '48 - 60 h';
        impactLevel = 'Medium';
      } else if (shore.id === 'shore-3') {
        arrivalTime = '60 - 72 h';
        impactLevel = 'Medium';
      } else {
        arrivalTime = '72+ h';
        impactLevel = 'Low';
      }
    }

    return {
      ...shore,
      location,
      coordinates,
      arrivalTime,
      impactLevel,
    };
  });
}
