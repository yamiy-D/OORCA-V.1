/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  FileText, 
  Ship, 
  AlertTriangle, 
  Check, 
  Copy 
} from 'lucide-react';
import { OilSpillIncident } from '../../types/alertTypes';
import { OorcaBrandLogo } from '../brand/OorcaBrandLogo';

interface InvestigationDossierModalProps {
  incident: OilSpillIncident;
  onClose: () => void;
}

export function InvestigationDossierModal({
  incident,
  onClose,
}: InvestigationDossierModalProps) {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const dossierHash = 'e8b492a76f298c11e74db0a5c7f8a9143920c8d19a2b5368f94d01b6ec3401fa';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incident, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OORCA_EVIDENCE_DOSSIER_${incident.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(dossierHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in font-geist">
      <div className="relative w-full max-w-4xl bg-black border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white">
        {/* Modal Top Controls */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-white font-mono-code shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                MARITIME INCIDENT EVIDENCE DOSSIER
              </h3>
              <p className="text-xs text-white/50">
                CASE REFERENCE: <span className="text-white font-bold">{incident.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Dossier Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'Exported' : 'Export JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-white/80 font-mono-code text-xs print:text-black print:bg-white">
          {/* Official Document Banner */}
          <div className="border border-white/10 p-4 rounded-xl bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <OorcaBrandLogo size="sm" asLink={false} />
              <div>
                <div className="text-white font-bold text-sm tracking-wider">
                  OORCA OCEAN OBSERVATION & RADAR FORENSIC ARCHITECTURE
                </div>
                <div className="text-white/50 text-[11px] mt-0.5 font-normal">
                  Specialized Marine Environmental Protection Dossier • UNCLOS & MARPOL Compliance
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-white/50">
              <div>ISSUED: {new Date().toUTCString()}</div>
              <div>CLASSIFICATION: <span className="text-red-400 font-bold">RESTRICTED FORENSIC</span></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                1. INCIDENT OBSERVATION SUMMARY
              </h4>
              {incident.sourceAgency && (
                <div className="text-[10px] text-white/50 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">VERIFIED SOURCE:</span>
                  <span className="text-white/80">{incident.sourceAgency}</span>
                  {incident.officialUrl && (
                    <a
                      href={incident.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline font-bold"
                    >
                      Official Dossier ↗
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[10px]">INCIDENT ID</span>
                <span className="text-white font-bold">{incident.id}</span>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[10px]">SEVERITY INDEX</span>
                <span className="text-red-400 font-bold">{incident.severity}</span>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[10px]">CONFIDENCE</span>
                <span className="text-emerald-400 font-bold">{incident.confidencePercentage}% AI MATCH</span>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[10px]">STATUS</span>
                <span className="text-amber-300 font-bold">{incident.status}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Spill Location & Characteristics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-1">
              2. SATELLITE SPILL COORDINATES & MORPHOLOGY
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/10 space-y-1">
                <div className="text-white/40 text-[10px]">GEOGRAPHIC LOCATION</div>
                <div>Latitude: <strong className="text-white">{incident.location.formattedLat}</strong></div>
                <div>Longitude: <strong className="text-white">{incident.location.formattedLon}</strong></div>
                <div>Maritime Sector: <strong className="text-white/80">{incident.location.seaRegion}</strong></div>
                <div>Jurisdiction: <strong className="text-white/80">{incident.location.eezZone}</strong></div>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/10 space-y-1">
                <div className="text-white/40 text-[10px]">MORPHOLOGICAL PARAMETERS</div>
                <div>Estimated Slick Area: <strong className="text-white">{incident.characteristics.estimatedAreaKm2} km²</strong></div>
                <div>Dimensions: <strong className="text-white">{incident.characteristics.lengthKm} km (L) × {incident.characteristics.widthKm} km (W)</strong></div>
                <div>Estimated Plume Age: <strong className="text-amber-300">{incident.characteristics.estimatedAgeHours}</strong></div>
                <div>Sensor Payload: <strong className="text-white/80">{incident.satellite.satelliteName} ({incident.satellite.sensorType})</strong></div>
              </div>
            </div>
          </div>

          {/* Section 3: Primary Vessel Attribution */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-1">
              3. PRIMARY VESSEL OF INTEREST ATTRIBUTION
            </h4>
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/15 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Ship className="w-4 h-4 text-red-400" />
                    <span>{incident.primarySuspect.name}</span>
                    <span className="text-xs text-white/50">({incident.primarySuspect.flagCountry} {incident.primarySuspect.flag})</span>
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {incident.primarySuspect.imo} • MMSI: {incident.primarySuspect.mmsi} • {incident.primarySuspect.vesselType}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-center">
                  <div className="text-[10px] text-white/50">SUSPECT SCORE</div>
                  <div className="text-base font-bold">{incident.primarySuspect.overallSuspectScore} / 100</div>
                </div>
              </div>

              {/* Factors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-2 border-t border-white/10">
                <div>
                  <span className="text-white/40 block text-[10px]">Proximity</span>
                  <span className="text-white font-bold">{incident.primarySuspect.scoringFactors.proximityScore}%</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Time Window</span>
                  <span className="text-amber-300 font-bold">{incident.primarySuspect.scoringFactors.timeRelevanceScore}%</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Wake Alignment</span>
                  <span className="text-purple-300 font-bold">{incident.primarySuspect.scoringFactors.trajectoryCompatibilityScore}%</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">AIS Anomaly</span>
                  <span className="text-red-400 font-bold">{incident.primarySuspect.scoringFactors.aisBehaviourScore}%</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Speed Delta</span>
                  <span className="text-white font-bold">{incident.primarySuspect.scoringFactors.vesselBehaviourScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Evidence Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-1">
              4. FORENSIC EVIDENCE FINDINGS & STATUTORY CITATIONS
            </h4>
            <div className="space-y-2">
              {incident.primarySuspect.violations.map((vio) => (
                <div key={vio.id} className="bg-white/[0.02] p-3 rounded-lg border border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{vio.title}</span>
                    </div>
                    <p className="text-white/70 text-[11px] mt-1 leading-relaxed">
                      {vio.description}
                    </p>
                  </div>
                  {vio.regulatoryReference && (
                    <span className="text-[10px] text-white font-semibold shrink-0 self-start sm:self-auto bg-white/5 px-2 py-0.5 rounded border border-white/15">
                      {vio.regulatoryReference}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Verification Seal */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">CRYPTOGRAPHIC EVIDENCE FINGERPRINT</span>
                <span className="text-[10px] font-mono text-white/50 break-all">{dossierHash}</span>
              </div>
            </div>

            <button
              onClick={handleCopyHash}
              className="px-2.5 py-1 rounded bg-white/10 text-white hover:bg-white/20 text-[10px] flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono-code text-white/40">
            Exported from OORCA Maritime Environmental Intelligence System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono-code text-xs transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
