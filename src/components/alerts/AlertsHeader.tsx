/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OorcaBrandLogo } from '../brand/OorcaBrandLogo';
import { 
  ShieldAlert, 
  FileDown, 
  RotateCw, 
  Radar, 
  Clock 
} from 'lucide-react';
import { OilSpillIncident } from '../../types/alertTypes';

interface AlertsHeaderProps {
  incidents: OilSpillIncident[];
  activeIncident: OilSpillIncident;
  onOpenDossier: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onManualScan?: () => void;
  isScanning?: boolean;
  isAutoScanning?: boolean;
  autoScanCountdown?: number;
  onToggleAutoScan?: () => void;
}

export function AlertsHeader({
  incidents,
  onOpenDossier,
  onRefresh,
  isRefreshing,
  onManualScan,
  isScanning = false,
  isAutoScanning = false,
  autoScanCountdown = 600,
  onToggleAutoScan,
}: AlertsHeaderProps) {
  const activeAlertsCount = incidents.length;
  const highPriorityCount = incidents.filter(
    (i) => i.severity === 'CRITICAL' || i.severity === 'HIGH'
  ).length;
  const underInvestigationCount = incidents.filter(
    (i) => i.status === 'UNDER INVESTIGATION' || i.status === 'HIGH PRIORITY'
  ).length;

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header 
      id="alerts-header"
      className="relative z-10 border-b border-white/10 bg-black/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4 font-geist text-white"
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Title & Live Status Indicator */}
        <div>
          <div className="flex items-center gap-3">
            <OorcaBrandLogo size="sm" asLink />
            <div className="h-5 w-[1px] bg-white/10 hidden xs:block" />
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-mono-code uppercase">
                  Alert Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Surveillance Active
                </span>
                {isAutoScanning && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code bg-white/5 border border-white/10 text-white/80">
                    <Clock className="w-3 h-3 text-white/70 animate-spin" />
                    Auto-Scan: {formatCountdown(autoScanCountdown)}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                Real-Time Oil Spill Detection & Maritime Investigation
              </p>
            </div>
          </div>
        </div>

        {/* Incident Summary Badges & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Summary counters */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono-code">
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
              <span className="text-white/50">Active:</span>
              <span className="text-white font-semibold">{activeAlertsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
              <span className="text-white/50">High Priority:</span>
              <span className="text-rose-400 font-semibold">{highPriorityCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Investigating:</span>
              <span className="text-amber-400 font-semibold">{underInvestigationCount}</span>
            </div>
          </div>

          {/* Action Buttons: 10-Min Auto-Scan, Manual Scan, Sync, Dossier */}
          <div className="flex flex-wrap items-center gap-2">
            {onToggleAutoScan && (
              <button
                id="header-btn-toggle-autoscan"
                onClick={onToggleAutoScan}
                disabled={isScanning}
                title={isAutoScanning ? 'Deactivate 10-minute auto scan' : 'Activate automatic scan every 10 minutes'}
                className={`px-3 py-2 rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-all cursor-pointer border disabled:opacity-50 ${
                  isAutoScanning
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 ${isAutoScanning ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span className="hidden sm:inline">
                  {isAutoScanning ? `Auto (${formatCountdown(autoScanCountdown)})` : '10-Min Auto'}
                </span>
                <span className="sm:hidden">
                  {isAutoScanning ? formatCountdown(autoScanCountdown) : '10m'}
                </span>
              </button>
            )}

            {onManualScan && (
              <button
                id="header-btn-manual-scan"
                onClick={onManualScan}
                disabled={isScanning}
                title="Perform a single manual radar scan"
                className={`px-3 py-2 rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-all cursor-pointer border disabled:opacity-50 ${
                  isScanning
                    ? 'bg-white/20 text-white border-white/40 cursor-wait'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/25'
                }`}
              >
                <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-white' : ''}`} />
                <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Manual Scan'}</span>
                <span className="sm:hidden">Scan</span>
              </button>
            )}

            <button
              id="btn-refresh-telemetry"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Real-Time Feeds"
              className="px-2.5 sm:px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono-code flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
              <span className="hidden md:inline">Sync</span>
            </button>

            <button
              id="btn-export-dossier"
              onClick={onOpenDossier}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs font-mono-code flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
