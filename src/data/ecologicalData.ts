/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EcologicalInhabitant } from '../types/simulation';

export const DEFAULT_ECOLOGICAL_DATA: EcologicalInhabitant[] = [
  {
    id: 'eco-1',
    speciesHabitat: 'Mangroves',
    iconType: 'mangrove',
    presence: 'High',
    riskLevel: 'High',
  },
  {
    id: 'eco-2',
    speciesHabitat: 'Coral Reefs',
    iconType: 'coral',
    presence: 'Medium',
    riskLevel: 'High',
  },
  {
    id: 'eco-3',
    speciesHabitat: 'Seagrass Beds',
    iconType: 'seagrass',
    presence: 'High',
    riskLevel: 'High',
  },
  {
    id: 'eco-4',
    speciesHabitat: 'Dolphins',
    iconType: 'dolphin',
    presence: 'Medium',
    riskLevel: 'Medium',
  },
  {
    id: 'eco-5',
    speciesHabitat: 'Sea Turtles',
    iconType: 'turtle',
    presence: 'Low',
    riskLevel: 'Medium',
  },
  {
    id: 'eco-6',
    speciesHabitat: 'Fish (Commercial)',
    iconType: 'fish',
    presence: 'High',
    riskLevel: 'High',
  },
  {
    id: 'eco-7',
    speciesHabitat: 'Plankton',
    iconType: 'plankton',
    presence: 'High',
    riskLevel: 'Low',
  },
];
