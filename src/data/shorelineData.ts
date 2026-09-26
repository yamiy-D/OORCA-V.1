/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShorelineImpact } from '../types/simulation';

export const DEFAULT_SHORELINE_DATA: ShorelineImpact[] = [
  {
    id: 'shore-1',
    location: 'MV Oceanic Star (Bay of Bengal)',
    arrivalTime: '36 - 48 h',
    impactLevel: 'High',
    distanceKm: 18.5,
    coordinates: [16.6500, 82.4000],
  },
  {
    id: 'shore-2',
    location: 'Revdanda Beach',
    arrivalTime: '48 - 60 h',
    impactLevel: 'Medium',
    distanceKm: 26.2,
    coordinates: [18.5539, 72.9238],
  },
  {
    id: 'shore-3',
    location: 'Murud Beach',
    arrivalTime: '60 - 72 h',
    impactLevel: 'Medium',
    distanceKm: 38.0,
    coordinates: [18.3283, 72.9622],
  },
  {
    id: 'shore-4',
    location: 'Kihim Beach',
    arrivalTime: '72+ h',
    impactLevel: 'Low',
    distanceKm: 24.1,
    coordinates: [18.7231, 72.8729],
  },
  {
    id: 'shore-5',
    location: 'Dighi Port',
    arrivalTime: '72+ h',
    impactLevel: 'Low',
    distanceKm: 52.4,
    coordinates: [18.2833, 73.0167],
  },
];
