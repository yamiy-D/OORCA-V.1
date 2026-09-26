/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  classifySearchInput,
  normalizeVesselName,
  evaluateAisStaleness,
  resolveVesselIdentity,
} from '../services/vesselIdentityResolver';
import { DEMO_VESSEL_REGISTRY } from '../data/vesselDemoRegistry';
import { RawVesselCandidate } from '../types/vesselIdentity';

// =============================================================================
// STEP 1: Test Runner Utility
// =============================================================================

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    failedTests++;
  }
}

console.log('\n============================================================');
console.log('RUNNING OORCA VESSEL IDENTITY RESOLUTION TEST SUITE');
console.log('============================================================\n');

// =============================================================================
// TEST 1: Exact IMO Match
// =============================================================================
console.log('--- TEST 1: Exact IMO Match ---');
{
  const result = resolveVesselIdentity('9593505', DEMO_VESSEL_REGISTRY);
  assert(result.queryType === 'IMO', 'Correctly classifies 7-digit numeric query as IMO');
  assert(result.identityStatus === 'CONFIRMED', 'Identity status is CONFIRMED');
  assert(result.identityConfidence === 'HIGH', 'Confidence is HIGH for exact IMO match');
  assert(result.selectedCandidate?.imo.value === '9593505', 'Selected candidate has exact matching IMO');
  assert(result.selectedCandidate?.name.value === 'PIONEERING SPIRIT', 'Candidate name is PIONEERING SPIRIT');
}

// =============================================================================
// TEST 2: Exact MMSI Match
// =============================================================================
console.log('\n--- TEST 2: Exact MMSI Match ---');
{
  const result = resolveVesselIdentity('249110000', DEMO_VESSEL_REGISTRY);
  assert(result.queryType === 'MMSI', 'Correctly classifies 9-digit numeric query as MMSI');
  assert(result.identityStatus === 'CONFIRMED', 'Identity status is CONFIRMED');
  assert(result.identityConfidence === 'HIGH', 'Confidence is HIGH for exact MMSI match');
  assert(result.selectedCandidate?.mmsi.value === '249110000', 'Selected candidate has exact matching MMSI');
}

// =============================================================================
// TEST 3: Call-Sign Match
// =============================================================================
console.log('\n--- TEST 3: Call-Sign Match ---');
{
  const result = resolveVesselIdentity('9HA4112', DEMO_VESSEL_REGISTRY);
  assert(result.queryType === 'CALL_SIGN', 'Correctly classifies alphanumeric call sign');
  assert(result.identityStatus === 'CONFIRMED', 'Identity status is CONFIRMED');
  assert(result.selectedCandidate?.callSign.value === '9HA4112', 'Selected candidate has matching call sign');
}

// =============================================================================
// TEST 4: Multiple Vessels with Same Name (No Silent Merge)
// =============================================================================
console.log('\n--- TEST 4: Multiple Vessels with Same Name ---');
{
  // Create two distinct hulls sharing the common name "PACIFIC STAR"
  const ambiguousPool: RawVesselCandidate[] = [
    {
      id: 'vsl-1',
      name: 'PACIFIC STAR',
      imo: '9123456',
      mmsi: '538001111',
      source: 'SIMULATED_DEMO',
      flag: 'MH',
    },
    {
      id: 'vsl-2',
      name: 'PACIFIC STAR',
      imo: '9654321',
      mmsi: '636002222',
      source: 'SIMULATED_DEMO',
      flag: 'LR',
    },
  ];

  const result = resolveVesselIdentity('PACIFIC STAR', ambiguousPool);
  assert(result.totalCandidatesFound === 2, 'Found both candidate vessels sharing the name');
  assert(result.identityStatus === 'MULTIPLE_CANDIDATES', 'Status is MULTIPLE_CANDIDATES');
  assert(result.identityConfidence === 'UNCONFIRMED', 'Confidence is UNCONFIRMED');
  assert(result.selectedCandidate === null, 'Does NOT silently select candidate 1 when multiple distinct vessels match');
  assert(result.warnings.length > 0, 'Emits warning indicating name is non-unique');
}

// =============================================================================
// TEST 5: Conflicting IMO / MMSI Detection
// =============================================================================
console.log('\n--- TEST 5: Conflicting IMO / MMSI Detection ---');
{
  // Two records with same MMSI but conflicting IMOs
  const conflictingPool: RawVesselCandidate[] = [
    {
      id: 'vsl-a',
      name: 'SUSPECT VESSEL A',
      imo: '9111111',
      mmsi: '354891000',
      source: 'GFW_API',
    },
    {
      id: 'vsl-b',
      name: 'SUSPECT VESSEL B',
      imo: '9222222',
      mmsi: '354891000',
      source: 'AIS_FEED',
    },
  ];

  const result = resolveVesselIdentity('354891000', conflictingPool);
  assert(result.hasConflict === true, 'Flags hasConflict = true');
  assert(result.identityStatus === 'IDENTITY_CONFLICT', 'Identity status is IDENTITY_CONFLICT');
  assert(result.conflictDetails.length > 0, 'Provides explicit conflict details');
  assert(result.conflictDetails[0].includes('IDENTITY CONFLICT'), 'Conflict message contains explanation');
}

// =============================================================================
// TEST 6: Missing IMO Handling
// =============================================================================
console.log('\n--- TEST 6: Missing IMO Handling ---');
{
  const missingImoPool: RawVesselCandidate[] = [
    {
      id: 'vsl-no-imo',
      name: 'LOCAL FISHING BOAT',
      imo: null,
      mmsi: '419999000',
      source: 'SIMULATED_DEMO',
    },
  ];

  const result = resolveVesselIdentity('LOCAL FISHING BOAT', missingImoPool);
  assert(result.totalCandidatesFound === 1, 'Candidate found');
  assert(result.warnings.some((w) => w.includes('lacks a verified IMO number')), 'Warns that IMO is missing');
}

// =============================================================================
// TEST 7: Missing MMSI Handling
// =============================================================================
console.log('\n--- TEST 7: Missing MMSI Handling ---');
{
  const missingMmsiPool: RawVesselCandidate[] = [
    {
      id: 'vsl-no-mmsi',
      name: 'COLD LAYUP TANKER',
      imo: '9333333',
      mmsi: null,
      source: 'SIMULATED_DEMO',
    },
  ];

  const result = resolveVesselIdentity('9333333', missingMmsiPool);
  assert(result.identityStatus === 'CONFIRMED', 'Resolves by IMO even if MMSI is absent');
  assert(result.selectedCandidate?.mmsi.value === null, 'MMSI is cleanly null without crashing');
}

// =============================================================================
// TEST 8: Stale AIS Position Detection
// =============================================================================
console.log('\n--- TEST 8: Stale AIS Position Detection ---');
{
  // 10 minutes ago -> Not stale
  const freshIso = new Date(Date.now() - 1000 * 60 * 10).toISOString();
  const freshEval = evaluateAisStaleness(freshIso);
  assert(!freshEval.isStale, '10 minutes ago is NOT stale');
  assert(freshEval.ageHumanReadable === '10 mins ago', 'Formats human readable elapsed time');

  // 12 hours ago -> Stale (> 4 hours)
  const staleIso = new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString();
  const staleEval = evaluateAisStaleness(staleIso);
  assert(staleEval.isStale, '12 hours ago IS stale');
  assert(staleEval.ageHumanReadable.includes('STALE AIS DATA'), 'Includes STALE AIS DATA flag in human readable string');

  // 3 days ago -> Stale
  const oldIso = new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString();
  const oldEval = evaluateAisStaleness(oldIso);
  assert(oldEval.isStale, '3 days ago IS stale');
  assert(oldEval.ageHumanReadable === '3 days ago (STALE AIS DATA)', 'Formats days ago stale badge');
}

// =============================================================================
// TEST 9: API Failure / Unknown Query (Never Fabricate Fake Data)
// =============================================================================
console.log('\n--- TEST 9: API Failure & Unknown Query (Zero Fake Numbers) ---');
{
  const result = resolveVesselIdentity('COMPLETELY_NONEXISTENT_VESSEL_XYZ', DEMO_VESSEL_REGISTRY);
  assert(result.totalCandidatesFound === 0, 'Finds 0 candidates');
  assert(result.identityStatus === 'IDENTITY_UNCONFIRMED', 'Status is IDENTITY_UNCONFIRMED');
  assert(result.selectedCandidate === null, 'No candidate selected (never fabricates fake numbers!)');
  assert(result.warnings.length > 0, 'Provides clear warning');
}

// =============================================================================
// TEST 10: Mock/Demo Data Explicitly Tagged
// =============================================================================
console.log('\n--- TEST 10: Mock/Demo Data Explicitly Tagged ---');
{
  const result = resolveVesselIdentity('MT PACIFIC EXPLORER', DEMO_VESSEL_REGISTRY, false);
  assert(result.isLiveApi === false, 'isLiveApi is explicitly false');
  assert(result.dataSourceLabel === 'SIMULATED DEMO DATA', 'dataSourceLabel is SIMULATED DEMO DATA');
  assert(result.selectedCandidate?.dataSourceLabel === 'SIMULATED DEMO DATA', 'Dossier dataSourceLabel is SIMULATED DEMO DATA');
  assert(result.selectedCandidate?.name.source === 'SIMULATED_DEMO', 'Field source is SIMULATED_DEMO');
}

// =============================================================================
// TEST 11: PIONEERING SPIRIT Test Case (The Reported Problem)
// =============================================================================
console.log('\n--- TEST 11: PIONEERING SPIRIT Test Case ---');
{
  const result = resolveVesselIdentity('PIONEERING SPIRIT', DEMO_VESSEL_REGISTRY);
  assert(result.selectedCandidate !== null, 'Candidate found for PIONEERING SPIRIT');
  assert(result.selectedCandidate?.imo.value === '9593505', 'IMO is 9593505 (NOT the fake 9771783!)');
  assert(result.selectedCandidate?.mmsi.value === '249110000', 'MMSI is 249110000 (NOT the fake 354000761!)');
  assert(result.selectedCandidate?.flag.value === 'MT', 'Flag is Malta MT (NOT fake Panama!)');
  assert(result.selectedCandidate?.lengthMeters.value === 382, 'Length is 382m (NOT fake 220m!)');
  assert(result.selectedCandidate?.beamMeters.value === 124, 'Beam is 124m (NOT fake 38m!)');
  assert(result.selectedCandidate?.callSign.value === '9HA4112', 'Call Sign is 9HA4112');
  assert(result.selectedCandidate?.ownerOperator.value === 'Allseas Group S.A.', 'Owner is Allseas Group');
  assert(
    result.selectedCandidate?.latestAisPosition?.destination === 'Rostock, Germany',
    'Destination is Rostock, Germany'
  );
}

// =============================================================================
// TEST 12: Vessel Name Normalization
// =============================================================================
console.log('\n--- TEST 12: Vessel Name Normalization ---');
{
  // "MT PACIFIC EXPLORER" should match "PACIFIC EXPLORER"
  const n1 = normalizeVesselName('MT PACIFIC EXPLORER');
  const n2 = normalizeVesselName('pacific explorer');
  const n3 = normalizeVesselName('M/T  Pacific   Explorer... ');
  assert(n1 === 'PACIFIC EXPLORER', 'Strips MT prefix');
  assert(n2 === 'PACIFIC EXPLORER', 'Uppercases lowercase query');
  assert(n3 === 'PACIFIC EXPLORER', 'Handles M/T, multiple spaces, and punctuation');

  const resultWithPrefix = resolveVesselIdentity('M/T PACIFIC EXPLORER', DEMO_VESSEL_REGISTRY);
  assert(resultWithPrefix.selectedCandidate?.imo.value === '9430129', 'Resolves MT PACIFIC EXPLORER successfully');
}

console.log('\n============================================================');
console.log(`TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
