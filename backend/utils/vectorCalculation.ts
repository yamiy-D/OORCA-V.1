/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { degToRad, radToDeg } from './unitConversion';

export interface Vector2D {
  u: number; // Eastward component (m/s)
  v: number; // Northward component (m/s)
}

export interface PolarVector {
  speed: number;    // magnitude in m/s
  direction: number; // meteorological "from" or oceanographic "towards" direction in degrees (0 - 360)
}

/**
 * Converts oceanographic/meteorological direction and speed into (u, v) Cartesian components.
 * Note on conventions:
 * - Ocean current direction is standardly given as "towards" which direction the current is flowing.
 * - Wind direction is standardly given as "from" which direction the wind blows.
 * @param speed - Speed in m/s
 * @param directionDeg - Direction in degrees (0=North, 90=East, 180=South, 270=West)
 * @param isFromDirection - If true, converts "from" angle to "towards" flow angle (+180 deg)
 */
export function polarToCartesian(speed: number, directionDeg: number, isFromDirection: boolean = false): Vector2D {
  const flowAngleDeg = isFromDirection ? (directionDeg + 180) % 360 : directionDeg;
  const rad = degToRad(flowAngleDeg);
  
  // In geographic navigation:
  // u (East) = speed * sin(rad)
  // v (North) = speed * cos(rad)
  return {
    u: speed * Math.sin(rad),
    v: speed * Math.cos(rad),
  };
}

/**
 * Converts Cartesian (u, v) into speed and heading direction (0-360 degrees, clockwise from North).
 */
export function cartesianToPolar(vector: Vector2D): PolarVector {
  const speed = Math.sqrt(vector.u * vector.u + vector.v * vector.v);
  if (speed < 1e-6) {
    return { speed: 0, direction: 0 };
  }
  
  let angleDeg = radToDeg(Math.atan2(vector.u, vector.v));
  if (angleDeg < 0) {
    angleDeg += 360;
  }
  
  return {
    speed,
    direction: Math.round(angleDeg * 10) / 10,
  };
}

/**
 * Calculates net oil slick drift velocity based on:
 * Total Drift Vector = Ocean Surface Current + Wind Leeway Drift (with Coriolis deflection)
 *
 * Standard empirical parameters:
 * - Wind factor: 0.03 to 0.035 (3.0% - 3.5% of 10m wind speed)
 * - Coriolis deflection: 3° to 10° to the right of the wind in the Northern Hemisphere,
 *   and to the left in the Southern Hemisphere.
 *
 * @param current - Surface current in m/s and flow direction
 * @param wind - 10m Wind in m/s and wind origin direction
 * @param latitude - Latitude in degrees (for Coriolis effect)
 * @param windFactor - Fractional wind coupling (default 0.032)
 */
export function calculateDriftVector(
  current: { speedMps: number; directionDeg: number },
  wind: { speedMps: number; directionDeg: number },
  latitude: number,
  windFactor: number = 0.032
): { driftSpeedMps: number; driftHeadingDeg: number; u: number; v: number } {
  // 1. Current vector (flowing towards current.directionDeg)
  const currentVec = polarToCartesian(current.speedMps, current.directionDeg, false);

  // 2. Wind leeway drift (wind blows towards wind.directionDeg + 180°)
  // Deflected by Coriolis: ~5-8 degrees right in Northern Hemisphere (lat > 0), left in Southern (lat < 0)
  const coriolisDeflectionDeg = latitude >= 0 ? 5.5 : -5.5;
  const windFlowHeadingDeg = (wind.directionDeg + 180 + coriolisDeflectionDeg + 360) % 360;
  const windLeewaySpeed = wind.speedMps * windFactor;
  const windVec = polarToCartesian(windLeewaySpeed, windFlowHeadingDeg, false);

  // 3. Superposition of vector components
  const netU = currentVec.u + windVec.u;
  const netV = currentVec.v + windVec.v;

  const polar = cartesianToPolar({ u: netU, v: netV });

  return {
    driftSpeedMps: polar.speed,
    driftHeadingDeg: polar.direction,
    u: netU,
    v: netV,
  };
}
