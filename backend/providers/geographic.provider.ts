/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { haversineDistanceKm } from '../utils/geoCalculation';

export interface CoastalFeature {
  name: string;
  lat: number;
  lng: number;
  type: 'port' | 'urban' | 'mangrove' | 'sanctuary' | 'beach';
}

const REGIONAL_COASTAL_POINTS: CoastalFeature[] = [
  // Bay of Bengal & East Coast of India
  { name: 'Visakhapatnam Port & Marine Zone', lat: 17.6868, lng: 83.2185, type: 'port' },
  { name: 'Kakinada Deep Water Port & Coringa Mangroves', lat: 16.9891, lng: 82.2475, type: 'mangrove' },
  { name: 'Machilipatnam Coastal Estuary', lat: 16.1800, lng: 81.1300, type: 'sanctuary' },
  { name: 'Paradip Port & Coastal Waters', lat: 20.3167, lng: 86.6167, type: 'port' },
  { name: 'Chennai Port & Coromandel Coast', lat: 13.0827, lng: 80.2707, type: 'port' },
  { name: 'Bhitarkanika Mangrove Biosphere', lat: 20.7200, lng: 86.8700, type: 'mangrove' },
  
  // West Coast / Arabian Sea
  { name: 'Mumbai Harbor & Port Trust', lat: 18.9438, lng: 72.8628, type: 'port' },
  { name: 'Jawaharlal Nehru Port (JNPT)', lat: 18.9500, lng: 72.9500, type: 'port' },
  { name: 'Alibag Beach & Marine Zone', lat: 18.6414, lng: 72.8722, type: 'beach' },
  { name: 'Thane Creek Flamingo Sanctuary (Ramsar)', lat: 19.0330, lng: 72.9800, type: 'mangrove' },
  { name: 'Murud Janjira Coastal Biosphere', lat: 18.3000, lng: 72.9600, type: 'sanctuary' },
  { name: 'Kashid Marine Coast', lat: 18.4400, lng: 72.9000, type: 'beach' },
];

export class GeographicProvider {
  /**
   * Determines marine geographic zone and nearest sensitive shoreline feature.
   */
  public static getGeographicContext(lat: number, lng: number): {
    regionName: string;
    nearestCoastKm: number;
    nearestFeature: CoastalFeature;
    isInOpenWater: boolean;
  } {
    let minDistanceKm = Infinity;
    let closestFeature = REGIONAL_COASTAL_POINTS[0];

    for (const point of REGIONAL_COASTAL_POINTS) {
      const dist = haversineDistanceKm(lat, lng, point.lat, point.lng);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        closestFeature = point;
      }
    }

    let regionName = 'Offshore Oceanic Waters';
    if (lat >= 10.0 && lat <= 22.5 && lng >= 80.0 && lng <= 92.0) {
      regionName = 'Bay of Bengal — East Coast Maritime Corridor';
    } else if (lat >= 17.5 && lat <= 20.5 && lng >= 71.5 && lng <= 73.5) {
      regionName = 'Arabian Sea — Mumbai Offshore Continental Shelf Basin';
    } else if (lat >= 20.5 && lat <= 24.0 && lng >= 68.0 && lng <= 71.0) {
      regionName = 'Gulf of Kachchh Ecological Marine Corridor';
    } else if (lat >= 8.0 && lat <= 15.0 && lng >= 73.0 && lng <= 77.0) {
      regionName = 'Malabar Coastal Maritime Zone';
    }

    return {
      regionName,
      nearestCoastKm: Math.round(minDistanceKm * 10) / 10,
      nearestFeature: closestFeature,
      isInOpenWater: minDistanceKm > 5.0,
    };
  }
}
