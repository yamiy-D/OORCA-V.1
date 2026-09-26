/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentalDataService } from './environmentalData.service';
import { OilSpillCalculationService } from './oilSpillCalculation.service';
import { GeometryService } from './geometry.service';
import {
  SimulationInput,
  SimulationResult,
  SimulationStep,
  TrajectoryPoint,
  SpillMeasurement,
} from '../models/simulation.model';

const simulationStore = new Map<string, SimulationResult>();

export class SimulationService {
  /**
   * Starts and executes a full time-based oil spill simulation.
   */
  public static async startSimulation(input: SimulationInput): Promise<SimulationResult> {
    // 1. Validate inputs
    if (!input.latitude || !input.longitude) {
      throw new Error('Latitude and Longitude are required for simulation.');
    }
    if (!input.oilQuantity || input.oilQuantity <= 0) {
      throw new Error('Oil spill quantity must be greater than zero.');
    }
    const durationHours = Math.max(1, Math.min(input.simulationDuration || 72, 168)); // 1 to 168 hours (7 days)
    const stepMinutes = input.timeStepMinutes && [10, 30, 60, 180, 360].includes(input.timeStepMinutes)
      ? input.timeStepMinutes
      : 60; // Default 1 hour
    const stepHours = stepMinutes / 60;

    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTimeDate = input.startTime ? new Date(input.startTime) : new Date();

    // 2. Fetch or prepare base environmental conditions
    const normalizedEnv = input.customEnvironmentalData
      ? {
          ...(await EnvironmentalDataService.getNormalizedEnvironment(input.latitude, input.longitude, startTimeDate.toISOString())),
          ...input.customEnvironmentalData,
        }
      : await EnvironmentalDataService.getNormalizedEnvironment(
          input.latitude,
          input.longitude,
          startTimeDate.toISOString()
        );

    // 3. Time-step simulation execution loop
    const timeline: SimulationStep[] = [];
    const trajectory: TrajectoryPoint[] = [];

    const totalSteps = Math.ceil(durationHours / stepHours);
    let previousAreaKm2 = 0;

    for (let stepIdx = 0; stepIdx <= totalSteps; stepIdx++) {
      const currentElapsedHours = Math.min(stepIdx * stepHours, durationHours);
      const stepTimestamp = new Date(startTimeDate.getTime() + currentElapsedHours * 3600 * 1000).toISOString();

      // Calculate state for current timestep
      const { measurements, centroid, movementDistanceKm } =
        OilSpillCalculationService.calculateStepMeasurements(
          input,
          currentElapsedHours,
          normalizedEnv,
          input.latitude,
          input.longitude,
          previousAreaKm2
        );

      previousAreaKm2 = measurements.surfaceAreaKm2;

      // Generate realistic geometric contours and bounds
      const geometry = GeometryService.generateSpillGeometry(
        centroid,
        measurements,
        currentElapsedHours
      );

      const stepRecord: SimulationStep = {
        stepIndex: stepIdx,
        hour: Math.round(currentElapsedHours * 10) / 10,
        timestamp: stepTimestamp,
        centroid,
        environment: normalizedEnv,
        measurements,
        geometry,
      };

      timeline.push(stepRecord);

      trajectory.push({
        timestamp: stepTimestamp,
        latitude: centroid.latitude,
        longitude: centroid.longitude,
        hour: Math.round(currentElapsedHours * 10) / 10,
        distanceFromOriginKm: movementDistanceKm,
      });
    }

    // 4. Final state is the last step in the timeline
    const finalStep = timeline[timeline.length - 1];

    const result: SimulationResult = {
      simulationId,
      status: 'completed',
      environment: {
        windSpeed: normalizedEnv.wind.speed,
        windDirection: normalizedEnv.wind.direction,
        currentSpeed: normalizedEnv.oceanCurrent.speed,
        currentDirection: normalizedEnv.oceanCurrent.direction,
        temperature: normalizedEnv.temperature,
        waveHeight: normalizedEnv.waveHeight,
      },
      spill: {
        oilType: input.oilType || 'crude_oil',
        quantity: input.oilQuantity,
        unit: 'metric_tonnes',
      },
      measurements: {
        areaKm2: finalStep.measurements.surfaceAreaKm2,
        lengthKm: finalStep.measurements.estimatedLengthKm,
        widthKm: finalStep.measurements.estimatedWidthKm,
        movementDistanceKm: finalStep.measurements.movementDistanceKm,
        spreadRate: finalStep.measurements.spreadRate,
        evaporationPct: finalStep.measurements.evaporationPct,
        dispersionPct: finalStep.measurements.dispersionPct,
        remainingOnSurfacePct: finalStep.measurements.remainingOnSurfacePct,
      },
      geometry: finalStep.geometry,
      trajectory,
      timeline,
      metadata: {
        environmentalDataSource: normalizedEnv.metadata.source,
        simulationModel: 'OORCA Hydrodynamic Dispersion & Fay Spreading Engine v1.0',
        generatedAt: new Date().toISOString(),
        confidence: normalizedEnv.metadata.confidence,
        calculationMethod: 'Coupled Hydrodynamic-Atmospheric Lagrangian Drift & Three-Phase Spreading',
        isEstimated: true,
      },
    };

    // Store in-memory
    simulationStore.set(simulationId, result);

    return result;
  }

  /**
   * Retrieves full simulation by ID.
   */
  public static getSimulation(id: string): SimulationResult | null {
    return simulationStore.get(id) || null;
  }

  /**
   * Retrieves simulation timeline steps by ID.
   */
  public static getTimeline(id: string): SimulationStep[] | null {
    const sim = simulationStore.get(id);
    return sim ? sim.timeline : null;
  }

  /**
   * Retrieves latest measurements by ID.
   */
  public static getMeasurements(id: string): SpillMeasurement | null {
    const sim = simulationStore.get(id);
    if (!sim) return null;
    const finalStep = sim.timeline[sim.timeline.length - 1];
    return finalStep ? finalStep.measurements : null;
  }

  /**
   * Returns list of recent simulation IDs and basic summary.
   */
  public static listSimulations(): Array<{
    simulationId: string;
    status: string;
    generatedAt: string;
    oilType: string;
    quantity: number;
    areaKm2: number;
  }> {
    return Array.from(simulationStore.values()).map((sim) => ({
      simulationId: sim.simulationId,
      status: sim.status,
      generatedAt: sim.metadata.generatedAt,
      oilType: sim.spill.oilType,
      quantity: sim.spill.quantity,
      areaKm2: sim.measurements.areaKm2,
    }));
  }
}
