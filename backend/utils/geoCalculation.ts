/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { degToRad, radToDeg } from './unitConversion';

const EARTH_RADIUS_METERS = 6371008.8; // Mean Earth radius in meters
const EARTH_RADIUS_KM = 6371.0088;

/**
 * Calculates Great-Circle distance between two points using the Haversine formula.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const lat1Rad = degToRad(lat1);
  const lat2Rad = degToRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return haversineDistanceMeters(lat1, lon1, lat2, lon2) / 1000;
}

/**
 * Computes destination point given start point, distance (in meters), and bearing (in degrees).
 */
export function calculateDestinationPoint(
  lat: number,
  lon: number,
  distanceMeters: number,
  bearingDeg: number
): { latitude: number; longitude: number } {
  const delta = distanceMeters / EARTH_RADIUS_METERS;
  const theta = degToRad(bearingDeg);
  const phi1 = degToRad(lat);
  const lambda1 = degToRad(lon);

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);

  const y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  const x = Math.cos(delta) - Math.sin(phi1) * sinPhi2;
  const lambda2 = lambda1 + Math.atan2(y, x);

  return {
    latitude: Math.round(radToDeg(phi2) * 1000000) / 1000000,
    longitude: Math.round((((radToDeg(lambda2) + 540) % 360) - 180) * 1000000) / 1000000,
  };
}

/**
 * Calculates initial bearing from point A to point B in degrees.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = degToRad(lat1);
  const phi2 = degToRad(lat2);
  const deltaLambda = degToRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (radToDeg(theta) + 360) % 360;
}

/**
 * Calculates the bounding box enclosing a list of geographic points.
 */
export function calculateBoundingBox(points: [number, number][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (!points || points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return { minLat, maxLat, minLng, maxLng };
}
