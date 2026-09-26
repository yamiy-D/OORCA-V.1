/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateDestinationPoint, calculateBoundingBox } from '../utils/geoCalculation';
import { degToRad } from '../utils/unitConversion';
import { SpillGeometry, SpillContour, SpillMeasurement } from '../models/simulation.model';

export class GeometryService {
  /**
   * Generates realistic irregular elliptical polygon coordinates and thickness contours.
   *
   * @param centroid - Geographic center of the slick
   * @param measurements - Physical dimensions (length, width, direction)
   * @param elapsedHours - Time elapsed (influences hydrodynamic shearing and roughness)
   */
  public static generateSpillGeometry(
    centroid: { latitude: number; longitude: number },
    measurements: SpillMeasurement,
    elapsedHours: number
  ): SpillGeometry {
    const halfLengthMeters = (measurements.estimatedLengthKm * 1000) / 2;
    const halfWidthMeters = (measurements.estimatedWidthKm * 1000) / 2;
    const headingDeg = measurements.direction;

    // 1. Generate outer boundary polygon points with hydrodynamic turbulence
    const outerCoordinates = this.generateContourPolygon(
      centroid,
      halfLengthMeters,
      halfWidthMeters,
      headingDeg,
      1.0, // Scale 100%
      elapsedHours,
      36   // 36 vertices
    );

    // 2. Generate multi-tier Bonn Agreement thickness contours
    const contours: SpillContour[] = [
      {
        level: 'Very Thick',
        thicknessMicrons: '> 250 µm (Black/Dark Brown Emulsion)',
        colorHex: '#080202',
        fillOpacity: 0.92,
        points: this.generateContourPolygon(centroid, halfLengthMeters, halfWidthMeters, headingDeg, 0.22, elapsedHours, 24),
      },
      {
        level: 'Thick',
        thicknessMicrons: '100 – 250 µm (Heavy True Oil Color)',
        colorHex: '#1e0d06',
        fillOpacity: 0.78,
        points: this.generateContourPolygon(centroid, halfLengthMeters, halfWidthMeters, headingDeg, 0.42, elapsedHours, 28),
      },
      {
        level: 'Medium',
        thicknessMicrons: '20 – 100 µm (Dark Chocolate Mousse)',
        colorHex: '#451a03',
        fillOpacity: 0.62,
        points: this.generateContourPolygon(centroid, halfLengthMeters, halfWidthMeters, headingDeg, 0.65, elapsedHours, 32),
      },
      {
        level: 'Thin',
        thicknessMicrons: '5 – 20 µm (Metallic Iridescent Sheen)',
        colorHex: '#b45309',
        fillOpacity: 0.40,
        points: this.generateContourPolygon(centroid, halfLengthMeters, halfWidthMeters, headingDeg, 0.84, elapsedHours, 34),
      },
      {
        level: 'Very Thin',
        thicknessMicrons: '0.1 – 5 µm (Rainbow/Silver Sheen Edge)',
        colorHex: '#eab308',
        fillOpacity: 0.22,
        points: outerCoordinates,
      },
    ];

    // 3. Compute tight bounding box
    const boundingBox = calculateBoundingBox(outerCoordinates);

    return {
      centroid,
      boundingBox,
      lengthKm: measurements.estimatedLengthKm,
      widthKm: measurements.estimatedWidthKm,
      areaKm2: measurements.surfaceAreaKm2,
      direction: measurements.direction,
      spreadRate: measurements.spreadRate,
      coordinates: outerCoordinates,
      contours,
    };
  }

  /**
   * Generates polygon ring points with sinusoidal hydrodynamic perturbation.
   */
  private static generateContourPolygon(
    centroid: { latitude: number; longitude: number },
    semiMajorMeters: number,
    semiMinorMeters: number,
    bearingDeg: number,
    scale: number,
    elapsedHours: number,
    vertexCount: number = 32
  ): [number, number][] {
    const points: [number, number][] = [];
    const a = Math.max(semiMajorMeters * scale, 35);
    const b = Math.max(semiMinorMeters * scale, 20);

    for (let i = 0; i <= vertexCount; i++) {
      const angle = (i / vertexCount) * 2 * Math.PI; // 0 to 2pi

      // Harmonic hydrodynamic perturbation:
      // High harmonic noise gives natural fluid boundary rather than a sterile computer ellipse
      const noise =
        1.0 +
        0.08 * Math.sin(3 * angle + elapsedHours * 0.4) +
        0.05 * Math.sin(5 * angle - elapsedHours * 0.2) +
        0.03 * Math.cos(7 * angle);

      // Local ellipse coordinates (x along major axis, y along minor axis)
      const xLocal = a * Math.cos(angle) * noise;
      const yLocal = b * Math.sin(angle) * noise;

      // Distance from center to vertex
      const distMeters = Math.sqrt(xLocal * xLocal + yLocal * yLocal);
      // Local bearing offset
      const angleFromMajorDeg = (Math.atan2(yLocal, xLocal) * 180) / Math.PI;
      // Absolute geographic bearing
      const vertexBearingDeg = (bearingDeg + angleFromMajorDeg + 360) % 360;

      const vertex = calculateDestinationPoint(
        centroid.latitude,
        centroid.longitude,
        distMeters,
        vertexBearingDeg
      );

      points.push([vertex.latitude, vertex.longitude]);
    }

    return points;
  }
}
