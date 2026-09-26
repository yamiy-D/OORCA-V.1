/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Coordinates, MetoceanData, TrajectoryPoint } from '../../types/alertTypes';

/**
 * Trajectory Analysis Engine
 * 
 * Computes:
 * 1. Lagrangian Backward Drift (Origin Attribution):
 *    Inverts the vector sum of Eulerian surface currents (100%) and 
 *    atmospheric windage leeway (typically 3.0% - 3.5% for crude oil slicks)
 *    over the estimated slick age to isolate the release envelope.
 * 
 * 2. Forward Trajectory Prediction (+6h, +12h, +24h):
 *    Forecasts down-drift movement and expanding Gaussian spatial uncertainty.
 */

// Approximate conversion: 1 degree latitude ≈ 60 nautical miles ≈ 111.12 km
const KM_PER_DEGREE_LAT = 111.12;

export function calculateEstimatedOrigin(
  currentCoords: Coordinates,
  metocean: MetoceanData,
  estimatedAgeHoursMedian: number
): {
  originCoords: Coordinates;
  driftDistanceNm: number;
  driftBearingDeg: number;
} {
  // Current velocity vector (kts)
  const currentSpeed = metocean.surfaceCurrentKts;
  const currentRad = (metocean.currentHeadingDeg * Math.PI) / 180;
  const currentVx = currentSpeed * Math.sin(currentRad);
  const currentVy = currentSpeed * Math.cos(currentRad);

  // Leeway windage: 3.2% of 10m wind speed along wind direction
  const windLeewaySpeed = metocean.windSpeedKts * 0.032;
  const windRad = (metocean.windDirectionDeg * Math.PI) / 180;
  const windVx = windLeewaySpeed * Math.sin(windRad);
  const windVy = windLeewaySpeed * Math.cos(windRad);

  // Net hourly drift velocity (knots)
  const netVx = currentVx + windVx;
  const netVy = currentVy + windVy;

  // Total displacement over estimated age (nautical miles)
  const netDispX_nm = netVx * estimatedAgeHoursMedian;
  const netDispY_nm = netVy * estimatedAgeHoursMedian;
  const totalDriftNm = Math.hypot(netDispX_nm, netDispY_nm);

  // Bearing from origin to current position
  let driftBearingDeg = (Math.atan2(netVx, netVy) * 180) / Math.PI;
  if (driftBearingDeg < 0) driftBearingDeg += 360;

  // Invert displacement to find origin (backward in time)
  const originDispX_km = -netDispX_nm * 1.852;
  const originDispY_km = -netDispY_nm * 1.852;

  const latRad = (currentCoords.latitude * Math.PI) / 180;
  const kmPerDegreeLon = KM_PER_DEGREE_LAT * Math.cos(latRad);

  const originLat = currentCoords.latitude + (originDispY_km / KM_PER_DEGREE_LAT);
  const originLon = currentCoords.longitude + (originDispX_km / kmPerDegreeLon);

  return {
    originCoords: {
      latitude: Number(originLat.toFixed(4)),
      longitude: Number(originLon.toFixed(4)),
      formattedLat: `${Math.abs(originLat).toFixed(4)}° ${originLat >= 0 ? 'N' : 'S'}`,
      formattedLon: `${Math.abs(originLon).toFixed(4)}° ${originLon >= 0 ? 'E' : 'W'}`,
      seaRegion: currentCoords.seaRegion,
    },
    driftDistanceNm: Number(totalDriftNm.toFixed(1)),
    driftBearingDeg: Math.round(driftBearingDeg),
  };
}

export function projectForwardTrajectory(
  currentPoint: TrajectoryPoint,
  metocean: MetoceanData,
  hoursOffset: number
): TrajectoryPoint {
  const currentSpeed = metocean.surfaceCurrentKts;
  const currentRad = (metocean.currentHeadingDeg * Math.PI) / 180;
  const windLeewaySpeed = metocean.windSpeedKts * 0.032;
  const windRad = (metocean.windDirectionDeg * Math.PI) / 180;

  const netVx = currentSpeed * Math.sin(currentRad) + windLeewaySpeed * Math.sin(windRad);
  const netVy = currentSpeed * Math.cos(currentRad) + windLeewaySpeed * Math.cos(windRad);

  const dispX_km = netVx * hoursOffset * 1.852;
  const dispY_km = netVy * hoursOffset * 1.852;

  const latRad = (currentPoint.coordinates.latitude * Math.PI) / 180;
  const kmPerDegreeLon = KM_PER_DEGREE_LAT * Math.cos(latRad);

  const projLat = currentPoint.coordinates.latitude + (dispY_km / KM_PER_DEGREE_LAT);
  const projLon = currentPoint.coordinates.longitude + (dispX_km / kmPerDegreeLon);

  const dispersionGrowthFactor = 1 + (hoursOffset * 0.18);

  return {
    label: hoursOffset === 6 ? '+6 Hours' : hoursOffset === 12 ? '+12 Hours' : '+24 Hours',
    coordinates: {
      latitude: Number(projLat.toFixed(4)),
      longitude: Number(projLon.toFixed(4)),
      formattedLat: `${Math.abs(projLat).toFixed(4)}° ${projLat >= 0 ? 'N' : 'S'}`,
      formattedLon: `${Math.abs(projLon).toFixed(4)}° ${projLon >= 0 ? 'E' : 'W'}`,
      seaRegion: currentPoint.coordinates.seaRegion,
    },
    timestampUtc: `+${hoursOffset}H PROJECTION`,
    currentSpeedKts: metocean.surfaceCurrentKts,
    currentDirectionDeg: metocean.currentHeadingDeg,
    windSpeedKts: metocean.windSpeedKts,
    windDirectionDeg: metocean.windDirectionDeg,
    dispersionRadiusKm: Number((currentPoint.dispersionRadiusKm * dispersionGrowthFactor).toFixed(1)),
  };
}
