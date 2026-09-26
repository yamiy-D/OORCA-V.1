/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEnvironmentalData } from './environmentalData.model';

export type OilTypeCategory = 
  | 'crude_oil' 
  | 'diesel' 
  | 'heavy_fuel_oil' 
  | 'marine_fuel_oil' 
  | 'refined_product';

export interface SimulationInput {
  latitude: number;
  longitude: number;
  oilQuantity: number;
  oilType: string;
  startTime: string;            // ISO UTC format
  simulationDuration: number;   // Duration in hours (e.g. 24, 48, 72)
  timeStepMinutes?: number;     // Configurable interval: 10, 30, 60, 180, 360 (default: 60)
  
  // Optional parameters
  vesselName?: string;
  vesselType?: string;
  imoNumber?: string;
  vesselHeading?: number;
  oilDensity?: number;          // kg/m³ (e.g. 880 for Arab Light crude)
  oilViscosity?: number;        // cSt or mPa.s
  initialSpillRadius?: number;  // meters
  releaseRate?: number;         // tonnes/hour if continuous
  waterTemperature?: number;    // Celsius override
  customEnvironmentalData?: Partial<NormalizedEnvironmentalData>;
}

export interface SpillMeasurement {
  surfaceAreaKm2: number;
  estimatedRadiusKm: number;
  estimatedLengthKm: number;
  estimatedWidthKm: number;
  movementDistanceKm: number;
  direction: number;            // Bearing in degrees
  spreadRate: number;           // km²/hr
  evaporationPct: number;       // % evaporated
  dispersionPct: number;        // % naturally dispersed
  remainingOnSurfacePct: number;// % remaining as surface slick
  emulsificationPct?: number;   // % water-in-oil emulsion
}

export interface SpillContour {
  level: 'Very Thin' | 'Thin' | 'Medium' | 'Thick' | 'Very Thick';
  thicknessMicrons: string;
  colorHex: string;
  fillOpacity: number;
  points: [number, number][];   // [lat, lng]
}

export interface SpillGeometry {
  centroid: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  lengthKm: number;
  widthKm: number;
  areaKm2: number;
  direction: number;
  spreadRate: number;
  coordinates: [number, number][]; // Outer boundary [lat, lng]
  contours: SpillContour[];
}

export interface TrajectoryPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  hour: number;
  distanceFromOriginKm: number;
}

export interface SimulationStep {
  stepIndex: number;
  hour: number;
  timestamp: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  environment: NormalizedEnvironmentalData;
  measurements: SpillMeasurement;
  geometry: SpillGeometry;
}

export interface SimulationMetadata {
  environmentalDataSource: string;
  simulationModel: string;      // e.g. "OORCA Fay-Mackay Hydrodynamic Engine v1.0"
  generatedAt: string;
  confidence: 'high' | 'medium' | 'low';
  calculationMethod: string;
  isEstimated: boolean;
}

export interface SimulationResult {
  simulationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  environment: {
    windSpeed: number;
    windDirection: number;
    currentSpeed: number;
    currentDirection: number;
    temperature: number;
    waveHeight: number;
  };
  spill: {
    oilType: string;
    quantity: number;
    unit: string;
  };
  measurements: {
    areaKm2: number;
    lengthKm: number;
    widthKm: number;
    movementDistanceKm: number;
    spreadRate: number;
    evaporationPct: number;
    dispersionPct: number;
    remainingOnSurfacePct: number;
  };
  geometry: SpillGeometry;
  trajectory: TrajectoryPoint[];
  timeline: SimulationStep[];
  metadata: SimulationMetadata;
}
