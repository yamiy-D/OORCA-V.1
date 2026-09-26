/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SuspectScoreFactors, PotentialViolationEvidence } from '../../types/alertTypes';

/**
 * Suspect Scoring & Evidence Evaluation Engine
 * 
 * Scores candidate vessels (0 - 100) based on weighted maritime forensic indicators:
 * 1. Geospatial Proximity to estimated spill origin (Weight: 25%)
 * 2. Temporal Relevance within estimated release window (Weight: 20%)
 * 3. Trajectory & Wake Heading Compatibility (Weight: 20%)
 * 4. AIS Behaviour (Transmission interruptions / gaps) (Weight: 20%)
 * 5. Vessel Behaviour (Speed dips, anomalous maneuvering) (Weight: 15%)
 */

export function calculateCompositeSuspectScore(factors: SuspectScoreFactors): number {
  const weighted = 
    factors.proximityScore * 0.25 +
    factors.timeRelevanceScore * 0.20 +
    factors.trajectoryCompatibilityScore * 0.20 +
    factors.aisBehaviourScore * 0.20 +
    factors.vesselBehaviourScore * 0.15;

  return Math.min(100, Math.max(0, Math.round(weighted)));
}

export function evaluateViolations(
  vesselName: string,
  factors: SuspectScoreFactors
): PotentialViolationEvidence[] {
  const findings: PotentialViolationEvidence[] = [];

  if (factors.aisBehaviourScore >= 75) {
    findings.push({
      id: `EV-${Date.now()}-1`,
      category: 'Evidence Indicator',
      findingCode: 'SOLAS-V-19-GAP',
      title: 'AIS Transmission Anomaly',
      severity: 'CRITICAL',
      description: `Vessel transponder silent for ${factors.aisGapDurationMinutes} minutes during the estimated discharge window. Possible deliberate deactivation under SOLAS V/19 regulations.`,
      regulatoryReference: 'IMO Resolution A.1106(29) / MARPOL Annex I Regulation 15',
    });
  }

  if (factors.proximityScore >= 80) {
    findings.push({
      id: `EV-${Date.now()}-2`,
      category: 'Potential Violation',
      findingCode: 'PROXIMITY-INTERSECT',
      title: 'Direct Proximity to Estimated Origin',
      severity: 'HIGH',
      description: `AIS track reconstructed within ${factors.proximityDistanceNm} nautical miles of the Lagrangian hydrodynamic back-calculated release centroid.`,
      regulatoryReference: 'MARPOL 73/78 Annex I, Discharge Criteria at Sea',
    });
  }

  if (factors.trajectoryCompatibilityScore >= 75) {
    findings.push({
      id: `EV-${Date.now()}-3`,
      category: 'Requires Investigation',
      findingCode: 'WAKE-ALIGNMENT',
      title: 'Slick Axis Alignment with Stern Track',
      severity: 'HIGH',
      description: `Satellite SAR curvilinear plume axis matches vessel course heading within ${factors.wakeAlignmentAngleDeg}°, indicative of continuous underway oily mixture discharge.`,
      regulatoryReference: 'MEPC.1/Circ.833 Marine Forensic Evidence Guidelines',
    });
  }

  if (factors.vesselBehaviourScore >= 70) {
    findings.push({
      id: `EV-${Date.now()}-4`,
      category: 'Suspected Environmental Offence',
      findingCode: 'SPEED-DROP-ANOMALY',
      title: 'Speed Reduction Anomaly',
      severity: 'MEDIUM',
      description: `Vessel decelerated by ${factors.speedDeltaKts} knots upon entering the international transit corridor, consistent with operational slop-tank flushing or oily water separator cycling.`,
      regulatoryReference: 'Port State Control (PSC) Target Factor Category A',
    });
  }

  return findings;
}
