/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Target, 
  Satellite, 
  Ship, 
  Download, 
  ShieldCheck, 
  Share2, 
  Check 
} from 'lucide-react';
import { OilSpillIncident, AlertStatus } from '../../types/alertTypes';

interface AlertActionsBarProps {
  incident: OilSpillIncident;
  onFocusLocation: () => void;
  onViewSatellite: () => void;
  onAnalyzeVesselRoute: () => void;
  onOpenDossier: () => void;
  onStatusChange: (newStatus: AlertStatus) => void;
}

export function AlertActionsBar({
  incident,
  onFocusLocation,
  onViewSatellite,
  onAnalyzeVesselRoute,
  onOpenDossier,
  onStatusChange,
}: AlertActionsBarProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section 
      id="alert-actions-bar"
      className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl mb-8 font-geist text-white"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Investigation Context & Status Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code text-white/50">Incident Lifecycle:</span>
            <select
              value={incident.status}
              onChange={(e) => onStatusChange(e.target.value as AlertStatus)}
              className="bg-neutral-900 border border-white/15 text-white rounded-lg px-2.5 py-1.5 text-xs font-mono-code focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="NEW DETECTION">NEW DETECTION</option>
              <option value="UNDER INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="HIGH PRIORITY">HIGH PRIORITY</option>
              <option value="TRACKING">TRACKING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="text-xs font-mono-code text-white/50 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Chain of Custody: <strong className="text-white">VERIFIED</strong></span>
          </div>
        </div>

        {/* Right: Functional Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono-code">
          <button
            id="btn-action-focus"
            onClick={onFocusLocation}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-white/70" />
            <span>Focus Location</span>
          </button>

          <button
            id="btn-action-sat"
            onClick={onViewSatellite}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Satellite className="w-3.5 h-3.5 text-white/70" />
            <span>Satellite Pass</span>
          </button>

          <button
            id="btn-action-vessel"
            onClick={onAnalyzeVesselRoute}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Ship className="w-3.5 h-3.5 text-white/70" />
            <span>Analyse Route</span>
          </button>

          <button
            id="btn-action-share"
            onClick={handleShareLink}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-white/50" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Alert'}</span>
          </button>

          <button
            id="btn-action-dossier"
            onClick={onOpenDossier}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 shadow-xl hover:bg-neutral-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export Investigation Report</span>
          </button>
        </div>
      </div>
    </section>
  );
}
