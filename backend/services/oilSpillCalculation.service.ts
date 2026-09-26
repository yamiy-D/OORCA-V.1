/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateDriftVector } from '../utils/vectorCalculation';
import { calculateDestinationPoint, haversineDistanceKm } from '../utils/geoCalculation';
import { toMetricTonnes, tonnesToCubicMeters } from '../utils/unitConversion';
import { NormalizedEnvironmentalData } from '../models/environmentalData.model';
import { SimulationInput, SpillMeasurement } from '../models/simulation.model';

export interface OilProperties {
  type: string;
  name: string;
  densityKgM3: number;       // kg/m³
  viscosityCSt: number;      // cSt @ 20°C
  evaporativeFractionMax: number; // Maximum % that can evaporate
  distillationConstantA: number;
  distillationConstantB: number;
  emulsificationMax: number; // Max water uptake %
}

export const OIL_DATABASE: Record<string, OilProperties> = {
  crude_oil: {
    type: 'crude_oil',
    name: 'Arabian Light Crude Oil (API 32°)',
    densityKgM3: 880,
    viscosityCSt: 16.5,
    evaporativeFractionMax: 0.42,
    distillationConstantA: 2.15,
    distillationConstantB: 0.042,
    emulsificationMax: 0.70,
  },
  diesel: {
    type: 'diesel',
    name: 'Marine Gasoil / Diesel No. 2 (MGO)',
    densityKgM3: 840,
    viscosityCSt: 3.2,
    evaporativeFractionMax: 0.85,
    distillationConstantA: 3.4,
    distillationConstantB: 0.065,
    emulsificationMax: 0.05,
  },
  heavy_fuel_oil: {
    type: 'heavy_fuel_oil',
    name: 'Heavy Fuel Oil Bunker C (IFO 380)',
    densityKgM3: 985,
    viscosityCSt: 380,
    evaporativeFractionMax: 0.12,
    distillationConstantA: 1.1,
    distillationConstantB: 0.02,
    emulsificationMax: 0.80,
  },
  marine_fuel_oil: {
    type: 'marine_fuel_oil',
    name: 'Intermediate Fuel Oil (IFO 180)',
    densityKgM3: 955,
    viscosityCSt: 180,
    evaporativeFractionMax: 0.18,
    distillationConstantA: 1.45,
    distillationConstantB: 0.025,
    emulsificationMax: 0.75,
  },
  refined_product: {
    type: 'refined_product',
    name: 'Aviation Kerosene / Jet A-1',
    densityKgM3: 805,
    viscosityCSt: 2.1,
    evaporativeFractionMax: 0.92,
    distillationConstantA: 4.2,
    distillationConstantB: 0.08,
    emulsificationMax: 0.02,
  },
};

export class OilSpillCalculationService {
  /**
   * Retrieves oil physical and chemical parameters based on type key.
   */
  public static getOilProperties(typeKey: string, customDensity?: number, customViscosity?: number): OilProperties {
    const key = (typeKey || 'crude_oil').toLowerCase().trim();
    const base = OIL_DATABASE[key] || OIL_DATABASE.crude_oil;

    return {
      ...base,
      densityKgM3: customDensity && customDensity > 600 ? customDensity : base.densityKgM3,
      viscosityCSt: customViscosity && customViscosity > 0 ? customViscosity : base.viscosityCSt,
    };
  }

  /**
   * Calculates net drift speed (m/s) and bearing (degrees) given current and wind.
   */
  public static calculateNetDrift(
    env: NormalizedEnvironmentalData,
    latitude: number
  ): { driftSpeedMps: number; driftHeadingDeg: number; u: number; v: number } {
    return calculateDriftVector(
      { speedMps: env.oceanCurrent.speed, directionDeg: env.oceanCurrent.direction },
      { speedMps: env.wind.speed, directionDeg: env.wind.direction },
      latitude,
      0.032 // Standard 3.2% wind leeway factor
    );
  }

  /**
   * Calculates Fay spreading dynamics and dimensions for elapsed time (hours).
   *
   * @param initialTonnes - Initial spilled oil in metric tonnes
   * @param oilProps - Oil properties
   * @param elapsedHours - Time elapsed since initial release (hours)
   * @param driftSpeedMps - Net surface drift velocity (m/s)
   * @param previousAreaKm2 - Area from preceding timestep for spread rate calculation
   */
  public static calculateSpreadDimensions(
    initialTonnes: number,
    oilProps: OilProperties,
    elapsedHours: number,
    driftSpeedMps: number,
    previousAreaKm2: number = 0
  ): {
    surfaceAreaKm2: number;
    estimatedRadiusKm: number;
    estimatedLengthKm: number;
    estimatedWidthKm: number;
    spreadRateKm2PerHr: number;
  } {
    const volumeM3 = tonnesToCubicMeters(initialTonnes, oilProps.densityKgM3);
    const tSeconds = Math.max(elapsedHours * 3600, 180); // Minimum 3 minutes for initial pool

    const g = 9.81;
    const rhoWater = 1025;
    const delta = Math.max((rhoWater - oilProps.densityKgM3) / rhoWater, 0.02);
    const nuWater = 1.05e-6; // Kinematic viscosity of seawater (m²/s)

    // Phase transition times according to Fay:
    // t1 = (V / (g * delta * nuWater^0.5))^(1/3)
    const t1 = Math.pow(volumeM3 / (g * delta * Math.sqrt(nuWater)), 1 / 3) * 0.85;

    let equivalentRadiusM: number;
    if (tSeconds < t1) {
      // Phase 1: Gravity-Inertial
      // r ~ k1 * (delta * g * V * t^2)^(1/4)
      equivalentRadiusM = 1.14 * Math.pow(delta * g * volumeM3 * tSeconds * tSeconds, 0.25);
    } else {
      // Phase 2 & 3: Gravity-Viscous & Surface Tension
      // r ~ k2 * (delta * g * V^2 / nu^0.5)^(1/6) * t^(1/4)
      const rViscous = 0.98 * Math.pow((delta * g * volumeM3 * volumeM3) / Math.sqrt(nuWater), 1 / 6) * Math.pow(tSeconds, 0.25);
      // As time grows, natural dispersion limits physical spread thickness:
      equivalentRadiusM = Math.min(rViscous, 4200 * Math.pow(volumeM3 / 1000, 0.35) * Math.pow(elapsedHours / 24, 0.28));
    }

    // Minimum radius based on initial spill
    equivalentRadiusM = Math.max(equivalentRadiusM, 85);

    // Elongation under hydrodynamic shear & wind leeway
    // Faster drift causes significant stretching along the drift axis:
    const driftSpeedKts = driftSpeedMps / 0.514444;
    const elongationFactor = 1.0 + Math.min(0.45 * driftSpeedKts * Math.log10(1 + elapsedHours), 5.5);

    const equivalentAreaM2 = Math.PI * equivalentRadiusM * equivalentRadiusM;
    // Area in km2
    const surfaceAreaKm2 = Math.round((equivalentAreaM2 / 1_000_000) * 100) / 100;

    // Major axis (Length) and Minor axis (Width)
    // Area = pi * (L/2) * (W/2) => L = 2 * r * sqrt(elongation), W = 2 * r / sqrt(elongation)
    const lengthM = 2 * equivalentRadiusM * Math.sqrt(elongationFactor);
    const widthM = (2 * equivalentRadiusM) / Math.sqrt(elongationFactor);

    const estimatedLengthKm = Math.round((lengthM / 1000) * 100) / 100;
    const estimatedWidthKm = Math.round((widthM / 1000) * 100) / 100;
    const estimatedRadiusKm = Math.round((equivalentRadiusM / 1000) * 100) / 100;

    // Spread rate (km²/hr)
    const spreadRateKm2PerHr =
      previousAreaKm2 > 0
        ? Math.max(Math.round(((surfaceAreaKm2 - previousAreaKm2) / Math.max(elapsedHours, 1)) * 100) / 100, 0.05)
        : Math.round((surfaceAreaKm2 / Math.max(elapsedHours, 1)) * 100) / 100;

    return {
      surfaceAreaKm2: Math.max(surfaceAreaKm2, 0.05),
      estimatedRadiusKm: Math.max(estimatedRadiusKm, 0.08),
      estimatedLengthKm: Math.max(estimatedLengthKm, 0.12),
      estimatedWidthKm: Math.max(estimatedWidthKm, 0.06),
      spreadRateKm2PerHr,
    };
  }

  /**
   * Calculates oil weathering (evaporation, natural dispersion, emulsification) over time.
   */
  public static calculateWeathering(
    oilProps: OilProperties,
    elapsedHours: number,
    windSpeedMps: number,
    temperatureCelsius: number,
    waveHeightMeters: number
  ): {
    evaporationPct: number;
    dispersionPct: number;
    remainingOnSurfacePct: number;
    emulsificationPct: number;
  } {
    if (elapsedHours <= 0) {
      return {
        evaporationPct: 0,
        dispersionPct: 0,
        remainingOnSurfacePct: 100,
        emulsificationPct: 0,
      };
    }

    // 1. Evaporation based on Mackay evaporative exposure model
    // Higher temperature and higher wind speed accelerate evaporation rate
    const tempK = temperatureCelsius + 273.15;
    const windEffect = Math.pow(Math.max(windSpeedMps, 1.5) / 5.0, 0.78);
    const tempEffect = Math.exp(0.025 * (temperatureCelsius - 20));

    // Exposure factor: theta = k_evap * t
    const exposure = 0.018 * windEffect * tempEffect * elapsedHours;
    const rawEvap = (oilProps.distillationConstantA / 10) * Math.log(1 + 4.5 * exposure);
    const evaporationFraction = Math.min(rawEvap, oilProps.evaporativeFractionMax);

    // 2. Natural dispersion (Delvigne & Sweeney model based on breaking waves)
    // Occurs primarily when wind speed > 5 m/s or wave height > 1.0 m
    const breakingWaveFraction = waveHeightMeters > 0.8 ? Math.min(0.015 * Math.pow(windSpeedMps / 5, 2), 0.25) : 0.005;
    const dispersionFraction = Math.min(
      breakingWaveFraction * (1 - evaporationFraction) * (1 / Math.sqrt(oilProps.viscosityCSt / 10)) * Math.pow(elapsedHours, 0.65),
      0.35
    );

    // 3. Emulsification (mousse formation, water uptake in remaining oil)
    const emulsification =
      oilProps.emulsificationMax > 0.1
        ? oilProps.emulsificationMax * (1 - Math.exp(-0.06 * Math.max(windSpeedMps, 2) * elapsedHours))
        : 0;

    const remainingFraction = Math.max(1 - evaporationFraction - dispersionFraction, 0.05);

    return {
      evaporationPct: Math.round(evaporationFraction * 1000) / 10,
      dispersionPct: Math.round(dispersionFraction * 1000) / 10,
      remainingOnSurfacePct: Math.round(remainingFraction * 1000) / 10,
      emulsificationPct: Math.round(emulsification * 1000) / 10,
    };
  }

  /**
   * Generates step-by-step measurements for a given simulation time step.
   */
  public static calculateStepMeasurements(
    input: SimulationInput,
    elapsedHours: number,
    env: NormalizedEnvironmentalData,
    originLat: number,
    originLng: number,
    previousAreaKm2: number = 0
  ): {
    measurements: SpillMeasurement;
    centroid: { latitude: number; longitude: number };
    movementDistanceKm: number;
    directionDeg: number;
  } {
    const oilProps = this.getOilProperties(input.oilType, input.oilDensity, input.oilViscosity);
    const quantityTonnes = toMetricTonnes(input.oilQuantity, 'tonnes', oilProps.densityKgM3);

    // 1. Net drift calculation
    const drift = this.calculateNetDrift(env, originLat);

    // 2. Trajectory displacement over elapsed time
    const totalDistanceMeters = drift.driftSpeedMps * (elapsedHours * 3600);
    const newPosition = calculateDestinationPoint(
      originLat,
      originLng,
      totalDistanceMeters,
      drift.driftHeadingDeg
    );

    const movementDistanceKm =
      Math.round(haversineDistanceKm(originLat, originLng, newPosition.latitude, newPosition.longitude) * 100) / 100;

    // 3. Physical spread dimensions
    const dimensions = this.calculateSpreadDimensions(
      quantityTonnes,
      oilProps,
      elapsedHours,
      drift.driftSpeedMps,
      previousAreaKm2
    );

    // 4. Weathering
    const weathering = this.calculateWeathering(
      oilProps,
      elapsedHours,
      env.wind.speed,
      env.temperature,
      env.waveHeight
    );

    return {
      measurements: {
        surfaceAreaKm2: dimensions.surfaceAreaKm2,
        estimatedRadiusKm: dimensions.estimatedRadiusKm,
        estimatedLengthKm: dimensions.estimatedLengthKm,
        estimatedWidthKm: dimensions.estimatedWidthKm,
        movementDistanceKm,
        direction: drift.driftHeadingDeg,
        spreadRate: dimensions.spreadRateKm2PerHr,
        evaporationPct: weathering.evaporationPct,
        dispersionPct: weathering.dispersionPct,
        remainingOnSurfacePct: weathering.remainingOnSurfacePct,
        emulsificationPct: weathering.emulsificationPct,
      },
      centroid: newPosition,
      movementDistanceKm,
      directionDeg: drift.driftHeadingDeg,
    };
  }
}
