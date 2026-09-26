/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  SimulationParameters, 
  EnvironmentalConditions, 
  SpillConcentrationContour,
  SpillSummary 
} from '../types/simulation';

/**
 * Calculates Fay's empirical oil slick spreading area in km² based on tonnage and elapsed hours.
 */
export function calculateSlickArea(tonnes: number, elapsedHours: number): number {
  if (elapsedHours <= 0) return 0.5;
  // Non-linear spreading with empirical asymptote
  const baseGrowth = Math.pow(tonnes, 0.45) * Math.pow(elapsedHours, 0.52) * 0.18;
  return Number(Math.max(1.2, baseGrowth).toFixed(2));
}

/**
 * Calculates physical weathering rates (evaporation, natural dispersion, surface fraction)
 */
export function calculateWeathering(
  oilType: string, 
  tonnes: number, 
  elapsedHours: number, 
  waterTempC: number, 
  windKts: number
): { evaporationPct: number; dispersionPct: number; remainingPct: number; weatheringLevel: 'Light' | 'Moderate' | 'Severe' | 'Extreme' } {
  // Volatility factor based on oil type
  let volatility = 1.0;
  if (oilType === 'Diesel' || oilType === 'Refined Petroleum Product') volatility = 1.8;
  else if (oilType === 'Crude Oil') volatility = 1.0;
  else if (oilType === 'Heavy Fuel Oil' || oilType === 'Marine Fuel Oil') volatility = 0.55;

  // Evaporation increases with time, temperature, and wind
  const tempFactor = 1 + (waterTempC - 20) * 0.02;
  const windFactor = 1 + (windKts - 10) * 0.025;
  const maxEvap = Math.min(55, 30 * volatility);
  const evapRate = (1 - Math.exp(-0.035 * elapsedHours * tempFactor * windFactor));
  const evaporationPct = Math.round(Math.min(maxEvap, maxEvap * evapRate));

  // Dispersion increases with sea state (wind / wave energy)
  const maxDisp = 35;
  const dispRate = (1 - Math.exp(-0.025 * elapsedHours * (windKts / 15)));
  const dispersionPct = Math.round(Math.min(maxDisp, maxDisp * dispRate));

  const remainingPct = Math.max(10, 100 - evaporationPct - dispersionPct);

  let weatheringLevel: 'Light' | 'Moderate' | 'Severe' | 'Extreme' = 'Moderate';
  if (elapsedHours < 12) weatheringLevel = 'Light';
  else if (elapsedHours < 40) weatheringLevel = 'Moderate';
  else if (elapsedHours < 65) weatheringLevel = 'Severe';
  else weatheringLevel = 'Extreme';

  return {
    evaporationPct,
    dispersionPct,
    remainingPct,
    weatheringLevel,
  };
}

/**
 * Calculates hydrodynamic drift vector combining surface current and 3.5% wind drift.
 */
export function calculateDriftVector(env: EnvironmentalConditions) {
  // Current component
  const currentRad = (env.currentDirectionDeg * Math.PI) / 180;
  const currentU = env.currentSpeedKts * Math.sin(currentRad);
  const currentV = env.currentSpeedKts * Math.cos(currentRad);

  // Wind component (approx 3.2% of wind speed)
  const windRad = (env.windDirectionDeg * Math.PI) / 180;
  const windLeewaySpeed = env.windSpeedKts * 0.032;
  const windU = windLeewaySpeed * Math.sin(windRad);
  const windV = windLeewaySpeed * Math.cos(windRad);

  // Combined drift vector (knots)
  const totalU = currentU + windU;
  const totalV = currentV + windV;
  const driftHeadingRad = Math.atan2(totalU, totalV);
  const driftHeadingDeg = ((driftHeadingRad * 180) / Math.PI + 360) % 360;
  const netSpeedKts = Math.sqrt(totalU * totalU + totalV * totalV);

  return {
    headingDeg: driftHeadingDeg,
    speedKts: netSpeedKts,
    uKts: totalU,
    vKts: totalV,
  };
}

/**
 * Generates organic, continuous multi-contour polygons for the oil slick
 * that authentically originate AT and ENVELOPE the ship hull, fanning downstream
 * along the hydrodynamic drift trajectory.
 */
export function generateOrganicSpillContours(
  originLat: number,
  originLng: number,
  tonnes: number,
  elapsedHours: number,
  driftHeadingDeg: number
): SpillConcentrationContour[] {
  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const cosD = Math.cos(driftRad);
  const sinD = Math.sin(driftRad);
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((originLat * Math.PI) / 180);

  const effectiveHours = Math.max(0.5, elapsedHours);
  // Total plume downstream length in km (e.g. ~14 km at 48h for 100t)
  const totalLengthKm = Math.max(0.9, Math.pow(tonnes, 0.22) * Math.pow(effectiveHours, 0.58) * 0.95);

  // 5 concentration tiers from immediate heavy crude core to outer iridescent sheen
  const tiers: Array<{
    level: 'Very Thick' | 'Thick' | 'Medium' | 'Thin' | 'Very Thin';
    colorHex: string;
    fillOpacity: number;
    thicknessMicrons: string;
    lengthFrac: number;
    maxWidthKm: number;
    nearShipWidthKm: number;
    backBufferKm: number;
    lobes: number;
    roughness: number;
    phase: number;
  }> = [
    {
      level: 'Very Thick',
      colorHex: '#b91c1c',
      fillOpacity: 0.94,
      thicknessMicrons: '> 200 μm',
      lengthFrac: 0.28,
      maxWidthKm: 0.52,
      nearShipWidthKm: 0.26,
      backBufferKm: 0.18,
      lobes: 4,
      roughness: 0.08,
      phase: 0.4,
    },
    {
      level: 'Thick',
      colorHex: '#dc2626',
      fillOpacity: 0.86,
      thicknessMicrons: '50 - 200 μm',
      lengthFrac: 0.48,
      maxWidthKm: 1.05,
      nearShipWidthKm: 0.42,
      backBufferKm: 0.26,
      lobes: 5,
      roughness: 0.11,
      phase: 0.8,
    },
    {
      level: 'Medium',
      colorHex: '#ea580c',
      fillOpacity: 0.74,
      thicknessMicrons: '10 - 50 μm',
      lengthFrac: 0.70,
      maxWidthKm: 1.75,
      nearShipWidthKm: 0.58,
      backBufferKm: 0.38,
      lobes: 6,
      roughness: 0.14,
      phase: 1.2,
    },
    {
      level: 'Thin',
      colorHex: '#f97316',
      fillOpacity: 0.56,
      thicknessMicrons: '1 - 10 μm',
      lengthFrac: 0.88,
      maxWidthKm: 2.45,
      nearShipWidthKm: 0.75,
      backBufferKm: 0.50,
      lobes: 7,
      roughness: 0.16,
      phase: 1.6,
    },
    {
      level: 'Very Thin',
      colorHex: '#fb923c',
      fillOpacity: 0.36,
      thicknessMicrons: '0.1 - 1 μm',
      lengthFrac: 1.00,
      maxWidthKm: 3.20,
      nearShipWidthKm: 0.92,
      backBufferKm: 0.65,
      lobes: 8,
      roughness: 0.18,
      phase: 2.1,
    },
  ];

  return tiers.map((tier) => {
    const pointsCount = 48;
    const points: [number, number][] = [];
    const tierLengthKm = totalLengthKm * tier.lengthFrac;
    const backKm = tier.backBufferKm;

    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * 2 * Math.PI;
      const u = Math.cos(angle); // 1 = downstream tip, -1 = upstream behind vessel
      const v = Math.sin(angle); // lateral perpendicular width

      // Interpolate along drift axis: from -backKm (behind ship) to tierLengthKm (plume head)
      const s = ((u + 1) / 2) * (tierLengthKm + backKm) - backKm;

      // Normalized position: 0 at ship rear/hull, 1 at plume tip
      const xFrac = Math.max(0, Math.min(1, (s + backKm) / (tierLengthKm + backKm)));
      
      // Teardrop profile: maintains physical width directly at the ship hull,
      // widens gracefully downstream, then smoothly rounds off at the leading edge
      const profile = Math.sin(Math.pow(xFrac, 0.65) * Math.PI);
      const width = tier.nearShipWidthKm * (1 - xFrac * 0.35) + tier.maxWidthKm * profile;

      // Realistic hydrodynamic turbulent fluctuations
      const wave1 = Math.sin(angle * tier.lobes + tier.phase) * tier.roughness;
      const wave2 = Math.cos(angle * 3 - tier.phase * 0.7) * (tier.roughness * 0.4);
      const radiusFactor = Math.max(0.72, 1 + wave1 + wave2);

      const latDist = (width * 0.5 * radiusFactor) * v;
      const longDist = s * (u < 0 ? 1 : radiusFactor);

      // Rotate into drift heading (0 deg = North (+lat), 90 deg = East (+lng))
      const dEastKm = longDist * sinD + latDist * cosD;
      const dNorthKm = longDist * cosD - latDist * sinD;

      const lat = originLat + dNorthKm / kmPerDegLat;
      const lng = originLng + dEastKm / kmPerDegLng;
      points.push([lat, lng]);
    }

    // Close polygon
    if (points.length > 0) {
      points.push(points[0]);
    }

    return {
      level: tier.level,
      colorHex: tier.colorHex,
      fillOpacity: tier.fillOpacity,
      thicknessMicrons: tier.thicknessMicrons,
      points,
    };
  });
}

/**
 * Generates an ultra-high-resolution organic slick polygon immediately hugging the ship hull
 * (representing the 80m - 280m high-concentration crude oil pool and breached tank leakage).
 */
export function generateNearHullSlick(
  vesselLat: number,
  vesselLng: number,
  vesselHeadingDeg: number,
  driftHeadingDeg: number
): [number, number][] {
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((vesselLat * Math.PI) / 180);
  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const shipRad = (vesselHeadingDeg * Math.PI) / 180;

  const points: [number, number][] = [];
  const N = 36;
  const baseRadiusKm = 0.16; // ~160 meters around the ship

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * 2 * Math.PI;
    // Stretch along ship hull length + bias toward drift direction
    const shipAlign = Math.cos(angle - shipRad);
    const driftAlign = Math.cos(angle - driftRad);
    
    // Hull shape: 228m long x 32m wide, so elongated along ship heading
    const hullElongation = 1 + 0.55 * Math.abs(shipAlign);
    const downstreamBias = Math.max(0, driftAlign) * 0.45;
    const wave = Math.sin(angle * 6) * 0.08 + Math.cos(angle * 4) * 0.05;

    const r = baseRadiusKm * (hullElongation + downstreamBias + wave);
    const dEast = r * Math.sin(angle);
    const dNorth = r * Math.cos(angle);

    const lat = vesselLat + dNorth / kmPerDegLat;
    const lng = vesselLng + dEast / kmPerDegLng;
    points.push([lat, lng]);
  }

  if (points.length > 0) {
    points.push(points[0]);
  }

  return points;
}

/**
 * Generates protective emergency containment boom coordinates around the downstream perimeter of the vessel.
 */
export function generateContainmentBoom(
  vesselLat: number,
  vesselLng: number,
  driftHeadingDeg: number
): [number, number][] {
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((vesselLat * Math.PI) / 180);
  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const boomRadiusKm = 0.28; // 280m downstream boom barrier

  const points: [number, number][] = [];
  // Arc covering downstream 180 degrees (U-shaped deflection boom)
  const startAngle = driftRad - Math.PI * 0.55;
  const endAngle = driftRad + Math.PI * 0.55;
  const steps = 24;

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * (endAngle - startAngle);
    const dEast = boomRadiusKm * Math.sin(angle);
    const dNorth = boomRadiusKm * Math.cos(angle);

    const lat = vesselLat + dNorth / kmPerDegLat;
    const lng = vesselLng + dEast / kmPerDegLng;
    points.push([lat, lng]);
  }

  return points;
}
