/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit conversion utilities for maritime oceanographic and meteorological data.
 */

export function knotsToMps(knots: number): number {
  return knots * 0.514444;
}

export function mpsToKnots(mps: number): number {
  return mps / 0.514444;
}

export function kmhToMps(kmh: number): number {
  return kmh / 3.6;
}

export function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function kelvinToCelsius(k: number): number {
  return k - 273.15;
}

/**
 * Converts oil quantity in various units to metric tons (Tonnes).
 */
export function toMetricTonnes(quantity: number, unit: string, oilDensityKgM3: number = 880): number {
  const normalizedUnit = (unit || '').toLowerCase().trim();
  switch (normalizedUnit) {
    case 'tonnes':
    case 'tons':
    case 'tonne':
    case 'ton':
    case 'metric tons':
    case 'mt':
      return quantity;
    case 'barrels':
    case 'bbl':
    case 'bbls':
      // 1 barrel ~ 0.159 m3 * density
      return (quantity * 0.1589873 * oilDensityKgM3) / 1000;
    case 'm3':
    case 'm³':
    case 'cubic meters':
      return (quantity * oilDensityKgM3) / 1000;
    case 'gallons':
    case 'gal':
      // 1 US gallon = 0.00378541 m3
      return (quantity * 0.00378541 * oilDensityKgM3) / 1000;
    default:
      return quantity;
  }
}

/**
 * Converts metric tonnes to volume in cubic meters.
 */
export function tonnesToCubicMeters(tonnes: number, oilDensityKgM3: number = 880): number {
  return (tonnes * 1000) / oilDensityKgM3;
}
