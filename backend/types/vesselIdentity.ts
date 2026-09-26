/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =============================================================================
// STEP 1: Provenance and Confidence Schema
// =============================================================================

export type DataSourceType = 'GFW_API' | 'AIS_FEED' | 'MARITIME_REGISTRY' | 'SIMULATED_DEMO';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCONFIRMED';
export type IdentityStatus = 'CONFIRMED' | 'MULTIPLE_CANDIDATES' | 'IDENTITY_UNCONFIRMED' | 'IDENTITY_CONFLICT';

export interface ProvenanceField<T> {
  value: T;
  source: DataSourceType;
  confidence: ConfidenceLevel;
  timestamp?: string; // ISO 8601
  notes?: string;
}

// =============================================================================
// STEP 2: Separate AIS Position Telemetry Schema (Dynamic)
// =============================================================================

export interface AisPositionRecord {
  latitude: number;
  longitude: number;
  courseDeg: number;
  speedKnots: number;
  navStatus?: string;
  destination?: string;
  draughtMeters?: number;
  timestamp: string; // ISO 8601
  source: DataSourceType;
  isStale: boolean;
  ageSeconds: number;
  ageHumanReadable: string; // e.g. "4 min ago" or "3 days ago (STALE AIS DATA)"
}

// =============================================================================
// STEP 3: Complete Vessel Identity Dossier with Provenance (Static + Semistatic)
// =============================================================================

export interface VesselIdentityDossier {
  // Identity Resolution State
  id: string;
  identityStatus: IdentityStatus;
  identityConfidence: ConfidenceLevel;
  hasConflict: boolean;
  conflictDetails?: string[];
  matchCriteria?: 'EXACT_IMO' | 'EXACT_MMSI' | 'EXACT_CALLSIGN' | 'NAME_MATCH' | 'NONE';

  // Attribution & Transparency (No fake live claims)
  isLiveApi: boolean;
  dataSourceLabel: 'LIVE GFW API' | 'LIVE AIS FEED' | 'MARITIME REGISTRY' | 'SIMULATED DEMO DATA';

  // Individual Attributes with Provenance Tracking
  name: ProvenanceField<string>;
  imo: ProvenanceField<string | null>;
  mmsi: ProvenanceField<string | null>;
  callSign: ProvenanceField<string | null>;
  flag: ProvenanceField<string>;
  shipType: ProvenanceField<string>;
  gearType?: ProvenanceField<string | null>;
  lengthMeters: ProvenanceField<number | null>;
  beamMeters: ProvenanceField<number | null>;
  draftMeters: ProvenanceField<number | null>;
  grossTonnage: ProvenanceField<number | null>;
  ownerOperator: ProvenanceField<string | null>;
  registryPort: ProvenanceField<string | null>;
  registryStatus: ProvenanceField<'RECORD_VERIFIED' | 'UNVERIFIED' | 'PARTIAL_DATA'>;

  // Separate AIS Position (Never merged into identity key)
  latestAisPosition?: AisPositionRecord;

  // Spatial Distance to Incident (if applicable)
  distanceToSpillNm?: number;
}

// =============================================================================
// STEP 4: Raw Vessel Candidate for Resolution Pipeline
// =============================================================================

export interface RawVesselCandidate {
  id: string;
  name: string;
  imo?: string | null;
  mmsi?: string | null;
  callSign?: string | null;
  flag?: string;
  shipType?: string;
  gearType?: string | null;
  lengthMeters?: number | null;
  beamMeters?: number | null;
  draftMeters?: number | null;
  grossTonnage?: number | null;
  ownerOperator?: string | null;
  registryPort?: string | null;
  source: DataSourceType;
  position?: {
    latitude: number;
    longitude: number;
    courseDeg: number;
    speedKnots: number;
    navStatus?: string;
    destination?: string;
    timestamp: string;
    source?: DataSourceType;
  };
}

// =============================================================================
// STEP 5: Final Resolution Result Envelope
// =============================================================================

export interface VesselResolutionResult {
  success: boolean;
  query: string;
  queryType: 'IMO' | 'MMSI' | 'CALL_SIGN' | 'VESSEL_NAME' | 'EMPTY';
  totalCandidatesFound: number;
  selectedCandidate: VesselIdentityDossier | null;
  candidates: VesselIdentityDossier[];
  identityStatus: IdentityStatus;
  identityConfidence: ConfidenceLevel;
  hasConflict: boolean;
  conflictDetails: string[];
  warnings: string[];
  isLiveApi: boolean;
  dataSourceLabel: 'LIVE GFW API' | 'LIVE AIS FEED' | 'MARITIME REGISTRY' | 'SIMULATED DEMO DATA';
  resolvedAt: string;
  message?: string;
}
