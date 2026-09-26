export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  type: string;
  flag: string;
  flagCode: string;
  speedKnots: number;
  heading: number;
  lat: number;
  lng: number;
  historyTrail: [number, number][];
  suspiciousScore: number; // 0-100
  status: 'Underway' | 'Loitering' | 'Moored' | 'AIS Anomaly';
  lastAisUpdate: string;
  distanceFromSpillKm?: number;
}

export interface Incident {
  id: string;
  title: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  detectedTimestamp: string;
  satelliteSource: string;
  sarConfidence: number; // e.g. 96.4
  estimatedVolumeBbl: number;
  slickAreaSqKm: number;
  suspectedVesselId?: string;
  attributionProbability: number;
  environmentalRiskScore: number;
  driftDirection: string;
  driftSpeedKnots: number;
  status: 'Active Investigation' | 'Forensics Complete' | 'Monitoring';
  financialLiabilityEst: string;
  nearestEcosystem: string;
}

export interface AlertItem {
  id: string;
  priority: 'HIGH PRIORITY' | 'VESSEL INVESTIGATION' | 'ENVIRONMENTAL RISK' | 'CRITICAL FORENSIC';
  badgeColor: 'red' | 'amber' | 'cyan' | 'emerald' | 'purple';
  title: string;
  location: string;
  timestamp: string;
  metric: string;
  detail: string;
  sensor: string;
  actionRequired: string;
}

export interface IntelligenceCapability {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  metrics: { label: string; value: string }[];
  dataFlow: string[];
}

export interface TechnologyNode {
  id: string;
  category: string;
  name: string;
  icon: string;
  description: string;
  specs: string[];
  connectedNodeIds: string[];
}

export interface PipelineStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  keyTech: string;
  outputArtifact: string;
  icon: string;
}
