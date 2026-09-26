/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =============================================================================
// STEP 1: Vessel Database Entity Models & Types
// =============================================================================
// Corresponds to the PostgreSQL / PostGIS database design (Requirement 12)
// Enforces stable surrogate keys and natural composite unique constraints.
// =============================================================================

export interface VesselEntity {
  id: string;                         // UUID primary key
  imo: string | null;                 // 7-digit IMO hull identifier (Persistent)
  mmsi: string | null;                // 9-digit MMSI AIS station
  call_sign: string | null;           // Radio call sign
  name: string;                       // Vessel Name (Non-unique)
  flag: string | null;                // Flag state (e.g. 'PA', 'MT', 'LR')
  vessel_type: string;                // Ship Type
  length_meters: number | null;       // Length in meters
  beam_meters: number | null;         // Beam in meters
  draft_meters: number | null;        // Maximum draft in meters
  gross_tonnage: number | null;       // GRT
  owner_operator: string | null;      // Registered operator
  registry_port: string | null;       // Port of registry
  source: string;                     // 'GFW_API' | 'AIS_FEED' | 'REGISTRY' | 'SIMULATED_DEMO'
  created_at: string;
  updated_at: string;
}

export interface AisPositionEntity {
  id: string;                         // UUID primary key
  vessel_id: string;                  // Foreign key to vessels(id)
  mmsi: string;                       // MMSI transmitter
  imo: string | null;                 // Associated IMO
  latitude: number;                   // Decimal latitude
  longitude: number;                  // Decimal longitude
  course: number | null;              // Degrees (0 - 360)
  speed: number | null;               // Speed in knots
  navigation_status: string | null;   // AIS status code
  destination: string | null;         // Port destination
  draught: number | null;             // Dynamic draught
  timestamp: string;                  // UTC ISO 8601
  source: string;                     // Provenance source
  created_at: string;
}

// =============================================================================
// STEP 2: Incident Association Query Parameter Interface
// =============================================================================
export interface SpillVesselAssociationQuery {
  spillLatitude: number;
  spillLongitude: number;
  incidentTimestamp: string;
  radiusNauticalMiles: number;
  timeWindowHours: number;
}

export interface CandidateVesselAssociation {
  vessel: VesselEntity;
  lastKnownPosition: AisPositionEntity;
  distanceToSpillNm: number;
  timeDeltaHours: number;
  correlationConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCONFIRMED';
  evidenceRationale: string[];
}
