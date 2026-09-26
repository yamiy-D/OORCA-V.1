/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeatmapPalette } from '../types/simulation';

export interface LiquidHeatmapPointProperties {
  weight: number;            // 0.05 to 1.0 (used by MapLibre heatmap-weight)
  intensity: number;         // Relative intensity
  thicknessMicrons: number;  // Physical thickness in microns
  ageHours: number;          // Age of oil in hours since release
  isHotspot: boolean;        // High-density emission cluster node
  category: 'core' | 'stream' | 'plume' | 'sheen';
}

export interface ContourIsolineProperties {
  level: string;
  thicknessMicrons: number;
  color: string;
  opacity: number;
  lineWidth: number;
  dashArray?: number[];
}

export interface SeepageModelParams {
  originLat: number;
  originLng: number;
  initialTonnes: number;
  seepageRateTonnesPerHour: number;
  elapsedHours: number;
  driftHeadingDeg: number;
  driftSpeedKts: number;
  oilType?: string;
}

export interface SeepageMetrics {
  cumulativeTonnes: number;
  currentSeepageRateTonnesHr: number;
  plumeLengthKm: number;
  plumeMaxWidthKm: number;
  activeSurfaceAreaKm2: number;
  peakThicknessMicrons: number;
  driftDistanceKm: number;
}

/**
 * Computes realistic metrics for continuous seepage over elapsed simulation time.
 */
export function calculateSeepageMetrics(params: SeepageModelParams): SeepageMetrics {
  const { initialTonnes, seepageRateTonnesPerHour, elapsedHours, driftSpeedKts } = params;
  const time = Math.max(0.1, elapsedHours);
  
  // Total spilled amount increases with continuous seepage over time
  const cumulativeTonnes = Math.round(initialTonnes + (seepageRateTonnesPerHour * time));
  
  // Plume downstream elongation along drift vector
  const driftDistanceKm = Number((driftSpeedKts * 1.852 * time * 0.85).toFixed(2));
  const plumeLengthKm = Number(Math.max(0.6, Math.pow(cumulativeTonnes, 0.24) * Math.pow(time, 0.58) * 0.92).toFixed(2));
  const plumeMaxWidthKm = Number(Math.max(0.3, plumeLengthKm * 0.38).toFixed(2));
  
  // Active spreading surface area based on cumulative volume and elapsed time
  const activeSurfaceAreaKm2 = Number(
    Math.max(0.8, Math.pow(cumulativeTonnes, 0.44) * Math.pow(time, 0.54) * 0.21).toFixed(2)
  );

  // Peak thickness at the rupture origin
  const peakThicknessMicrons = Math.min(1200, Math.round(220 + seepageRateTonnesPerHour * 4.5));

  return {
    cumulativeTonnes,
    currentSeepageRateTonnesHr: seepageRateTonnesPerHour,
    plumeLengthKm,
    plumeMaxWidthKm,
    activeSurfaceAreaKm2,
    peakThicknessMicrons,
    driftDistanceKm,
  };
}

/**
 * Generates high-density weighted points for MapLibre GL's native GPU liquid heatmap.
 * Creates an organic fluid simulation of continuous seepage:
 * 1. Immediate high-viscosity breached hull core (hotspot)
 * 2. Downstream streaming seepage parcels with turbulent dispersion
 * 3. Expansive outer iridescent sheen envelope
 */
export function generateLiquidHeatmapPoints(
  params: SeepageModelParams
): GeoJSON.FeatureCollection<GeoJSON.Point, LiquidHeatmapPointProperties> {
  const {
    originLat,
    originLng,
    initialTonnes,
    seepageRateTonnesPerHour,
    elapsedHours,
    driftHeadingDeg,
    driftSpeedKts,
  } = params;

  const features: GeoJSON.Feature<GeoJSON.Point, LiquidHeatmapPointProperties>[] = [];

  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const cosD = Math.cos(driftRad);
  const sinD = Math.sin(driftRad);

  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((originLat * Math.PI) / 180);

  const time = Math.max(0.1, elapsedHours);
  const cumulativeTonnes = initialTonnes + (seepageRateTonnesPerHour * time);

  // Downstream extent in km
  const totalLengthKm = Math.max(0.8, Math.pow(cumulativeTonnes, 0.22) * Math.pow(time, 0.58) * 0.95);
  const maxWidthKm = Math.max(0.4, totalLengthKm * 0.42);

  // 1. NEAR-HULL HIGH-DENSITY VISCOUS SEEPAGE CORE (Active leak origin)
  // Highly concentrated Gaussian cluster centered at the breach point
  const corePointsCount = 28;
  for (let i = 0; i < corePointsCount; i++) {
    const angle = (i / corePointsCount) * 2 * Math.PI;
    const r = Math.pow(Math.random(), 1.5) * 0.18; // within 180m of hull
    const latDist = r * Math.sin(angle);
    const longDist = r * Math.cos(angle);

    const pLat = originLat + (longDist * cosD - latDist * sinD) / kmPerDegLat;
    const pLng = originLng + (longDist * sinD + latDist * cosD) / kmPerDegLng;

    const distFromCenter = Math.sqrt(latDist * latDist + longDist * longDist);
    const weight = Math.max(0.7, 1.0 - (distFromCenter / 0.18) * 0.3);

    features.push({
      type: 'Feature',
      properties: {
        weight,
        intensity: 1.0,
        thicknessMicrons: 350,
        ageHours: 0.1,
        isHotspot: i % 4 === 0, // Mark prominent anchor points
        category: 'core',
      },
      geometry: {
        type: 'Point',
        coordinates: [pLng, pLat],
      },
    });
  }

  // 2. CONTINUOUS TIME-STEPPED SEEPAGE STREAM (Parcels discharged from t=0 to current hour)
  // Each parcel represents oil leaked at time t_emit that has drifted and diffused
  const parcelSteps = Math.min(24, Math.max(6, Math.round(time * 1.2)));
  for (let step = 0; step < parcelSteps; step++) {
    // Fraction along the timeline: 0 = just released at hull, 1 = oldest oil at the leading edge
    const frac = step / (parcelSteps - 1 || 1);
    const ageHours = frac * time;
    const parcelDistanceKm = Math.pow(frac, 0.88) * totalLengthKm;

    // Lateral spreading widens with parcel age
    const parcelWidthKm = Math.max(0.12, maxWidthKm * Math.sin(Math.pow(frac, 0.65) * Math.PI));

    // Parcel concentration decays with age (evaporation + dispersion)
    const baseWeight = Math.max(0.15, 0.95 * Math.exp(-0.028 * ageHours) * (1 - frac * 0.45));
    const pointsInParcel = Math.round(8 + 12 * (1 - frac * 0.5));

    for (let p = 0; p < pointsInParcel; p++) {
      // Gaussian jitter around parcel center with turbulent eddies
      const angle = (p / pointsInParcel) * 2 * Math.PI + step * 0.4;
      const radialJitter = Math.pow(Math.random(), 0.8) * 0.5;
      
      // Harmonic wave perturbation mimicking ocean surface currents
      const wave = Math.sin(step * 0.8 + p * 1.2) * 0.08 * parcelWidthKm;
      const latOffsetKm = (radialJitter * parcelWidthKm + wave) * Math.sin(angle);
      const longOffsetKm = parcelDistanceKm + (radialJitter * parcelWidthKm * 0.4) * Math.cos(angle);

      // Coordinate projection with drift heading
      const dEastKm = longOffsetKm * sinD + latOffsetKm * cosD;
      const dNorthKm = longOffsetKm * cosD - latOffsetKm * sinD;

      const pLat = originLat + dNorthKm / kmPerDegLat;
      const pLng = originLng + dEastKm / kmPerDegLng;

      // Weight diminishes away from the centerline
      const lateralDistFrac = Math.min(1.0, Math.abs(latOffsetKm) / (parcelWidthKm + 0.01));
      const finalWeight = Math.max(0.08, baseWeight * (1.0 - Math.pow(lateralDistFrac, 1.8) * 0.7));

      features.push({
        type: 'Feature',
        properties: {
          weight: Number(finalWeight.toFixed(3)),
          intensity: Number((finalWeight * 1.1).toFixed(2)),
          thicknessMicrons: Math.round(300 * finalWeight),
          ageHours: Number(ageHours.toFixed(1)),
          isHotspot: p === 0 && step % 3 === 0,
          category: frac < 0.25 ? 'stream' : frac < 0.75 ? 'plume' : 'sheen',
        },
        geometry: {
          type: 'Point',
          coordinates: [pLng, pLat],
        },
      });
    }
  }

  // 3. DIFFUSE TURBULENT VAPOR & SHEEN FRINGE (Ambient outer liquid aura)
  const sheenPointsCount = 36;
  for (let i = 0; i < sheenPointsCount; i++) {
    const frac = Math.random();
    const alongDistKm = frac * totalLengthKm * 1.08;
    const maxLatKm = maxWidthKm * 1.25 * Math.sin(Math.pow(frac, 0.6) * Math.PI);
    const side = Math.random() > 0.5 ? 1 : -1;
    const latOffsetKm = side * (maxLatKm * (0.65 + Math.random() * 0.4));

    const dEastKm = alongDistKm * sinD + latOffsetKm * cosD;
    const dNorthKm = alongDistKm * cosD - latOffsetKm * sinD;

    const pLat = originLat + dNorthKm / kmPerDegLat;
    const pLng = originLng + dEastKm / kmPerDegLng;

    features.push({
      type: 'Feature',
      properties: {
        weight: 0.12,
        intensity: 0.2,
        thicknessMicrons: 2,
        ageHours: Number((frac * time).toFixed(1)),
        isHotspot: false,
        category: 'sheen',
      },
      geometry: {
        type: 'Point',
        coordinates: [pLng, pLat],
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Generates nested fluid topographic contour isolines (like Images 1 & 3)
 * with elevation-like steps reflecting oil concentration and slick thickness.
 */
export function generateTopographicContourIsolines(
  params: SeepageModelParams
): GeoJSON.FeatureCollection<GeoJSON.LineString, ContourIsolineProperties> {
  const {
    originLat,
    originLng,
    initialTonnes,
    seepageRateTonnesPerHour,
    elapsedHours,
    driftHeadingDeg,
  } = params;

  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const cosD = Math.cos(driftRad);
  const sinD = Math.sin(driftRad);

  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((originLat * Math.PI) / 180);

  const time = Math.max(0.1, elapsedHours);
  const cumulativeTonnes = initialTonnes + (seepageRateTonnesPerHour * time);
  const totalLengthKm = Math.max(0.8, Math.pow(cumulativeTonnes, 0.22) * Math.pow(time, 0.58) * 0.95);

  // 8 progressive nested isoline contours from deepest core to outer sheen
  const contourDefinitions: Array<{
    level: string;
    thicknessMicrons: number;
    lengthFraction: number;
    widthFactor: number;
    backKm: number;
    color: string;
    opacity: number;
    lineWidth: number;
    lobes: number;
    roughness: number;
    phase: number;
    dashArray?: number[];
  }> = [
    {
      level: '250 µm Heavy Crude Core',
      thicknessMicrons: 250,
      lengthFraction: 0.18,
      widthFactor: 0.28,
      backKm: 0.12,
      color: '#ffffff',
      opacity: 0.95,
      lineWidth: 1.8,
      lobes: 3,
      roughness: 0.05,
      phase: 0.2,
    },
    {
      level: '150 µm Dense Emulsion',
      thicknessMicrons: 150,
      lengthFraction: 0.32,
      widthFactor: 0.44,
      backKm: 0.18,
      color: '#fef08a', // warm yellow
      opacity: 0.90,
      lineWidth: 1.4,
      lobes: 4,
      roughness: 0.07,
      phase: 0.6,
    },
    {
      level: '100 µm Chocolate Mousse',
      thicknessMicrons: 100,
      lengthFraction: 0.46,
      widthFactor: 0.60,
      backKm: 0.26,
      color: '#fed7aa', // pale amber
      opacity: 0.85,
      lineWidth: 1.2,
      lobes: 5,
      roughness: 0.09,
      phase: 1.0,
    },
    {
      level: '50 µm Viscous Sheen',
      thicknessMicrons: 50,
      lengthFraction: 0.60,
      widthFactor: 0.74,
      backKm: 0.35,
      color: '#ffffff',
      opacity: 0.80,
      lineWidth: 1.1,
      lobes: 6,
      roughness: 0.11,
      phase: 1.4,
    },
    {
      level: '20 µm Metallic Rainbow',
      thicknessMicrons: 20,
      lengthFraction: 0.74,
      widthFactor: 0.88,
      backKm: 0.44,
      color: '#cbd5e1', // soft slate white
      opacity: 0.75,
      lineWidth: 1.0,
      lobes: 7,
      roughness: 0.13,
      phase: 1.8,
    },
    {
      level: '5 µm Thin Iridescence',
      thicknessMicrons: 5,
      lengthFraction: 0.88,
      widthFactor: 0.98,
      backKm: 0.55,
      color: '#94a3b8',
      opacity: 0.65,
      lineWidth: 0.9,
      lobes: 8,
      roughness: 0.15,
      phase: 2.2,
    },
    {
      level: '1 µm Silver Sheen',
      thicknessMicrons: 1,
      lengthFraction: 0.98,
      widthFactor: 1.08,
      backKm: 0.65,
      color: '#9ca3af',
      opacity: 0.55,
      lineWidth: 0.8,
      lobes: 9,
      roughness: 0.17,
      phase: 2.6,
      dashArray: [4, 3],
    },
    {
      level: '0.1 µm Optical Perimeter',
      thicknessMicrons: 0.1,
      lengthFraction: 1.08,
      widthFactor: 1.18,
      backKm: 0.75,
      color: '#ffffff', // Silvery optical sheen frontier
      opacity: 0.45,
      lineWidth: 0.8,
      lobes: 10,
      roughness: 0.19,
      phase: 3.0,
      dashArray: [2, 4],
    },
  ];

  const features: GeoJSON.Feature<GeoJSON.LineString, ContourIsolineProperties>[] = [];

  contourDefinitions.forEach((def) => {
    const pointsCount = 64; // High resolution for smooth topographic curves
    const coords: [number, number][] = [];
    const contourLengthKm = totalLengthKm * def.lengthFraction;
    const maxContourWidthKm = totalLengthKm * 0.42 * def.widthFactor;
    const backKm = def.backKm;

    for (let i = 0; i <= pointsCount; i++) {
      const angle = (i / pointsCount) * 2 * Math.PI;
      const u = Math.cos(angle);
      const v = Math.sin(angle);

      // Coordinate along plume axis
      const s = ((u + 1) / 2) * (contourLengthKm + backKm) - backKm;
      const xFrac = Math.max(0, Math.min(1, (s + backKm) / (contourLengthKm + backKm)));
      
      // Teardrop profile widening downstream
      const profile = Math.sin(Math.pow(xFrac, 0.68) * Math.PI);
      const width = (0.15 + maxContourWidthKm * profile);

      // Hydrodynamic turbulence harmonics
      const wave1 = Math.sin(angle * def.lobes + def.phase) * def.roughness;
      const wave2 = Math.cos(angle * 2.5 - def.phase * 0.6) * (def.roughness * 0.5);
      const radiusMod = Math.max(0.75, 1 + wave1 + wave2);

      const latDist = (width * 0.5 * radiusMod) * v;
      const longDist = s * (u < 0 ? 1 : radiusMod);

      // Rotate into drift heading
      const dEastKm = longDist * sinD + latDist * cosD;
      const dNorthKm = longDist * cosD - latDist * sinD;

      const lat = originLat + dNorthKm / kmPerDegLat;
      const lng = originLng + dEastKm / kmPerDegLng;

      coords.push([lng, lat]);
    }

    features.push({
      type: 'Feature',
      properties: {
        level: def.level,
        thicknessMicrons: def.thicknessMicrons,
        color: def.color,
        opacity: def.opacity,
        lineWidth: def.lineWidth,
        dashArray: def.dashArray,
      },
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    });
  });

  // SECONDARY CLOSED EDDY PEAKS & NUCLEI (Images 1 & 3: nested concentric peak rings)
  const peakNuclei = [
    { offsetLongKm: 0.05, offsetLatKm: 0.02, baseRadiusKm: 0.18, levels: 4, thickness: 350, color: '#ffffff' },
    { offsetLongKm: totalLengthKm * 0.28, offsetLatKm: 0.22, baseRadiusKm: 0.26, levels: 3, thickness: 190, color: '#fef08a' },
    { offsetLongKm: totalLengthKm * 0.52, offsetLatKm: -0.28, baseRadiusKm: 0.32, levels: 3, thickness: 140, color: '#fed7aa' },
    { offsetLongKm: totalLengthKm * 0.72, offsetLatKm: 0.15, baseRadiusKm: 0.24, levels: 2, thickness: 80, color: '#ffffff' },
  ];

  peakNuclei.forEach((nuc, nIdx) => {
    for (let lvl = 0; lvl < nuc.levels; lvl++) {
      const ringFrac = (lvl + 1) / (nuc.levels + 0.5);
      const r = nuc.baseRadiusKm * ringFrac;
      const pts = 36;
      const ringCoords: [number, number][] = [];

      for (let p = 0; p <= pts; p++) {
        const theta = (p / pts) * 2 * Math.PI;
        // Wavy perturbations on the concentric rings
        const wave = Math.sin(theta * 3 + lvl * 1.2) * 0.12 + Math.cos(theta * 2 - nIdx) * 0.08;
        const rad = r * (1 + wave);

        const x = (nuc.offsetLongKm + rad * Math.cos(theta));
        const y = (nuc.offsetLatKm + rad * Math.sin(theta));

        const dEastKm = x * sinD + y * cosD;
        const dNorthKm = x * cosD - y * sinD;

        const lat = originLat + dNorthKm / kmPerDegLat;
        const lng = originLng + dEastKm / kmPerDegLng;
        ringCoords.push([lng, lat]);
      }

      features.push({
        type: 'Feature',
        properties: {
          level: `Peak Vortex #${nIdx + 1} - Ring ${lvl + 1}`,
          thicknessMicrons: Math.round(nuc.thickness * (1 - ringFrac * 0.3)),
          color: nuc.color,
          opacity: 0.85 - lvl * 0.12,
          lineWidth: lvl === 0 ? 1.4 : 1.0,
        },
        geometry: {
          type: 'LineString',
          coordinates: ringCoords,
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Generates distinct hotspot concentration nodes (like Image 2 white rings)
 * indicating highest sensor readings and oil thickness epicenters.
 */
export function generateHotspotClusterNodes(
  params: SeepageModelParams
): GeoJSON.FeatureCollection<GeoJSON.Point, { label: string; thickness: number; radius: number }> {
  const {
    originLat,
    originLng,
    elapsedHours,
    driftHeadingDeg,
    driftSpeedKts,
  } = params;

  const driftRad = (driftHeadingDeg * Math.PI) / 180;
  const cosD = Math.cos(driftRad);
  const sinD = Math.sin(driftRad);
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((originLat * Math.PI) / 180);

  const time = Math.max(0.1, elapsedHours);
  const totalDistKm = Math.min(18, Math.max(1.2, driftSpeedKts * 1.852 * time * 0.42));

  // Dense multi-cluster node distribution matching Image 2
  const nodes: Array<{ dLong: number; dLat: number; label: string; thickness: number; radius: number }> = [
    // 1. Primary Breach Origin Cluster (Dense core - Image 2 center bottom)
    { dLong: 0, dLat: 0, label: 'Breach Hotspot #1', thickness: 480, radius: 7 },
    { dLong: 0.07, dLat: 0.05, label: 'Breach Node A', thickness: 440, radius: 6.5 },
    { dLong: -0.06, dLat: -0.04, label: 'Breach Node B', thickness: 410, radius: 6 },
    { dLong: 0.03, dLat: -0.07, label: 'Breach Node C', thickness: 390, radius: 5.5 },
    { dLong: -0.04, dLat: 0.06, label: 'Breach Node D', thickness: 370, radius: 5.5 },
    { dLong: 0.09, dLat: -0.02, label: 'Breach Node E', thickness: 350, radius: 5 },

    // 2. High Viscosity Trunk Stream (Image 2 dense central column)
    { dLong: totalDistKm * 0.18, dLat: 0.08, label: 'Trunk Stream 1', thickness: 320, radius: 5.2 },
    { dLong: totalDistKm * 0.22, dLat: -0.06, label: 'Trunk Stream 2', thickness: 305, radius: 5.0 },
    { dLong: totalDistKm * 0.28, dLat: 0.14, label: 'Trunk Stream 3', thickness: 290, radius: 4.8 },
    { dLong: totalDistKm * 0.32, dLat: -0.12, label: 'Trunk Stream 4', thickness: 275, radius: 4.8 },
    { dLong: totalDistKm * 0.38, dLat: 0.04, label: 'Trunk Stream 5', thickness: 260, radius: 4.5 },

    // 3. Dense Secondary Eddy Cluster (Image 2 mid-cluster)
    { dLong: totalDistKm * 0.45, dLat: 0.24, label: 'Eddy Alpha Core', thickness: 250, radius: 5.5 },
    { dLong: totalDistKm * 0.48, dLat: 0.31, label: 'Eddy Alpha Node 1', thickness: 230, radius: 4.6 },
    { dLong: totalDistKm * 0.43, dLat: 0.18, label: 'Eddy Alpha Node 2', thickness: 215, radius: 4.4 },
    { dLong: totalDistKm * 0.50, dLat: -0.22, label: 'Eddy Beta Core', thickness: 220, radius: 5.0 },
    { dLong: totalDistKm * 0.54, dLat: -0.28, label: 'Eddy Beta Node 1', thickness: 195, radius: 4.2 },
    { dLong: totalDistKm * 0.52, dLat: -0.16, label: 'Eddy Beta Node 2', thickness: 185, radius: 4.0 },

    // 4. Dispersal Front & Lateral Fringe Nodes (Image 2 peripheral nodes)
    { dLong: totalDistKm * 0.64, dLat: 0.12, label: 'Front Sensor 1', thickness: 170, radius: 4.2 },
    { dLong: totalDistKm * 0.68, dLat: -0.10, label: 'Front Sensor 2', thickness: 155, radius: 4.0 },
    { dLong: totalDistKm * 0.75, dLat: 0.22, label: 'Front Sensor 3', thickness: 130, radius: 3.8 },
    { dLong: totalDistKm * 0.78, dLat: -0.18, label: 'Front Sensor 4', thickness: 120, radius: 3.8 },
    { dLong: totalDistKm * 0.86, dLat: 0.05, label: 'Leading Crest Alpha', thickness: 95, radius: 3.5 },
    { dLong: totalDistKm * 0.92, dLat: -0.06, label: 'Leading Crest Beta', thickness: 80, radius: 3.5 },

    // 5. Outlier Satellite Sheen Sensors
    { dLong: totalDistKm * 0.25, dLat: 0.38, label: 'Peripheral Sheen N', thickness: 45, radius: 3.2 },
    { dLong: totalDistKm * 0.35, dLat: -0.42, label: 'Peripheral Sheen S', thickness: 40, radius: 3.2 },
    { dLong: totalDistKm * 0.62, dLat: 0.45, label: 'Outer Perimeter E', thickness: 25, radius: 3.0 },
    { dLong: totalDistKm * 0.70, dLat: -0.46, label: 'Outer Perimeter W', thickness: 20, radius: 3.0 },
  ];

  const features: GeoJSON.Feature<GeoJSON.Point, { label: string; thickness: number; radius: number }>[] = [];

  nodes.forEach((node) => {
    const dEastKm = node.dLong * sinD + node.dLat * cosD;
    const dNorthKm = node.dLong * cosD - node.dLat * sinD;

    const lat = originLat + dNorthKm / kmPerDegLat;
    const lng = originLng + dEastKm / kmPerDegLng;

    features.push({
      type: 'Feature',
      properties: {
        label: node.label,
        thickness: node.thickness,
        radius: node.radius,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    });
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Generates a nautical bathymetric / hydrographic coordinate grid overlay (Image 3)
 * with dashed lat/lng parallels, meridians, and tactical crosshairs.
 */
export function generateNauticalCoordinateGrid(
  centerLat: number,
  centerLng: number,
  extentKm = 24,
  stepKm = 4
): { lines: GeoJSON.FeatureCollection<GeoJSON.LineString>; crosses: GeoJSON.FeatureCollection<GeoJSON.Point> } {
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((centerLat * Math.PI) / 180);

  const lineFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  const crossFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];

  const half = extentKm / 2;
  const minLat = centerLat - half / kmPerDegLat;
  const maxLat = centerLat + half / kmPerDegLat;
  const minLng = centerLng - half / kmPerDegLng;
  const maxLng = centerLng + half / kmPerDegLng;

  // Latitudes (Horizontals)
  for (let d = -half; d <= half; d += stepKm) {
    const lat = centerLat + d / kmPerDegLat;
    lineFeatures.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [minLng, lat],
          [maxLng, lat],
        ],
      },
    });
  }

  // Longitudes (Verticals)
  for (let d = -half; d <= half; d += stepKm) {
    const lng = centerLng + d / kmPerDegLng;
    lineFeatures.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, minLat],
          [lng, maxLat],
        ],
      },
    });
  }

  // Crosshairs at intersections
  for (let dX = -half; dX <= half; dX += stepKm * 2) {
    for (let dY = -half; dY <= half; dY += stepKm * 2) {
      const lat = centerLat + dY / kmPerDegLat;
      const lng = centerLng + dX / kmPerDegLng;
      crossFeatures.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      });
    }
  }

  return {
    lines: { type: 'FeatureCollection', features: lineFeatures },
    crosses: { type: 'FeatureCollection', features: crossFeatures },
  };
}

/**
 * Pre-configured MapLibre color palettes for the liquid heatmap
 */
export const HEATMAP_PALETTES: Record<HeatmapPalette, any[]> = {
  // 1. Fluid Thermal (Refined realistic petroleum thermal gradient)
  thermal: [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.0, 'rgba(0, 0, 0, 0)',
    0.10, 'rgba(255, 255, 255, 0.20)', // Silvery optical sheen
    0.22, 'rgba(251, 191, 36, 0.55)',  // Amber sheen
    0.38, 'rgba(34, 197, 94, 0.82)',  // Vibrant lime green
    0.54, 'rgba(234, 179, 8, 0.90)',  // Rich golden yellow
    0.70, 'rgba(249, 115, 22, 0.95)', // Blazing orange
    0.85, 'rgba(220, 38, 38, 0.98)',  // Fiery crimson
    0.95, 'rgba(127, 29, 29, 1.0)',   // Deep maroon
    1.0,  'rgba(18, 4, 8, 1.0)',      // Pitch-black core
  ],

  // 2. Magma Ultraviolet (Matches Reference Image 2: Violet -> Magenta -> Amber -> Golden aura)
  magma: [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.0, 'rgba(15, 23, 42, 0)',
    0.12, 'rgba(254, 240, 138, 0.45)', // Pale yellow rim
    0.28, 'rgba(245, 158, 11, 0.72)',  // Amber
    0.48, 'rgba(217, 70, 239, 0.86)',  // Radiant magenta
    0.68, 'rgba(147, 51, 234, 0.94)',  // Purple violet
    0.85, 'rgba(79, 70, 229, 0.98)',   // Deep indigo
    0.95, 'rgba(49, 46, 129, 1.0)',    // Midnight purple
    1.0,  'rgba(15, 12, 41, 1.0)',     // Dense dark center
  ],

  // 3. Bonn Heavy Crude (International maritime oil spill standard)
  bonn: [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.0, 'rgba(0, 0, 0, 0)',
    0.15, 'rgba(254, 240, 138, 0.35)', // Sheen
    0.35, 'rgba(234, 179, 8, 0.65)',   // Rainbow
    0.55, 'rgba(194, 65, 12, 0.85)',   // Metallic/Mousse
    0.75, 'rgba(120, 53, 15, 0.94)',   // Discolored
    0.90, 'rgba(67, 20, 7, 0.98)',     // Heavy oil
    1.0,  'rgba(10, 3, 3, 1.0)',       // Pure black crude
  ],

  // 4. Vibrant Full-Spectrum Rainbow
  rainbow: [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.0, 'rgba(0, 0, 0, 0)',
    0.12, 'rgba(59, 130, 246, 0.45)', // Blue
    0.30, 'rgba(16, 185, 129, 0.75)', // Green
    0.50, 'rgba(234, 179, 8, 0.88)',  // Yellow
    0.72, 'rgba(249, 115, 22, 0.95)', // Orange
    0.88, 'rgba(239, 68, 68, 0.98)',  // Red
    1.0,  'rgba(88, 28, 135, 1.0)',   // Purple peak
  ],
};
