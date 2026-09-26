/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ConfidenceLevel,
  DataSourceType,
  IdentityStatus,
  ProvenanceField,
  RawVesselCandidate,
  VesselIdentityDossier,
  VesselResolutionResult,
} from '../types/vesselIdentity';

// =============================================================================
// STEP 1: Helper Functions for Normalization & Input Classification
// =============================================================================

/**
 * Normalizes a maritime vessel name for comparison:
 * - Converts to uppercase
 * - Strips common naval/commercial prefixes ("MT", "M/T", "MV", "M/V", "SS", "S/S", "RV", "R/V", "FV", "F/V")
 * - Strips punctuation and excessive whitespace
 */
export function normalizeVesselName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toUpperCase()
    .replace(/^(?:M\/?T|M\/?V|S\/?S|R\/?V|F\/?V)\s+/i, '')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies a user search input into maritime identifier types:
 * 1. IMO (7 digits)
 * 2. MMSI (9 digits)
 * 3. Call Sign (3-7 alphanumeric characters)
 * 4. Vessel Name
 */
export function classifySearchInput(query: string): {
  type: 'IMO' | 'MMSI' | 'CALL_SIGN' | 'VESSEL_NAME' | 'EMPTY';
  cleanValue: string;
} {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed) {
    return { type: 'EMPTY', cleanValue: '' };
  }

  // Check for explicit or implicit 7-digit IMO
  const imoMatch = trimmed.match(/^(?:IMO\s*)?([0-9]{7})$/i);
  if (imoMatch) {
    return { type: 'IMO', cleanValue: imoMatch[1] };
  }

  // Check for 9-digit MMSI
  if (/^[0-9]{9}$/.test(trimmed)) {
    return { type: 'MMSI', cleanValue: trimmed };
  }

  // Check for standard maritime radio call sign (e.g., 9HA4112, A8QK2, 3FYB9)
  // Typically 4-7 characters, must contain at least one digit and one letter, no spaces
  if (/^[A-Z0-9]{3,7}$/.test(trimmed) && /[0-9]/.test(trimmed) && /[A-Z]/.test(trimmed)) {
    return { type: 'CALL_SIGN', cleanValue: trimmed };
  }

  return { type: 'VESSEL_NAME', cleanValue: trimmed };
}

/**
 * Formats elapsed time into a human-readable age string and detects stale telemetry.
 * Stale threshold is 4 hours (14,400 seconds) for maritime AIS safety standards.
 */
export function evaluateAisStaleness(timestampIso?: string): {
  isStale: boolean;
  ageSeconds: number;
  ageHumanReadable: string;
} {
  if (!timestampIso) {
    return { isStale: true, ageSeconds: Infinity, ageHumanReadable: 'No AIS telemetry recorded' };
  }

  const date = new Date(timestampIso);
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (isNaN(diffMs) || diffMs < 0) {
    return { isStale: false, ageSeconds: 0, ageHumanReadable: 'Just now' };
  }

  const ageSec = Math.floor(diffMs / 1000);
  const isStale = ageSec > 4 * 3600; // > 4 hours

  let ageHumanReadable: string;
  if (ageSec < 60) {
    ageHumanReadable = 'Just now';
  } else if (ageSec < 3600) {
    const mins = Math.floor(ageSec / 60);
    ageHumanReadable = `${mins} min${mins === 1 ? '' : 's'} ago`;
  } else if (ageSec < 86400) {
    const hours = Math.floor(ageSec / 3600);
    ageHumanReadable = `${hours} hour${hours === 1 ? '' : 's'} ago${isStale ? ' (STALE AIS DATA)' : ''}`;
  } else {
    const days = Math.floor(ageSec / 86400);
    ageHumanReadable = `${days} day${days === 1 ? '' : 's'} ago (STALE AIS DATA)`;
  }

  return { isStale, ageSeconds: ageSec, ageHumanReadable };
}

// =============================================================================
// STEP 2: Transform Raw Candidate to Provenance-Enriched VesselIdentityDossier
// =============================================================================

export function buildVesselDossier(
  candidate: RawVesselCandidate,
  confidence: ConfidenceLevel,
  status: IdentityStatus,
  matchCriteria?: 'EXACT_IMO' | 'EXACT_MMSI' | 'EXACT_CALLSIGN' | 'NAME_MATCH' | 'NONE',
  conflictDetails?: string[]
): VesselIdentityDossier {
  const src = candidate.source;
  const isLive = src === 'GFW_API' || src === 'AIS_FEED';

  let dataSourceLabel: 'LIVE GFW API' | 'LIVE AIS FEED' | 'MARITIME REGISTRY' | 'SIMULATED DEMO DATA';
  if (src === 'GFW_API') dataSourceLabel = 'LIVE GFW API';
  else if (src === 'AIS_FEED') dataSourceLabel = 'LIVE AIS FEED';
  else if (src === 'MARITIME_REGISTRY') dataSourceLabel = 'MARITIME REGISTRY';
  else dataSourceLabel = 'SIMULATED DEMO DATA';

  const makeField = <T>(val: T, fieldConfidence?: ConfidenceLevel): ProvenanceField<T> => ({
    value: val,
    source: src,
    confidence: fieldConfidence ?? confidence,
    timestamp: candidate.position?.timestamp,
  });

  // Evaluate AIS position if present
  let latestAisPosition = undefined;
  if (candidate.position) {
    const staleness = evaluateAisStaleness(candidate.position.timestamp);
    latestAisPosition = {
      latitude: candidate.position.latitude,
      longitude: candidate.position.longitude,
      courseDeg: candidate.position.courseDeg,
      speedKnots: candidate.position.speedKnots,
      navStatus: candidate.position.navStatus,
      destination: candidate.position.destination,
      timestamp: candidate.position.timestamp,
      source: candidate.position.source || src,
      isStale: staleness.isStale,
      ageSeconds: staleness.ageSeconds,
      ageHumanReadable: staleness.ageHumanReadable,
    };
  }

  // Registry record status (separated from identity verification!)
  const hasStrongIdentifiers = Boolean(candidate.imo && candidate.mmsi);
  const regStatus = hasStrongIdentifiers ? 'RECORD_VERIFIED' : candidate.imo ? 'PARTIAL_DATA' : 'UNVERIFIED';

  return {
    id: candidate.id,
    identityStatus: status,
    identityConfidence: confidence,
    hasConflict: Boolean(conflictDetails && conflictDetails.length > 0),
    conflictDetails,
    matchCriteria,
    isLiveApi: isLive,
    dataSourceLabel,

    name: makeField(candidate.name),
    imo: makeField(candidate.imo ?? null, candidate.imo ? 'HIGH' : 'LOW'),
    mmsi: makeField(candidate.mmsi ?? null, candidate.mmsi ? 'HIGH' : 'LOW'),
    callSign: makeField(candidate.callSign ?? null, candidate.callSign ? 'HIGH' : 'LOW'),
    flag: makeField(candidate.flag || 'UNKNOWN'),
    shipType: makeField(candidate.shipType || 'Unspecified Vessel'),
    gearType: candidate.gearType ? makeField(candidate.gearType) : undefined,
    lengthMeters: makeField(candidate.lengthMeters ?? null),
    beamMeters: makeField(candidate.beamMeters ?? null),
    draftMeters: makeField(candidate.draftMeters ?? null),
    grossTonnage: makeField(candidate.grossTonnage ?? null),
    ownerOperator: makeField(candidate.ownerOperator ?? null),
    registryPort: makeField(candidate.registryPort ?? null),
    registryStatus: makeField(regStatus, hasStrongIdentifiers ? 'HIGH' : 'LOW'),

    latestAisPosition,
  };
}

// =============================================================================
// STEP 3: Core Identity Resolution Engine
// =============================================================================

/**
 * Resolves a search query against a pool of raw candidates according to maritime
 * identity standards:
 * - Never merges vessels based solely on name.
 * - Enforces IMO (persistent hull) > MMSI (radio station) > Call Sign > Name.
 * - Detects multiple candidates and prevents silent arbitrary selection.
 * - Identifies cross-provider attribute conflicts.
 */
export function resolveVesselIdentity(
  searchInput: string,
  candidates: RawVesselCandidate[],
  isLiveApi: boolean = false
): VesselResolutionResult {
  const { type: queryType, cleanValue } = classifySearchInput(searchInput);
  const resolvedAt = new Date().toISOString();

  const dataSourceLabel = isLiveApi ? 'LIVE GFW API' : 'SIMULATED DEMO DATA';

  // Base envelope
  const result: VesselResolutionResult = {
    success: true,
    query: searchInput,
    queryType,
    totalCandidatesFound: 0,
    selectedCandidate: null,
    candidates: [],
    identityStatus: 'IDENTITY_UNCONFIRMED',
    identityConfidence: 'UNCONFIRMED',
    hasConflict: false,
    conflictDetails: [],
    warnings: [],
    isLiveApi,
    dataSourceLabel,
    resolvedAt,
  };

  if (queryType === 'EMPTY') {
    result.message = 'Please provide an IMO number, MMSI, call sign, or vessel name to search.';
    return result;
  }

  // ---------------------------------------------------------------------------
  // CASE A: Search by IMO (7 digits) — Strongest persistent identifier
  // ---------------------------------------------------------------------------
  if (queryType === 'IMO') {
    const matched = candidates.filter((c) => c.imo && c.imo.trim() === cleanValue);

    if (matched.length === 0) {
      result.identityStatus = 'IDENTITY_UNCONFIRMED';
      result.identityConfidence = 'UNCONFIRMED';
      result.warnings.push(`No vessel found with IMO ${cleanValue} in verified registry or GFW feeds.`);
      result.message = `Unable to resolve vessel identity for IMO ${cleanValue}.`;
      return result;
    }

    if (matched.length === 1) {
      const dossier = buildVesselDossier(matched[0], 'HIGH', 'CONFIRMED', 'EXACT_IMO');
      result.totalCandidatesFound = 1;
      result.selectedCandidate = dossier;
      result.candidates = [dossier];
      result.identityStatus = 'CONFIRMED';
      result.identityConfidence = 'HIGH';
      return result;
    }

    // If multiple records share the same IMO (e.g., historical MMSI/flag changes)
    const mmsis = Array.from(new Set(matched.map((c) => c.mmsi).filter(Boolean)));
    const conflictDetails: string[] = [];
    if (mmsis.length > 1) {
      conflictDetails.push(`Multiple MMSI transmitters recorded for IMO ${cleanValue}: ${mmsis.join(', ')} (possible flag transfer or AIS reassignment).`);
    }

    const dossiers = matched.map((c) =>
      buildVesselDossier(c, 'HIGH', 'CONFIRMED', 'EXACT_IMO', conflictDetails)
    );
    result.totalCandidatesFound = matched.length;
    result.candidates = dossiers;
    result.selectedCandidate = dossiers[0];
    result.identityStatus = 'CONFIRMED';
    result.identityConfidence = 'HIGH';
    result.hasConflict = conflictDetails.length > 0;
    result.conflictDetails = conflictDetails;
    return result;
  }

  // ---------------------------------------------------------------------------
  // CASE B: Search by MMSI (9 digits) — AIS station identifier
  // ---------------------------------------------------------------------------
  if (queryType === 'MMSI') {
    const matched = candidates.filter((c) => c.mmsi && c.mmsi.trim() === cleanValue);

    if (matched.length === 0) {
      result.identityStatus = 'IDENTITY_UNCONFIRMED';
      result.identityConfidence = 'UNCONFIRMED';
      result.warnings.push(`No active AIS station found with MMSI ${cleanValue}.`);
      result.message = `Unable to resolve vessel identity for MMSI ${cleanValue}.`;
      return result;
    }

    if (matched.length === 1) {
      const dossier = buildVesselDossier(matched[0], 'HIGH', 'CONFIRMED', 'EXACT_MMSI');
      result.totalCandidatesFound = 1;
      result.selectedCandidate = dossier;
      result.candidates = [dossier];
      result.identityStatus = 'CONFIRMED';
      result.identityConfidence = 'HIGH';
      return result;
    }

    // Multiple records with same MMSI but differing IMOs is a critical conflict!
    const imos = Array.from(new Set(matched.map((c) => c.imo).filter(Boolean)));
    const hasConflict = imos.length > 1;
    const conflictDetails: string[] = [];
    if (hasConflict) {
      conflictDetails.push(`IDENTITY CONFLICT: MMSI ${cleanValue} is claimed by multiple distinct hulls with different IMOs: ${imos.join(' vs ')}.`);
    }

    const dossiers = matched.map((c) =>
      buildVesselDossier(c, hasConflict ? 'LOW' : 'HIGH', hasConflict ? 'IDENTITY_CONFLICT' : 'CONFIRMED', 'EXACT_MMSI', conflictDetails)
    );
    result.totalCandidatesFound = matched.length;
    result.candidates = dossiers;
    result.selectedCandidate = dossiers[0];
    result.identityStatus = hasConflict ? 'IDENTITY_CONFLICT' : 'CONFIRMED';
    result.identityConfidence = hasConflict ? 'LOW' : 'HIGH';
    result.hasConflict = hasConflict;
    result.conflictDetails = conflictDetails;
    return result;
  }

  // ---------------------------------------------------------------------------
  // CASE C: Search by Radio Call Sign
  // ---------------------------------------------------------------------------
  if (queryType === 'CALL_SIGN') {
    const matched = candidates.filter((c) => c.callSign && c.callSign.trim().toUpperCase() === cleanValue);

    if (matched.length === 1) {
      const dossier = buildVesselDossier(matched[0], 'HIGH', 'CONFIRMED', 'EXACT_CALLSIGN');
      result.totalCandidatesFound = 1;
      result.selectedCandidate = dossier;
      result.candidates = [dossier];
      result.identityStatus = 'CONFIRMED';
      result.identityConfidence = 'HIGH';
      return result;
    }

    if (matched.length > 1) {
      const dossiers = matched.map((c) => buildVesselDossier(c, 'MEDIUM', 'MULTIPLE_CANDIDATES', 'EXACT_CALLSIGN'));
      result.totalCandidatesFound = matched.length;
      result.candidates = dossiers;
      result.selectedCandidate = null;
      result.identityStatus = 'MULTIPLE_CANDIDATES';
      result.identityConfidence = 'MEDIUM';
      result.warnings.push(`Multiple vessels registered with call sign ${cleanValue}.`);
      return result;
    }
    // If not found by call sign, continue to test if it could be a short vessel name
  }

  // ---------------------------------------------------------------------------
  // STEP 3.35: CASE C.5: Cross-Identifier Conflict Detection (e.g. IMO + MMSI in query)
  // ---------------------------------------------------------------------------
  const embeddedImo = searchInput.match(/\b([0-9]{7})\b/);
  const embeddedMmsi = searchInput.match(/\b([0-9]{9})\b/);

  if (embeddedImo && embeddedMmsi) {
    const imoVal = embeddedImo[1];
    const mmsiVal = embeddedMmsi[1];

    const imoMatches = candidates.filter((c) => c.imo && c.imo.trim() === imoVal);
    const mmsiMatches = candidates.filter((c) => c.mmsi && c.mmsi.trim() === mmsiVal);

    if (imoMatches.length > 0 && mmsiMatches.length > 0) {
      const imoHull = imoMatches[0];
      const mmsiHull = mmsiMatches[0];

      // Check if they point to different hulls (different IMO or different MMSI)
      if (imoHull.imo !== mmsiHull.imo || imoHull.mmsi !== mmsiHull.mmsi) {
        const conflictDetails = [
          `IDENTITY CONFLICT: Conflicting cross-provider identifiers detected in request.`,
          `GFW / Maritime Registry: IMO ${imoVal} is assigned to ${imoHull.name} (MMSI: ${imoHull.mmsi || 'N/A'}, Flag: ${imoHull.flag}, Type: ${imoHull.shipType}).`,
          `AIS Feed: MMSI ${mmsiVal} is transmitted by ${mmsiHull.name} (IMO: ${mmsiHull.imo || 'N/A'}, Flag: ${mmsiHull.flag}, Type: ${mmsiHull.shipType}).`,
          `Status: ⚠️ MULTIPLE IDENTITIES DETECTED. These records cannot safely be treated as the same vessel.`,
        ];

        const dossiers = [
          buildVesselDossier(imoHull, 'LOW', 'IDENTITY_CONFLICT', 'EXACT_IMO', conflictDetails),
          buildVesselDossier(mmsiHull, 'LOW', 'IDENTITY_CONFLICT', 'EXACT_MMSI', conflictDetails),
        ];

        result.totalCandidatesFound = 2;
        result.candidates = dossiers;
        result.selectedCandidate = null;
        result.identityStatus = 'IDENTITY_CONFLICT';
        result.identityConfidence = 'LOW';
        result.hasConflict = true;
        result.conflictDetails = conflictDetails;
        result.warnings = conflictDetails;
        return result;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 3.4: CASE D: Search by Vessel Name (Non-unique identifier)
  // ---------------------------------------------------------------------------
  const normQuery = normalizeVesselName(cleanValue);

  // Exact or partial name match
  const matched = candidates.filter((c) => {
    const normCand = normalizeVesselName(c.name);
    return (
      normCand === normQuery ||
      normCand.includes(normQuery) ||
      normQuery.includes(normCand)
    );
  });

  if (matched.length === 0) {
    result.identityStatus = 'IDENTITY_UNCONFIRMED';
    result.identityConfidence = 'UNCONFIRMED';
    result.warnings.push(`No verified vessel found matching name "${searchInput}".`);
    result.message = `Unable to resolve vessel identity for "${searchInput}".`;
    return result;
  }

  // If only 1 candidate matches the name
  if (matched.length === 1) {
    const cand = matched[0];
    const hasPersistentId = Boolean(cand.imo || cand.mmsi);
    const confidence: ConfidenceLevel = hasPersistentId ? 'MEDIUM' : 'LOW';
    const status: IdentityStatus = hasPersistentId ? 'CONFIRMED' : 'IDENTITY_UNCONFIRMED';

    const warnings: string[] = [];
    if (!cand.imo) {
      warnings.push(`Vessel "${cand.name}" lacks a verified IMO number. Identity cannot be definitively established.`);
    }

    const dossier = buildVesselDossier(cand, confidence, status, 'NAME_MATCH');
    result.totalCandidatesFound = 1;
    result.selectedCandidate = dossier;
    result.candidates = [dossier];
    result.identityStatus = status;
    result.identityConfidence = confidence;
    result.warnings = warnings;
    return result;
  }

  // If multiple candidates match the name: DO NOT automatically pick the first!
  // Check if they are actually different vessels (different IMOs or MMSIs)
  const distinctHulls = new Map<string, RawVesselCandidate>();
  matched.forEach((c) => {
    const key = c.imo || c.mmsi || c.id;
    distinctHulls.set(key, c);
  });

  const distinctList = Array.from(distinctHulls.values());

  if (distinctList.length > 1) {
    // Multiple genuinely different vessels share this name!
    const dossiers = distinctList.map((c) =>
      buildVesselDossier(c, 'LOW', 'MULTIPLE_CANDIDATES', 'NAME_MATCH')
    );

    result.totalCandidatesFound = distinctList.length;
    result.candidates = dossiers;
    // CRITICAL REQUIREMENT: Do NOT silently select the first candidate when multiple match a name search!
    result.selectedCandidate = null;
    result.identityStatus = 'MULTIPLE_CANDIDATES';
    result.identityConfidence = 'UNCONFIRMED';
    result.warnings.push(
      `Found ${distinctList.length} distinct vessels matching "${searchInput}". Vessel name is not unique. Please select a candidate by IMO or MMSI.`
    );
    return result;
  }

  // If multiple raw records resolved to the same unique hull
  const cand = distinctList[0];
  const dossier = buildVesselDossier(cand, 'MEDIUM', 'CONFIRMED', 'NAME_MATCH');
  result.totalCandidatesFound = 1;
  result.selectedCandidate = dossier;
  result.candidates = [dossier];
  result.identityStatus = 'CONFIRMED';
  result.identityConfidence = 'MEDIUM';
  return result;
}
