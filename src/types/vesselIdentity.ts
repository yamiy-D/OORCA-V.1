/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =============================================================================
// STEP 1: Frontend Vessel Identity & Provenance Types
// =============================================================================

export type DataSourceType = 'GFW_API' | 'AIS_FEED' | 'MARITIME_REGISTRY' | 'SIMULATED_DEMO';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCONFIRMED';
export type IdentityStatus = 'CONFIRMED' | 'MULTIPLE_CANDIDATES' | 'IDENTITY_UNCONFIRMED' | 'IDENTITY_CONFLICT';

export interface ProvenanceField<T> {
  value: T;
  source: DataSourceType;
  confidence: ConfidenceLevel;
  timestamp?: string;
  notes?: string;
}

export interface AisPositionRecord {
  latitude: number;
  longitude: number;
  courseDeg: number;
  speedKnots: number;
  navStatus?: string;
  destination?: string;
  draughtMeters?: number;
  timestamp: string;
  source: DataSourceType;
  isStale: boolean;
  ageSeconds: number;
  ageHumanReadable: string;
}

export interface VesselIdentityDossier {
  id: string;
  identityStatus: IdentityStatus;
  identityConfidence: ConfidenceLevel;
  hasConflict: boolean;
  conflictDetails?: string[];
  matchCriteria?: 'EXACT_IMO' | 'EXACT_MMSI' | 'EXACT_CALLSIGN' | 'NAME_MATCH' | 'NONE';

  isLiveApi: boolean;
  dataSourceLabel: 'LIVE GFW API' | 'LIVE AIS FEED' | 'MARITIME REGISTRY' | 'SIMULATED DEMO DATA';

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

  latestAisPosition?: AisPositionRecord;
  distanceToSpillNm?: number;
}

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
