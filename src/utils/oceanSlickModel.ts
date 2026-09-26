/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentalConditions } from '../types/simulation';

export type SlickZoneId = 'high' | 'medium' | 'low' | 'fragment' | 'breach_jet';

export interface SlickZoneProperties {
  zone: SlickZoneId;
  label: string;
  description: string;
  thicknessMicrons: number;
  colorHex: string;
  edgeColorHex: string;
  fillOpacity: number;
  edgeWidth: number;
  edgeBlur: number;
}

export interface OceanSlickParams {
  originLat: number;
  originLng: number;
  vesselHeadingDeg: number;
  vesselLengthMeters?: number;
  vesselBreadthMeters?: number;
  envConditions?: EnvironmentalConditions;
  elapsedHours: number;
  seepageRateTonnesPerHour: number;
  initialTonnes: number;
  animPhase: number; // Wave and turbulence phase in radians (driven by requestAnimationFrame)
}

/**
 * Generates an organic, smooth spline-like closed polygon with irregular multi-harmonic
 * boundary perturbations that reflect real ocean hydrodynamic surface tension and wave shear.
 */
function createOrganicBoundary(
  centerLat: number,
  centerLng: number,
  driftRad: number,
  longLengthKm: number,
  maxLateralWidthKm: number,
  nearVesselWidthKm: number,
  upstreamBufferKm: number,
  harmonicWeights: Array<{ freq: number; amp: number; speed: number; phaseOffset: number }>,
  animPhase: number,
  numPoints: number = 64
): [number, number][] {
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((centerLat * Math.PI) / 180);
  const sinD = Math.sin(driftRad);
  const cosD = Math.cos(driftRad);

  const coords: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI;
    const u = Math.cos(theta); // +1 = down-current apex, -1 = upstream tail behind vessel
    const v = Math.sin(theta); // lateral flank direction (-1 = port, +1 = stbd)

    // Interpolate along longitudinal drift axis: from -upstreamBufferKm to +longLengthKm
    const sNormalized = (u + 1) / 2; // 0 at tail, 1 at apex
    const longDistKm = sNormalized * (longLengthKm + upstreamBufferKm) - upstreamBufferKm;

    // Asymmetric lateral expansion profile:
    // Starts with non-zero width wrapping the vessel, expands into a hydrodynamic teardrop,
    // and gently tapers at the leading crest
    const profile = Math.sin(Math.pow(sNormalized, 0.62) * Math.PI);
    const baseWidthKm = nearVesselWidthKm * (1 - sNormalized * 0.45) + maxLateralWidthKm * profile;

    // Multi-frequency hydrodynamic turbulence (Kelvin-Helmholtz & ocean swell harmonics)
    let turbulence = 1.0;
    for (let h = 0; h < harmonicWeights.length; h++) {
      const hw = harmonicWeights[h];
      const wave = Math.sin(theta * hw.freq + hw.phaseOffset + animPhase * hw.speed);
      turbulence += hw.amp * wave;
    }
    turbulence = Math.max(0.68, Math.min(1.42, turbulence));

    const lateralDistKm = (baseWidthKm * 0.5 * turbulence) * v;
    const finalLongDistKm = longDistKm * (u < 0 ? 1 : turbulence * 0.95);

    // Project rotated vector along drift trajectory
    const dEastKm = finalLongDistKm * sinD + lateralDistKm * cosD;
    const dNorthKm = finalLongDistKm * cosD - lateralDistKm * sinD;

    const lat = centerLat + dNorthKm / kmPerDegLat;
    const lng = centerLng + dEastKm / kmPerDegLng;
    coords.push([lng, lat]);
  }

  // Ensure closed polygon
  if (coords.length > 0) {
    coords.push([coords[0][0], coords[0][1]]);
  }

  return coords;
}

/**
 * Calculates a dynamic ocean-surface oil slick featuring 3 distinct concentration zones:
 * 1. High concentration: Dark, dense, viscous crude wrapping the vessel and ruptured tank.
 * 2. Medium concentration: Semi-transparent chocolate mousse / emulsified patches spreading outward.
 * 3. Low concentration: Light, fragmented iridescent sheen traces gradually dispersing into the ocean.
 * Also includes detached floating sheen islands and the ruptured tank injection jet.
 */
export function generateDynamicOceanSlick(params: OceanSlickParams): {
  highConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties>;
  mediumConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties>;
  lowConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties>;
  fragmentedPatches: GeoJSON.FeatureCollection<GeoJSON.Polygon, SlickZoneProperties>;
  breachJet: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties>;
} {
  const {
    originLat,
    originLng,
    vesselHeadingDeg,
    envConditions,
    elapsedHours,
    seepageRateTonnesPerHour,
    initialTonnes,
    animPhase,
  } = params;

  // Hydrodynamic net drift vector: Current (100%) + Wind leeway (~3.2%)
  const currentSpeed = envConditions?.currentSpeedKts ?? 2.8;
  const currentDirRad = ((envConditions?.currentDirectionDeg ?? 135) * Math.PI) / 180;
  const windSpeed = envConditions?.windSpeedKts ?? 15;
  const coriolisDeflectionRad = (12.0 * Math.PI) / 180;
  const windDirRad = (((envConditions?.windDirectionDeg ?? 45) * Math.PI) / 180) + coriolisDeflectionRad;

  const uNet = currentSpeed * Math.sin(currentDirRad) + (windSpeed * 0.032) * Math.sin(windDirRad);
  const vNet = currentSpeed * Math.cos(currentDirRad) + (windSpeed * 0.032) * Math.cos(windDirRad);
  let netDriftRad = Math.atan2(uNet, vNet);

  const time = Math.max(0, elapsedHours);
  const totalTonnes = initialTonnes + (seepageRateTonnesPerHour * time);

  // Cumulative advection drift distance (km) based on ocean current and wind leeway
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((originLat * Math.PI) / 180);
  const driftSpeedKmh = Math.max(2.5, Math.sqrt(uNet * uNet + vNet * vNet) * 1.852);
  // Physical advection scale: produces prominent macro-scale plume that visibly flows across the sea
  const totalDriftDistanceKm = time > 0 ? (driftSpeedKmh * time * 0.45) : 0;

  // Curving trajectory angle: slight Coriolis deflection / anticyclonic turning as time progresses
  const turnRad = time > 0 ? 0.0025 * time : 0;
  netDriftRad += turnRad;
  const sinD = Math.sin(netDriftRad);
  const cosD = Math.cos(netDriftRad);

  // Scale dimensions organically based on total spilled volume and elapsed weathering time
  const timeProgress = Math.min(1.0, Math.max(0.0, time / 72));
  const volumeFactor = Math.pow(Math.max(50, totalTonnes) / 100, 0.20);
  const timeExpansion = Math.pow(timeProgress, 0.68);

  // -------------------------------------------------------------
  // ZONE 1: HIGH CONCENTRATION (> 200 µm) - Concentrated Deep Blood Red
  // Red core emerges from the casualty vessel and flows downstream
  // -------------------------------------------------------------
  const highStartDistKm = (0.05 + 0.35 * timeExpansion + (totalDriftDistanceKm * 0.15)) * volumeFactor;
  const highCenterLat = originLat + (highStartDistKm * cosD) / kmPerDegLat;
  const highCenterLng = originLng + (highStartDistKm * sinD) / kmPerDegLng;

  const highLengthKm = (0.65 + 6.2 * timeExpansion + (totalDriftDistanceKm * 0.30)) * volumeFactor;
  const highMaxWidthKm = (0.45 + 3.8 * timeExpansion) * volumeFactor;
  const highNearVesselWidthKm = 0.2 + 0.4 * timeExpansion;
  const highBackBufferKm = 0.05 + 0.10 * timeExpansion;

  const highHarmonics = [
    { freq: 4, amp: 0.12, speed: 1.1, phaseOffset: 0.3 },
    { freq: 7, amp: 0.08, speed: 1.6, phaseOffset: 1.1 },
    { freq: 2, amp: 0.10, speed: 0.7, phaseOffset: 2.4 },
  ];

  const highCoords = createOrganicBoundary(
    highCenterLat,
    highCenterLng,
    netDriftRad,
    highLengthKm,
    highMaxWidthKm,
    highNearVesselWidthKm,
    highBackBufferKm,
    highHarmonics,
    animPhase,
    56
  );

  const highConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties> = {
    type: 'Feature',
    properties: {
      zone: 'high',
      label: 'High Concentration Core (Concentrated Red)',
      description: 'Dense viscous crude flowing downstream along advection trajectory',
      thicknessMicrons: time === 0 ? 450 : Math.max(90, Math.round(450 / (1 + time * 0.018))),
      colorHex: '#dc2626',
      edgeColorHex: '#f87171',
      fillOpacity: 0.94,
      edgeWidth: 2.5,
      edgeBlur: 1.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [highCoords],
    },
  };

  // -------------------------------------------------------------
  // ZONE 2: MEDIUM CONCENTRATION (10 - 200 µm) - Vibrant Orange Mousse
  // Drifts and fans downstream along trajectory in open ocean waters
  // -------------------------------------------------------------
  const medStartDistKm = (0.12 + 1.1 * timeExpansion + (totalDriftDistanceKm * 0.35)) * volumeFactor;
  const medCenterLat = originLat + (medStartDistKm * cosD) / kmPerDegLat;
  const medCenterLng = originLng + (medStartDistKm * sinD) / kmPerDegLng;

  const medLengthKm = (1.2 + 13.8 * timeExpansion + (totalDriftDistanceKm * 0.60)) * volumeFactor;
  const medMaxWidthKm = (0.75 + 7.8 * timeExpansion) * volumeFactor;
  const medNearVesselWidthKm = 0.35 + 0.65 * timeExpansion;
  const medBackBufferKm = 0.08 + 0.17 * timeExpansion;

  const medHarmonics = [
    { freq: 3, amp: 0.17, speed: 1.0, phaseOffset: 0.8 },
    { freq: 6, amp: 0.13, speed: 1.5, phaseOffset: 1.9 },
    { freq: 9, amp: 0.08, speed: 2.2, phaseOffset: 0.4 },
  ];

  const medCoords = createOrganicBoundary(
    medCenterLat,
    medCenterLng,
    netDriftRad,
    medLengthKm,
    medMaxWidthKm,
    medNearVesselWidthKm,
    medBackBufferKm,
    medHarmonics,
    animPhase,
    64
  );

  const mediumConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties> = {
    type: 'Feature',
    properties: {
      zone: 'medium',
      label: 'Medium Concentration Emulsion (Vibrant Orange)',
      description: 'Vibrant orange mousse & viscous patches spreading outward',
      thicknessMicrons: time === 0 ? 140 : Math.max(30, Math.round(140 / (1 + time * 0.022))),
      colorHex: '#ea580c',
      edgeColorHex: '#f97316',
      fillOpacity: 0.78,
      edgeWidth: 2.0,
      edgeBlur: 2.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [medCoords],
    },
  };

  // -------------------------------------------------------------
  // ZONE 3: LOW CONCENTRATION (0.1 - 10 µm) - Light Orange Sheen
  // Drifts farthest downstream, spreading widely into thin feathered lobes
  // -------------------------------------------------------------
  const lowStartDistKm = (0.2 + 2.0 * timeExpansion + (totalDriftDistanceKm * 0.55)) * volumeFactor;
  const lowCenterLat = originLat + (lowStartDistKm * cosD) / kmPerDegLat;
  const lowCenterLng = originLng + (lowStartDistKm * sinD) / kmPerDegLng;

  const lowLengthKm = (1.8 + 23.0 * timeExpansion + (totalDriftDistanceKm * 0.90)) * volumeFactor;
  const lowMaxWidthKm = (1.1 + 14.5 * timeExpansion) * volumeFactor;
  const lowNearVesselWidthKm = 0.5 + 0.9 * timeExpansion;
  const lowBackBufferKm = 0.12 + 0.23 * timeExpansion;

  const lowHarmonics = [
    { freq: 2, amp: 0.22, speed: 0.7, phaseOffset: 1.4 },
    { freq: 5, amp: 0.18, speed: 1.3, phaseOffset: 2.8 },
    { freq: 8, amp: 0.14, speed: 1.9, phaseOffset: 0.9 },
    { freq: 11, amp: 0.10, speed: 2.6, phaseOffset: 3.5 },
  ];

  const lowCoords = createOrganicBoundary(
    lowCenterLat,
    lowCenterLng,
    netDriftRad,
    lowLengthKm,
    lowMaxWidthKm,
    lowNearVesselWidthKm,
    lowBackBufferKm,
    lowHarmonics,
    animPhase,
    72
  );

  const lowConcentration: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties> = {
    type: 'Feature',
    properties: {
      zone: 'low',
      label: 'Low Concentration Sheen (Light Orange)',
      description: 'Light orange iridescent film dispersing smoothly into open seawater',
      thicknessMicrons: time === 0 ? 8.5 : Math.max(0.8, Number((8.5 / (1 + time * 0.025)).toFixed(1))),
      colorHex: '#fb923c',
      edgeColorHex: '#fdba74',
      fillOpacity: 0.45,
      edgeWidth: 1.4,
      edgeBlur: 3.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [lowCoords],
    },
  };

  // -------------------------------------------------------------
  // DETACHED FRAGMENTED SHEEN PATCHES & WISPS (Orange Sheen)
  // Small organic drifting oil islands peeled off by turbulent wave action
  // -------------------------------------------------------------
  const fragmentOffsets = [
    { distFrac: 0.72, latFrac: 0.42, radiusKm: 1.8, lobes: 4, speed: 1.4, color: '#ea580c', opacity: 0.65 },
    { distFrac: 0.85, latFrac: -0.38, radiusKm: 2.2, lobes: 5, speed: 1.2, color: '#f97316', opacity: 0.58 },
    { distFrac: 0.96, latFrac: 0.28, radiusKm: 1.6, lobes: 3, speed: 1.6, color: '#fb923c', opacity: 0.52 },
    { distFrac: 1.06, latFrac: -0.22, radiusKm: 2.4, lobes: 6, speed: 1.1, color: '#fb923c', opacity: 0.48 },
    { distFrac: 1.15, latFrac: 0.35, radiusKm: 1.5, lobes: 4, speed: 1.7, color: '#fdba74', opacity: 0.42 },
    { distFrac: 0.55, latFrac: 0.50, radiusKm: 1.4, lobes: 3, speed: 1.5, color: '#ea580c', opacity: 0.68 },
    { distFrac: 0.64, latFrac: -0.48, radiusKm: 1.5, lobes: 4, speed: 1.3, color: '#f97316', opacity: 0.62 },
  ];

  const fragmentFeatures: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties>[] = [];

  fragmentOffsets.forEach((frag, idx) => {
    // Drifting position
    const centerDistKm = frag.distFrac * lowLengthKm;
    // Small undulating wander
    const wander = Math.sin(animPhase * frag.speed + idx * 1.5) * 0.06 * lowMaxWidthKm;
    const finalLatKm = (frag.latFrac * lowMaxWidthKm * 0.5) + wander;

    const eastKm = centerDistKm * sinD + finalLatKm * cosD;
    const northKm = centerDistKm * cosD - finalLatKm * sinD;

    const fLat = originLat + northKm / kmPerDegLat;
    const fLng = originLng + eastKm / kmPerDegLng;

    const pts = 24;
    const ring: [number, number][] = [];
    for (let p = 0; p < pts; p++) {
      const a = (p / pts) * 2 * Math.PI;
      const w = Math.sin(a * frag.lobes + animPhase * 1.4 + idx) * 0.25;
      const r = frag.radiusKm * (1 + w);

      const dE = r * Math.sin(a);
      const dN = r * Math.cos(a);

      ring.push([fLng + dE / kmPerDegLng, fLat + dN / kmPerDegLat]);
    }
    if (ring.length > 0) ring.push([ring[0][0], ring[0][1]]);

    fragmentFeatures.push({
      type: 'Feature',
      properties: {
        zone: 'fragment',
        label: `Fragmented Slick Island #${idx + 1}`,
        description: 'Detached orange sheen patch broken off by ocean wave turbulence',
        thicknessMicrons: 1.5,
        colorHex: frag.color,
        edgeColorHex: '#fed7aa',
        fillOpacity: frag.opacity,
        edgeWidth: 1.0,
        edgeBlur: 2.0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    });
  });

  // -------------------------------------------------------------
  // BREACH JET / HIGH-VELOCITY EMITTER STREAM
  // Kept empty to ensure the vessel hull remains free of oil spill.
  // -------------------------------------------------------------
  const breachJet: GeoJSON.Feature<GeoJSON.Polygon, SlickZoneProperties> = {
    type: 'Feature',
    properties: {
      zone: 'breach_jet',
      label: 'Breach Tank Rupture Jet',
      description: 'Active continuous fluid discharge',
      thicknessMicrons: 0,
      colorHex: '#b91c1c',
      edgeColorHex: '#f87171',
      fillOpacity: 0,
      edgeWidth: 0,
      edgeBlur: 0,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
  };

  return {
    highConcentration,
    mediumConcentration,
    lowConcentration,
    fragmentedPatches: {
      type: 'FeatureCollection',
      features: fragmentFeatures,
    },
    breachJet,
  };
}
