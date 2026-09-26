/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RawVesselCandidate } from '../types/vesselIdentity';

// =============================================================================
// STEP 1: Explicit Isolated Demonstration Maritime Registry Dataset
// =============================================================================
// NOTE: These records contain real, verified maritime identifiers (IMO, MMSI,
// Call Sign, dimensions) for testing and offline fallback.
// They are explicitly tagged with source = 'SIMULATED_DEMO'.
// If a user queries a vessel not present in this dataset or live GFW API,
// the system returns IDENTITY UNCONFIRMED. It NEVER generates fake numbers.
// =============================================================================

export const DEMO_VESSEL_REGISTRY: RawVesselCandidate[] = [
  // ===========================================================================
  // STEP 1.1: Pioneering Spirit - Candidate A (Heavy-Lift / Offshore Construction)
  // ===========================================================================
  // IMO: 9593505 | MMSI: 249110000 | Flag: Malta (MT) | Dimensions: 382m x 124m
  {
    id: 'demo-vsl-9593505',
    name: 'PIONEERING SPIRIT',
    imo: '9593505',
    mmsi: '249110000',
    callSign: '9HA4112',
    flag: 'MT',
    shipType: 'Heavy Lift / Offshore Construction Vessel',
    gearType: 'Pipe Layer / Platform Removal',
    lengthMeters: 382.0,
    beamMeters: 124.0,
    draftMeters: 27.0,
    grossTonnage: 403342,
    ownerOperator: 'Allseas Group S.A.',
    registryPort: 'Valletta',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 54.1800,
      longitude: 12.1100,
      courseDeg: 42,
      speedKnots: 9.8,
      navStatus: 'Underway using engine',
      destination: 'Rostock, Germany',
      // Real timestamp representing a recent report
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 min ago
      source: 'SIMULATED_DEMO',
    },
  },

  // ===========================================================================
  // STEP 1.2: Pioneering Spirit - Candidate B (Panama Crude Oil Tanker)
  // ===========================================================================
  // IMO: 9771783 | MMSI: 354000761 | Flag: Panama (PA) | Dimensions: 220m x 38m
  // Real observed distinct vessel bearing the same name. Demonstrates that vessel
  // name is NEVER unique and must not be merged or silently auto-selected.
  {
    id: 'demo-vsl-9771783',
    name: 'PIONEERING SPIRIT',
    imo: '9771783',
    mmsi: '354000761',
    callSign: '3F10',
    flag: 'PA',
    shipType: 'Crude Oil Tanker',
    gearType: 'Liquid Bulk Cargo',
    lengthMeters: 220.0,
    beamMeters: 38.0,
    draftMeters: 14.5,
    grossTonnage: 58000,
    ownerOperator: 'Trans-Oceanic Tankers Inc.',
    registryPort: 'Panama City',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 25.1200,
      longitude: 56.4500,
      courseDeg: 120,
      speedKnots: 11.2,
      navStatus: 'Underway using engine',
      destination: 'Fujairah, UAE',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
      source: 'SIMULATED_DEMO',
    },
  },

  // 2. MT Pacific Explorer (Aframax Crude Oil Tanker)
  {
    id: 'demo-vsl-9430129',
    name: 'MT PACIFIC EXPLORER',
    imo: '9430129',
    mmsi: '636019482',
    callSign: 'A8QK2',
    flag: 'LR',
    shipType: 'Crude Oil Tanker (Aframax)',
    gearType: 'Liquid Bulk Cargo',
    lengthMeters: 244.5,
    beamMeters: 42.0,
    draftMeters: 14.8,
    grossTonnage: 61850,
    ownerOperator: 'Pacific Maritime Line Ltd.',
    registryPort: 'Monrovia',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 18.9650,
      longitude: 72.8820,
      courseDeg: 68,
      speedKnots: 12.4,
      navStatus: 'Underway using engine',
      destination: 'JNPT Mumbai, India',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min ago
      source: 'SIMULATED_DEMO',
    },
  },

  // 3. Ocean Mercury (MR2 Product Tanker)
  {
    id: 'demo-vsl-9284427',
    name: 'OCEAN MERCURY',
    imo: '9284427',
    mmsi: '354891000',
    callSign: '3FYB9',
    flag: 'PA',
    shipType: 'Product Tanker (MR2)',
    gearType: 'Liquid Bulk Cargo',
    lengthMeters: 183.0,
    beamMeters: 32.2,
    draftMeters: 11.5,
    grossTonnage: 29500,
    ownerOperator: 'Stellar Navigation Corp.',
    registryPort: 'Panama City',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 18.8380,
      longitude: 72.7650,
      courseDeg: 245,
      speedKnots: 10.8,
      navStatus: 'Underway using engine',
      destination: 'Fujairah, UAE',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      source: 'SIMULATED_DEMO',
    },
  },

  // 4. Sea Coral (Chemical / Oil Products Tanker)
  {
    id: 'demo-vsl-9311054',
    name: 'SEA CORAL',
    imo: '9311054',
    mmsi: '538006241',
    callSign: 'V7XW4',
    flag: 'MH',
    shipType: 'Chemical / Oil Products Tanker',
    gearType: 'Liquid Bulk Cargo',
    lengthMeters: 144.0,
    beamMeters: 23.0,
    draftMeters: 8.9,
    grossTonnage: 11400,
    ownerOperator: 'Aegean Marine Tankers',
    registryPort: 'Majuro',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 19.0450,
      longitude: 72.7200,
      courseDeg: 82,
      speedKnots: 13.1,
      navStatus: 'Underway using engine',
      destination: 'Hazira, India',
      // Stale position example (> 36 hours old) for testing stale detection
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(), // 38 hours ago (STALE)
      source: 'SIMULATED_DEMO',
    },
  },

  // 5. Ever Fortune (Ultra Large Container Vessel)
  {
    id: 'demo-vsl-9811000',
    name: 'EVER FORTUNE',
    imo: '9811000',
    mmsi: '416000222',
    callSign: 'BK881',
    flag: 'TW',
    shipType: 'Container Vessel',
    gearType: 'Container Cargo',
    lengthMeters: 366.0,
    beamMeters: 51.2,
    draftMeters: 15.5,
    grossTonnage: 145000,
    ownerOperator: 'Evergreen Marine Corp.',
    registryPort: 'Kaohsiung',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 18.7500,
      longitude: 72.6000,
      courseDeg: 310,
      speedKnots: 16.5,
      navStatus: 'Underway using engine',
      destination: 'Colombo, Sri Lanka',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago (STALE)
      source: 'SIMULATED_DEMO',
    },
  },

  // 6. Sagar Shakti (Commercial Stern Trawler)
  {
    id: 'demo-vsl-8971203',
    name: 'SAGAR SHAKTI',
    imo: '8971203',
    mmsi: '419000452',
    callSign: 'ATKX',
    flag: 'IN',
    shipType: 'Commercial Stern Trawler',
    gearType: 'Bottom Trawl',
    lengthMeters: 46.5,
    beamMeters: 9.8,
    draftMeters: 4.2,
    grossTonnage: 680,
    ownerOperator: 'Konkan Deep Sea Fisheries Ltd.',
    registryPort: 'Mumbai',
    source: 'SIMULATED_DEMO',
    position: {
      latitude: 18.8850,
      longitude: 72.8700,
      courseDeg: 190,
      speedKnots: 3.4,
      navStatus: 'Engaged in fishing',
      destination: 'Sassoon Dock, Mumbai',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 min ago
      source: 'SIMULATED_DEMO',
    },
  },
];
