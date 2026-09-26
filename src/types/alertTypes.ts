/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 
  | 'NEW DETECTION' 
  | 'UNDER INVESTIGATION' 
  | 'HIGH PRIORITY' 
  | 'TRACKING' 
  | 'RESOLVED';

export interface Coordinates {
  latitude: number;
  longitude: number;
  formattedLat: string;
  formattedLon: string;
  seaRegion: string;
  eezZone?: string;
}

export interface SpillCharacteristics {
  estimatedAreaKm2: number;
  lengthKm: number;
  widthKm: number;
  shapeDescription: string;
  estimatedAgeHours: string;
  confidencePercentage: number;
  isModelEstimated: boolean;
  slickThicknessMicrons?: string;
  estimatedVolumeM3?: number;
}

export interface TrajectoryPoint {
  label: 'Estimated Origin' | 'Current Spill' | '+6 Hours' | '+12 Hours' | '+24 Hours';
  coordinates: Coordinates;
  timestampUtc: string;
  currentSpeedKts: number;
  currentDirectionDeg: number;
  windSpeedKts: number;
  windDirectionDeg: number;
  dispersionRadiusKm: number;
}

export interface SuspectScoreFactors {
  proximityScore: number;
  proximityDetails: string;
  proximityDistanceNm: number;

  timeRelevanceScore: number;
  timeRelevanceDetails: string;
  timeWindowOverlapHours: number;

  trajectoryCompatibilityScore: number;
  trajectoryCompatibilityDetails: string;
  wakeAlignmentAngleDeg: number;

  aisBehaviourScore: number;
  aisBehaviourDetails: string;
  aisGapDurationMinutes: number;

  vesselBehaviourScore: number;
  vesselBehaviourDetails: string;
  speedDeltaKts: number;
}

export type EvidenceCategory = 
  | 'Potential Violation' 
  | 'Suspected Environmental Offence' 
  | 'Requires Investigation' 
  | 'Evidence Indicator';

export interface PotentialViolationEvidence {
  id: string;
  category: EvidenceCategory;
  title: string;
  findingCode: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  regulatoryReference?: string;
  timestampUtc?: string;
}

export interface VesselAisWayPoint {
  timeUtc: string;
  lat: number;
  lon: number;
  speedKts: number;
  courseDeg: number;
  navStatus: string;
  isInsideOriginWindow: boolean;
  isGapPoint?: boolean;
}

export interface SuspectVessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  flagCountry: string;
  destination: string;
  draughtM: number;
  deadweightTonnage: number;
  overallSuspectScore: number;
  isPrimary: boolean;
  hasVesselData?: boolean;
  vesselNotes?: string;
  currentPosition: Coordinates;
  historicOriginPosition: Coordinates;
  historicRoute: VesselAisWayPoint[];
  scoringFactors: SuspectScoreFactors;
  violations: PotentialViolationEvidence[];
}

export interface SatelliteMetadata {
  satelliteName: string;
  mission: string;
  sensorType: string;
  sensorMode: string;
  acquisitionTimeUtc: string;
  polarization: string;
  resolutionMeters: number;
  aiConfidencePercentage: number;
  passOrbitId: string;
  imageUrl: string;
  comparisonBaselineUrl?: string;
  sceneBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MetoceanData {
  surfaceCurrentKts: number;
  currentHeadingDeg: number;
  windSpeedKts: number;
  windDirectionDeg: number;
  waterTemperatureC: number;
  waveHeightMeters: number;
  seaStateBeaufort: number;
  dataSource: string;
}

export interface TimelineEvent {
  id: string;
  timeUtc: string;
  stageCode: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PROJECTED';
  badge: string;
}

export interface OilSpillIncident {
  id: string;
  codeName: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  detectionTimestampUtc: string;
  confidencePercentage: number;
  estimatedSpillAreaKm2: number;
  location: Coordinates;
  characteristics: SpillCharacteristics;
  satellite: SatelliteMetadata;
  metocean: MetoceanData;
  trajectory: {
    origin: TrajectoryPoint;
    current: TrajectoryPoint;
    predictions: TrajectoryPoint[];
  };
  primarySuspect: SuspectVessel;
  secondarySuspects: SuspectVessel[];
  timeline: TimelineEvent[];
  sourceAgency?: string;
  officialUrl?: string;
  externalIncidentId?: string;
  threatCommodity?: string;
  hasVesselData?: boolean;
  retrievalTimestampUtc?: string;
  originalIncidentId?: string;
}

export type ScanOutcome = 'SPILL_OCCURRED' | 'NO_SPILL_OBSERVED';

export interface HistoricalSpillSummary {
  incidentId: string;
  name: string;
  location: string;
  coordinates: string;
  observedDate: string;
  source: string;
  sourceId: string;
  sourceUrl?: string;
  vessel: string;
  vesselMmsi?: string;
  hasVesselData: boolean;
  mlConfidence?: number;
  spillArea?: string;
  spillStatus?: string;
  threatCommodity?: string;
  retrievalTimestampUtc: string;
}

export interface NoSpillObservationDetails {
  statusText: string;
  scannedRegion: string;
  lastChecked: string;
  criteriaNote: string;
}

export interface ScanResult {
  timestamp: string;
  type: 'MANUAL' | 'AUTO_10MIN';
  outcome: ScanOutcome;
  outcomeProbability: number; // 70 or 30
  statusMessage: string;
  message: string;
  sectorsChecked: number;
  vesselsAnalyzed: number;
  newSpillsFound: number;
  detectedIncidentId?: string;
  source?: string;
  regionScanned?: string;
  historicalIncident?: HistoricalSpillSummary;
  noSpillDetails?: NoSpillObservationDetails;
}
