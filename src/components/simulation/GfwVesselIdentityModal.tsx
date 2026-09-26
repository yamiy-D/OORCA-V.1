/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  Anchor, 
  X, 
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
  Compass,
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import { 
  VesselIdentityDossier,
  VesselResolutionResult,
  GfwVesselRiskAssessment, 
  searchGfwVesselIdentity, 
  assessGfwVesselRisk 
} from '../../services/api/gfwService';
import { VesselDetails, VesselType } from '../../types/simulation';

interface GfwVesselIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVessel: VesselDetails;
  onApplyVessel: (vessel: VesselDetails) => void;
  spillOrigin?: { lat: number; lng: number };
}

export function GfwVesselIdentityModal({
  isOpen,
  onClose,
  currentVessel,
  onApplyVessel,
  spillOrigin,
}: GfwVesselIdentityModalProps) {
  // =========================================================================
  // STEP 1: State Management for Strict Identity Resolution
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState(currentVessel.vesselName || '');
  const [isSearching, setIsSearching] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<VesselResolutionResult | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<VesselIdentityDossier | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<GfwVesselRiskAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // STEP 2: Initial Load of Regional Candidates or Current Vessel
  useEffect(() => {
    if (isOpen) {
      handleSearchQuery(searchQuery || 'PIONEERING SPIRIT');
    }
  }, [isOpen]);

  const handleSearchQuery = async (queryToSearch: string) => {
    setIsSearching(true);
    const result = await searchGfwVesselIdentity(queryToSearch);
    setResolutionResult(result);

    // If result has a selected candidate, activate it
    if (result.selectedCandidate) {
      setSelectedDossier(result.selectedCandidate);
      runRiskAssessment(result.selectedCandidate);
    } else if (result.candidates.length === 1) {
      setSelectedDossier(result.candidates[0]);
      runRiskAssessment(result.candidates[0]);
    } else {
      setSelectedDossier(null);
      setRiskAssessment(null);
    }

    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearchQuery(searchQuery.trim());
    }
  };

  const handleSelectCandidate = (candidate: VesselIdentityDossier) => {
    setSelectedDossier(candidate);
    runRiskAssessment(candidate);
  };

  const runRiskAssessment = async (dossier: VesselIdentityDossier) => {
    setIsAssessing(true);
    const assessment = await assessGfwVesselRisk(dossier, spillOrigin);
    setRiskAssessment(assessment);
    setIsAssessing(false);
  };

  // STEP 3: Transfer Confirmed Vessel Specs into Active Simulation
  const handleApplyToSimulation = () => {
    if (!selectedDossier) return;

    const shipTypeName = (selectedDossier.shipType.value || '').toLowerCase();
    let mappedType: VesselType = 'Oil Tanker';
    if (shipTypeName.includes('tanker')) mappedType = 'Oil Tanker';
    else if (shipTypeName.includes('cargo') || shipTypeName.includes('bulk')) mappedType = 'Cargo Ship';
    else if (shipTypeName.includes('container')) mappedType = 'Container Vessel';
    else if (shipTypeName.includes('fish') || shipTypeName.includes('trawl')) mappedType = 'Fishing Vessel';
    else if (shipTypeName.includes('passenger') || shipTypeName.includes('ferry')) mappedType = 'Passenger Vessel';

    const updated: VesselDetails = {
      vesselName: selectedDossier.name.value,
      vesselType: mappedType,
      imoNumber: selectedDossier.imo.value || currentVessel.imoNumber,
      length: selectedDossier.lengthMeters.value || currentVessel.length,
      breadth: selectedDossier.beamMeters.value || currentVessel.breadth,
      draft: selectedDossier.draftMeters.value || currentVessel.draft,
      heading: selectedDossier.latestAisPosition?.courseDeg ?? currentVessel.heading ?? 68,
    };

    onApplyVessel(updated);
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-geist select-none animate-in fade-in duration-200">
      
      {/* Modal Dialog Container */}
      <div 
        id="gfw-vessel-identity-modal"
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950 border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.95)] overflow-hidden text-white"
      >
        
        {/* =====================================================================
            STEP 4: MODAL HEADER WITH ACCURATE ATTRIBUTION (NO FAKE LIVE CLAIMS)
            ===================================================================== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono-code">
                  GFW Vessel Identity &amp; Risk Assessment
                </h2>
                {/* Data Source Label (Explicitly distinguishes live API vs simulated demo) */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code font-semibold border ${
                  resolutionResult?.isLiveApi
                    ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}>
                  {resolutionResult?.dataSourceLabel || 'MARITIME REGISTRY'}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono-code">
                Hierarchy: IMO (Persistent Hull) &gt; MMSI (AIS Station) &gt; Call Sign &gt; Multi-Factor Registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close GFW Assessment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =====================================================================
            STEP 5: SEARCH INPUT & CANDIDATE SELECTOR
            ===================================================================== */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by IMO (e.g. 9593505), MMSI (e.g. 249110000), Call Sign, or Vessel Name..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors font-mono-code"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>Resolve Identity</span>
            </button>
          </form>

          {/* Quick Query Candidates Bar */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs font-mono-code">
            <span className="text-white/40 shrink-0">Quick Test:</span>
            {[
              { label: 'PIONEERING SPIRIT (Name - 2 Candidates)', query: 'PIONEERING SPIRIT' },
              { label: 'IMO 9593505 (Malta Heavy Lift)', query: '9593505' },
              { label: 'IMO 9771783 (Panama Tanker)', query: '9771783' },
              { label: 'Identity Conflict Test (IMO vs MMSI)', query: 'IMO 9771783 MMSI 249110000' },
              { label: 'MT Pacific Explorer', query: 'MT PACIFIC EXPLORER' },
              { label: 'Sea Coral (Stale AIS Demo)', query: 'SEA CORAL' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(item.query);
                  handleSearchQuery(item.query);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white shrink-0 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Warnings & Identity Conflicts Banner */}
          {resolutionResult?.hasConflict && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200 font-mono-code">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300 uppercase tracking-wide">
                  ⚠️ IDENTITY CONFLICT: MULTIPLE IDENTITIES DETECTED
                </div>
                {resolutionResult.conflictDetails.map((det, i) => (
                  <p key={i} className="text-[11px] text-white/80 mt-0.5">
                    {det}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Candidates Notice */}
          {resolutionResult && resolutionResult.candidates.length > 1 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 font-mono-code">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>
                  Found <strong>{resolutionResult.candidates.length} candidate vessels</strong> matching &quot;{resolutionResult.query}&quot;. Please select a candidate by IMO/MMSI:
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-900 border border-amber-700 text-amber-300 uppercase">
                IDENTITY UNCONFIRMED
              </span>
            </div>
          )}
        </div>

        {/* =====================================================================
            STEP 6: CANDIDATE SELECTOR CARDS (WHEN MULTIPLE EXIST)
            ===================================================================== */}
        {resolutionResult && resolutionResult.candidates.length > 1 && (
          <div className="p-3 bg-black/40 border-b border-white/10 flex gap-2.5 overflow-x-auto">
            {resolutionResult.candidates.map((cand) => {
              const isSelected = selectedDossier?.id === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => handleSelectCandidate(cand)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 w-64 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-400 shadow-md ring-1 ring-blue-400'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono-code">
                    <span className="font-bold text-white truncate">{cand.name.value}</span>
                    <span className="text-[10px] text-white/50">{cand.flag.value}</span>
                  </div>
                  <div className="text-[10px] text-white/60 font-mono-code mt-1 space-y-0.5">
                    <div>IMO: <strong className="text-white">{cand.imo.value || 'N/A'}</strong></div>
                    <div>MMSI: <strong className="text-white">{cand.mmsi.value || 'N/A'}</strong></div>
                    <div className="truncate text-white/40">{cand.shipType.value}</div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-[10px] font-semibold text-blue-300 font-mono-code flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span>Selected for Analysis</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* =====================================================================
            STEP 7: MAIN CONTENT BODY (VESSEL IDENTITY + AIS POSITION + RISK)
            ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {selectedDossier ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT COLUMN: GFW Vessel Identity Dossier (5 cols) */}
              <div className="lg:col-span-5 rounded-xl border border-white/15 bg-black/60 p-4 flex flex-col justify-between">
                <div>
                  
                  {/* Header Identity & Confidence Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-code text-blue-400 uppercase tracking-wider font-semibold">
                          Vessel Identity Dossier
                        </span>
                        {/* Identity Confidence Badge */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono-code font-bold border ${
                          selectedDossier.identityConfidence === 'HIGH'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : selectedDossier.identityConfidence === 'MEDIUM'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}>
                          CONFIDENCE: {selectedDossier.identityConfidence}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                        {selectedDossier.name.value}
                      </h3>

                      <div className="text-xs text-white/60 font-mono-code mt-0.5">
                        Flag: <strong className="text-white">{selectedDossier.flag.value}</strong>
                        {selectedDossier.registryPort.value && (
                          <span> · Port: {selectedDossier.registryPort.value}</span>
                        )}
                      </div>
                    </div>

                    {/* Registry Verification Status Badge (Separated from Identity!) */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-white/5 border border-white/15 text-white/70">
                      {selectedDossier.registryStatus.value === 'RECORD_VERIFIED'
                        ? 'REGISTRY: VERIFIED'
                        : selectedDossier.registryStatus.value === 'PARTIAL_DATA'
                        ? 'REGISTRY: PARTIAL'
                        : 'REGISTRY: UNVERIFIED'}
                    </span>
                  </div>

                  {/* Specification Table with Provenance Tooltips */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-code pt-3 border-t border-white/10">
                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>IMO NUMBER</span>
                        <span className="text-[9px] text-blue-300 font-semibold">{selectedDossier.imo.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.imo.value || <span className="text-white/30">None</span>}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>MMSI</span>
                        <span className="text-[9px] text-blue-300 font-semibold">{selectedDossier.mmsi.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.mmsi.value || <span className="text-white/30">None</span>}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>CALL SIGN</span>
                        <span className="text-[9px] text-white/30">{selectedDossier.callSign.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.callSign.value || <span className="text-white/30">N/A</span>}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>GROSS TONNAGE</span>
                        <span className="text-[9px] text-white/30">{selectedDossier.grossTonnage.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.grossTonnage.value ? `${selectedDossier.grossTonnage.value.toLocaleString()} GT` : 'N/A'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>DIMENSIONS</span>
                        <span className="text-[9px] text-white/30">{selectedDossier.lengthMeters.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.lengthMeters.value ? `${selectedDossier.lengthMeters.value}m` : 'N/A'}
                        {selectedDossier.beamMeters.value ? ` × ${selectedDossier.beamMeters.value}m` : ''}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>MAX DRAFT</span>
                        <span className="text-[9px] text-white/30">{selectedDossier.draftMeters.source}</span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedDossier.draftMeters.value ? `${selectedDossier.draftMeters.value}m` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Vessel Classification */}
                  <div className="mt-3 p-2.5 rounded bg-blue-950/20 border border-blue-500/20 text-xs">
                    <div className="text-[10px] font-mono-code text-blue-300">VESSEL CLASSIFICATION</div>
                    <div className="font-medium text-white mt-0.5">
                      {selectedDossier.shipType.value}
                    </div>
                  </div>

                  {/* Owner & Operator Attribution */}
                  {selectedDossier.ownerOperator.value && (
                    <div className="mt-2.5 text-xs text-white/60 font-mono-code">
                      <span className="text-white/40">Registered Operator: </span>
                      <strong className="text-white">{selectedDossier.ownerOperator.value}</strong>
                    </div>
                  )}

                  {/* STEP 8: SEPARATE AIS DYNAMIC POSITION TELEMETRY BOX */}
                  {selectedDossier.latestAisPosition && (
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 font-mono-code text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-white/10">
                        <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                          <Radio className="w-3 h-3 text-cyan-400" />
                          <span>Latest AIS Position</span>
                        </span>
                        
                        {/* Staleness Badge */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          selectedDossier.latestAisPosition.isStale
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {selectedDossier.latestAisPosition.isStale ? 'STALE AIS DATA' : 'RECENT POSITION'}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1">
                        <span className="text-white/40">Received:</span>
                        <span className="text-white">{selectedDossier.latestAisPosition.ageHumanReadable}</span>
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Coordinates:</span>
                        <span className="text-white">
                          {selectedDossier.latestAisPosition.latitude.toFixed(4)}°N, {selectedDossier.latestAisPosition.longitude.toFixed(4)}°E
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Speed / Course:</span>
                        <span className="text-white">
                          {selectedDossier.latestAisPosition.speedKnots} kts · {selectedDossier.latestAisPosition.courseDeg}°
                        </span>
                      </div>

                      {selectedDossier.latestAisPosition.destination && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/40">Destination:</span>
                          <span className="text-cyan-300 truncate max-w-[150px]">
                            {selectedDossier.latestAisPosition.destination}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Apply Button */}
                <div className="mt-5 pt-3 border-t border-white/10">
                  <button
                    onClick={handleApplyToSimulation}
                    disabled={appliedNotice}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      appliedNotice
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    {appliedNotice ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Vessel Dimensions Applied to Simulation!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Apply Vessel Dimensions to Simulation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Multi-Factor Vessel Risk Assessment (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {riskAssessment ? (
                  <div className="rounded-xl border border-white/15 bg-black/60 p-4 space-y-4">
                    
                    {/* Overall Risk Score Header */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <div>
                        <div className="text-[10px] font-mono-code text-white/50 uppercase">
                          Forensic Oil Spill Association Risk
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-2xl font-bold font-mono-code text-white">
                            {riskAssessment.overallRiskScore}
                            <span className="text-sm text-white/40">/100</span>
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono-code border ${
                              riskAssessment.overallRiskLevel === 'CRITICAL'
                                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                                : riskAssessment.overallRiskLevel === 'HIGH'
                                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            }`}
                          >
                            {riskAssessment.overallRiskLevel} ASSOCIATION RISK
                          </span>
                        </div>
                      </div>

                      <ShieldAlert className={`w-8 h-8 ${
                        riskAssessment.overallRiskLevel === 'CRITICAL'
                          ? 'text-rose-400'
                          : riskAssessment.overallRiskLevel === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`} />
                    </div>

                    {/* Risk Factor Breakdown */}
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-mono-code text-white/60 font-semibold uppercase tracking-wider">
                        Attribution Factors
                      </div>

                      {/* Factor 1: Proximity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono-code">
                          <span className="text-white/70">🎯 Spill Release Coordinate Proximity</span>
                          <span className="font-semibold text-rose-300">{riskAssessment.factors.attributionScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${riskAssessment.factors.attributionScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Factor 2: AIS Dark Activity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono-code">
                          <span className="text-white/70">📡 AIS Transmission Gap Analysis</span>
                          <span className="font-semibold text-amber-300">{riskAssessment.factors.darkActivityScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${riskAssessment.factors.darkActivityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Factor 3: Loitering */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono-code">
                          <span className="text-white/70">⏱️ Loitering &amp; Speed Drop Anomaly</span>
                          <span className="font-semibold text-amber-300">{riskAssessment.factors.loiteringAnomalyScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full" 
                            style={{ width: `${riskAssessment.factors.loiteringAnomalyScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Factor 4: Flag Compliance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono-code">
                          <span className="text-white/70">🏴 Flag State Compliance (Paris MoU)</span>
                          <span className="font-semibold text-white/90">{riskAssessment.factors.complianceScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-400 rounded-full" 
                            style={{ width: `${riskAssessment.factors.complianceScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Forensic Findings */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="text-[11px] font-mono-code text-white/60 font-semibold uppercase tracking-wider">
                        Forensic Findings &amp; Evidence
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {riskAssessment.indicators.map((ind, i) => (
                          <div 
                            key={i} 
                            className="p-2 rounded bg-white/[0.02] border border-white/10 flex items-start gap-2 text-xs"
                          >
                            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              ind.severity === 'critical' ? 'text-rose-400' : ind.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                            }`} />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{ind.label}</span>
                                <span className="text-[9px] font-mono-code text-white/40 uppercase">· {ind.category}</span>
                              </div>
                              <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                                {ind.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enforcement Action Box */}
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs">
                      <div className="font-semibold text-rose-200 flex items-center gap-1.5 uppercase font-mono-code">
                        <Anchor className="w-3.5 h-3.5 text-rose-400" />
                        <span>Maritime Response Recommendation</span>
                      </div>
                      <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
                        {riskAssessment.enforcementActionRecommended}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-white/40 text-xs font-mono-code">
                    Running forensic association assessment...
                  </div>
                )}
              </div>

            </div>
          ) : resolutionResult && resolutionResult.candidates.length > 1 ? (
            /* =================================================================
               STEP 7.5: MULTIPLE CANDIDATES SELECTION & RESOLUTION VIEW
               =================================================================
               Requirement 3 & 14: Never silently select first candidate when name
               search yields multiple hulls. Require explicit user candidate selection
               or provide IMO/MMSI.
               ================================================================= */
            <div className="p-4 sm:p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-200 uppercase font-mono-code flex items-center gap-2">
                      <span>Candidates Found: {resolutionResult.candidates.length}</span>
                      <span className="text-amber-400/60">·</span>
                      <span className="text-xs text-amber-300">IDENTITY UNCONFIRMED</span>
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Vessel name is NOT a unique identifier. Found {resolutionResult.candidates.length} distinct vessels matching &quot;{resolutionResult.query}&quot;. Please select which vessel to analyze:
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold bg-amber-900 border border-amber-600 text-amber-200 uppercase shrink-0">
                  SELECTION REQUIRED
                </span>
              </div>

              {/* Candidate Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolutionResult.candidates.map((cand, idx) => (
                  <div
                    key={cand.id}
                    className="p-4 rounded-xl border border-white/15 bg-black/60 flex flex-col justify-between hover:border-cyan-400/60 hover:bg-black/80 transition-all shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div>
                          <span className="text-[10px] font-mono-code font-semibold text-cyan-400 uppercase tracking-wider">
                            Candidate #{idx + 1}
                          </span>
                          <h4 className="text-base font-bold text-white tracking-wide">{cand.name.value}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-white/10 border border-white/10 text-white/80">
                          {cand.flag.value}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                        <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-white/40 block">IMO (PERSISTENT)</span>
                          <strong className="text-white text-xs">{cand.imo.value || 'N/A'}</strong>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-white/40 block">MMSI (STATION)</span>
                          <strong className="text-white text-xs">{cand.mmsi.value || 'N/A'}</strong>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-white/40 block">CALL SIGN</span>
                          <span className="text-white text-xs">{cand.callSign.value || 'N/A'}</span>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-white/40 block">DIMENSIONS</span>
                          <span className="text-white text-xs">{cand.lengthMeters.value}m × {cand.beamMeters.value}m</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs font-mono-code space-y-1">
                        <div className="text-[10px] text-white/50 uppercase">CLASSIFICATION &amp; REGISTRY:</div>
                        <div className="font-semibold text-cyan-200">{cand.shipType.value}</div>
                        {cand.ownerOperator.value && (
                          <div className="text-[11px] text-white/70">Operator: {cand.ownerOperator.value}</div>
                        )}
                        {cand.latestAisPosition && (
                          <div className="text-[11px] text-emerald-300 pt-1 border-t border-white/5 flex items-center justify-between">
                            <span>AIS: {cand.latestAisPosition.ageHumanReadable}</span>
                            {cand.latestAisPosition.destination && (
                              <span className="text-white/60">Dest: {cand.latestAisPosition.destination}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCandidate(cand)}
                      className="mt-4 w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Select Candidate #{idx + 1} for Investigation</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-white/50 font-mono-code text-xs space-y-2">
              <div className="text-2xl">🔎</div>
              <div className="text-white font-semibold text-sm">
                {resolutionResult?.message || 'Unable to confidently resolve vessel identity.'}
              </div>
              <p className="text-white/40 max-w-md mx-auto">
                No verified vessel record matching this query was found in the Global Fishing Watch registry or active AIS database.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/50 font-mono-code">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${resolutionResult?.isLiveApi ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>
              {resolutionResult?.isLiveApi
                ? 'Connected to Live Global Fishing Watch Gateway API'
                : 'Using Verified Demonstration Maritime Registry Catalog'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
