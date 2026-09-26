/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Clock, 
  MapPin
} from 'lucide-react';
import { OilSpillIncident, AlertSeverity, AlertStatus } from '../../types/alertTypes';

interface ActiveAlertsCardsProps {
  incidents: OilSpillIncident[];
  activeIncidentId: string;
  onSelectIncident: (id: string) => void;
}

export function ActiveAlertsCards({
  incidents,
  activeIncidentId,
  onSelectIncident,
}: ActiveAlertsCardsProps) {
  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL',
          classes: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-400 animate-pulse',
        };
      case 'HIGH':
        return {
          label: 'HIGH',
          classes: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM',
          classes: 'bg-white/10 border-white/20 text-white/90',
          dot: 'bg-white/70',
        };
      case 'LOW':
      default:
        return {
          label: 'LOW',
          classes: 'bg-white/5 border-white/10 text-white/50',
          dot: 'bg-white/40',
        };
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'HIGH PRIORITY':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'UNDER INVESTIGATION':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'TRACKING':
        return 'text-white/80 bg-white/10 border-white/15';
      case 'RESOLVED':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'NEW DETECTION':
      default:
        return 'text-white/80 bg-white/10 border-white/15';
    }
  };

  return (
    <section id="active-alerts-section" className="mb-6 font-geist">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <h2 className="text-xs sm:text-sm font-medium tracking-wider text-white uppercase">
            Detected Incidents ({incidents.length})
          </h2>
        </div>
        <span className="text-[11px] font-mono-code text-white/40">
          Select incident card to update forensic telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {incidents.map((incident) => {
          const isActive = incident.id === activeIncidentId;
          const sev = getSeverityBadge(incident.severity);
          const statusClass = getStatusBadge(incident.status);

          return (
            <div
              key={incident.id}
              id={`alert-card-${incident.id.toLowerCase()}`}
              onClick={() => onSelectIncident(incident.id)}
              className={`relative rounded-xl p-4 transition-all duration-200 cursor-pointer border backdrop-blur-md ${
                isActive
                  ? 'bg-white/[0.08] border-white text-white shadow-2xl ring-1 ring-white/30'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05] text-white/90'
              }`}
            >
              {/* Top row: ID + Severity Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold font-mono-code text-white">
                    {incident.id}
                  </span>
                  {incident.externalIncidentId && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono-code bg-white/10 text-white/70 border border-white/15 rounded">
                      {incident.externalIncidentId}
                    </span>
                  )}
                  {isActive && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono-code bg-white text-black font-semibold rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-medium border flex items-center gap-1.5 ${sev.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                  {sev.label}
                </div>
              </div>

              {/* Title & Region */}
              <div className="mb-3">
                <h3 className="text-sm font-medium text-white line-clamp-1 tracking-tight">
                  {incident.title}
                </h3>
                <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5 font-geist">
                  <MapPin className="w-3 h-3 text-white/40 shrink-0" />
                  <span className="truncate">{incident.location.seaRegion}</span>
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-code bg-black/60 border border-white/10 rounded-lg p-2.5 mb-3">
                <div>
                  <span className="text-white/40 block text-[10px]">Estimated Area</span>
                  <span className="text-white font-medium text-xs">
                    {incident.estimatedSpillAreaKm2} km²
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Confidence</span>
                  <span className="text-emerald-400 font-medium text-xs">
                    {incident.confidencePercentage}% AI Match
                  </span>
                </div>
              </div>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between text-[10px] font-mono-code pt-1.5 border-t border-white/10 text-white/40">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span>{incident.detectionTimestampUtc.split(' ')[1]} UTC</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusClass}`}>
                  {incident.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
