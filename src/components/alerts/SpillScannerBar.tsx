/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Radar, 
  Clock, 
  RefreshCw, 
  Satellite, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  X, 
  Radio,
  Eye,
  Layers,
  Compass
} from 'lucide-react';

export interface ScanResult {
  timestamp: string;
  type: 'MANUAL' | 'AUTO_10MIN';
  message: string;
  sectorsChecked: number;
  vesselsAnalyzed: number;
  newSpillsFound: number;
  detectedIncidentId?: string;
  source?: string;
  regionScanned?: string;
}

interface SpillScannerBarProps {
  isAutoScanning: boolean;
  autoScanCountdown: number;
  onToggleAutoScan: () => void;
  isScanning: boolean;
  scanPhase: string;
  scanProgress: number;
  lastScanResult: ScanResult | null;
  onManualScan: () => void;
  onClearScanResult: () => void;
  onSelectIncident?: (id: string) => void;
  totalScansCount: number;
  selectedCorridor?: string;
  onSelectCorridor?: (corridor: string) => void;
}

export function SpillScannerBar({
  isAutoScanning,
  autoScanCountdown,
  onToggleAutoScan,
  isScanning,
  scanPhase,
  scanProgress,
  lastScanResult,
  onManualScan,
  onClearScanResult,
  onSelectIncident,
  totalScansCount,
  selectedCorridor = 'all',
  onSelectCorridor,
}: SpillScannerBarProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <section 
      id="spill-scanner-surveillance-station"
      className="mb-6 rounded-xl border border-white/15 bg-black/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden font-geist text-white"
    >
      {/* Background Accent Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none ocean-grid" />

      {/* Top Bar: Section Title & Constellation Link Telemetry Badges */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white">
            <Radar className={`w-4 h-4 ${isScanning || isAutoScanning ? 'animate-spin text-white' : 'text-white/70'}`} />
            {isAutoScanning && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                Spill Surveillance Radar
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-white/5 border border-white/10 text-white/60">
                SAR & AIS Feeds
              </span>
            </div>
            <p className="text-xs text-white/50">
              Continuous 10-minute periodic sweep & on-demand manual satellite SAR anomaly detector
            </p>
          </div>
        </div>

        {/* Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-white/70">
            <Satellite className="w-3 h-3 text-white/60" />
            <span>Sentinel-1:</span>
            <span className="text-emerald-400 font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-white/70">
            <Radio className="w-3 h-3 text-white/60" />
            <span>NOAA RSS:</span>
            <span className="text-emerald-400 font-medium">SYNCED</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-white/70">
            <Layers className="w-3 h-3 text-white/60" />
            <span>OR&R:</span>
            <span className="text-white/90 font-medium">4,935 Recs</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-white/70">
            <Clock className="w-3 h-3 text-white/60" />
            <span>Scans:</span>
            <span className="text-white font-medium">{totalScansCount}</span>
          </div>
        </div>
      </div>

      {/* Corridor Filter Selector Row */}
      {onSelectCorridor && (
        <div className="relative z-10 pt-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-white/10 mt-3 text-xs font-mono-code">
          <div className="flex items-center gap-2 text-white/70">
            <Compass className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/50">Target Ocean Corridor:</span>
          </div>
          <div>
            <select
              id="select-ocean-corridor"
              value={selectedCorridor}
              onChange={(e) => onSelectCorridor(e.target.value)}
              disabled={isScanning}
              className="bg-black border border-white/15 rounded-lg px-3 py-1.5 text-white text-xs font-mono-code focus:outline-none focus:border-white cursor-pointer disabled:opacity-50"
            >
              <option value="all">Global Sweep (All Maritime Corridors)</option>
              <option value="gulf">Gulf of Mexico & Louisiana Shelf (USCG D8)</option>
              <option value="atlantic">North Atlantic & Nantucket Shoals (USCG D1)</option>
              <option value="pacific">Eastern Pacific & Alaska Fjords (USCG D11/D17)</option>
              <option value="bay of bengal">Bay of Bengal & Coromandel Coast (ICG)</option>
              <option value="hormuz">Strait of Hormuz & Gulf of Oman</option>
              <option value="red sea">Southern Red Sea & Bab-el-Mandeb Strait</option>
              <option value="malacca">Strait of Malacca & Singapore Strait</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Interactive Controls Row */}
      <div className="relative z-10 pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* BUTTON 1: 10-Minute Auto-Scan Scheduled Button */}
        <div className="lg:col-span-6 bg-white/[0.03] border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg border ${
              isAutoScanning 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/5 border-white/10 text-white/50'
            }`}>
              <Clock className={`w-4 h-4 ${isAutoScanning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-white">
                  10-Min Auto-Scan
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code uppercase ${
                  isAutoScanning 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}>
                  {isAutoScanning ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {isAutoScanning ? (
                  <span className="text-white/80 flex items-center gap-1.5 font-mono-code">
                    <span>Next pass in:</span>
                    <strong className="text-white px-1.5 py-0.5 bg-white/10 rounded border border-white/15">
                      {formatTime(autoScanCountdown)}
                    </strong>
                  </span>
                ) : (
                  'Scans corridor periodically every 10 min'
                )}
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-10min-autoscan"
            onClick={onToggleAutoScan}
            disabled={isScanning}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono-code font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              isAutoScanning
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30'
                : 'bg-white text-black hover:scale-105 shadow-md'
            } disabled:opacity-50`}
          >
            {isAutoScanning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Auto</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start 10m Auto</span>
              </>
            )}
          </button>
        </div>

        {/* BUTTON 2: Manual Scan (Single Instant Scan) Button */}
        <div className="lg:col-span-6 bg-white/[0.03] border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg border ${
              isScanning 
                ? 'bg-white/20 border-white/30 text-white' 
                : 'bg-white/5 border-white/10 text-white/50'
            }`}>
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin text-white' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-white">
                  Manual Scan
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-white/5 text-white/50 border border-white/10 uppercase">
                  Single Pass
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Trigger an instant surveillance scan across target ocean corridor
              </p>
            </div>
          </div>

          <button
            id="btn-trigger-manual-scan"
            onClick={onManualScan}
            disabled={isScanning}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono-code font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              isScanning
                ? 'bg-white/20 text-white border border-white/30 cursor-wait'
                : 'bg-white text-black hover:scale-105 shadow-md active:scale-95'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Manual Scan'}</span>
          </button>
        </div>
      </div>

      {/* SCAN IN PROGRESS ACTIVE HUD */}
      {isScanning && (
        <div 
          id="scanner-active-telemetry-hud"
          className="relative z-10 mt-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/20 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono-code mb-2">
            <div className="flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span className="font-medium">{scanPhase}</span>
            </div>
            <span className="text-white/60 font-semibold">{scanProgress}% COMPLETED</span>
          </div>

          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* LAST SCAN RESULT BANNER */}
      {lastScanResult && !isScanning && (
        <div 
          id="scanner-last-result-banner"
          className={`relative z-10 mt-3.5 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-code transition-all ${
            lastScanResult.newSpillsFound > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-white/[0.03] border-white/15 text-white/90'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {lastScanResult.newSpillsFound > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">
                  {lastScanResult.type === 'AUTO_10MIN' ? '10-Min Automated Scan Report' : 'Manual Scan Report'}
                </span>
                <span className="text-[10px] text-white/50">({lastScanResult.timestamp})</span>
                {lastScanResult.newSpillsFound > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-semibold text-[10px] uppercase">
                    +1 Incident Flagged
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-0.5">
                {lastScanResult.message}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/50 mt-1">
                <span>Swaths: <strong className="text-white">{lastScanResult.sectorsChecked}</strong></span>
                <span>·</span>
                <span>Vessels Tracked: <strong className="text-white">{lastScanResult.vesselsAnalyzed}</strong></span>
                <span>·</span>
                <span>Spills: <strong className={lastScanResult.newSpillsFound > 0 ? 'text-amber-300 font-semibold' : 'text-emerald-400'}>{lastScanResult.newSpillsFound}</strong></span>
                {lastScanResult.regionScanned && (
                  <>
                    <span>·</span>
                    <span>Corridor: <strong className="text-white">{lastScanResult.regionScanned}</strong></span>
                  </>
                )}
                {lastScanResult.source && (
                  <>
                    <span>·</span>
                    <span>Feed: <strong className="text-white/80">{lastScanResult.source}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {lastScanResult.detectedIncidentId && onSelectIncident && (
              <button
                onClick={() => onSelectIncident(lastScanResult.detectedIncidentId!)}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Spill</span>
              </button>
            )}
            <button
              onClick={onClearScanResult}
              title="Dismiss report"
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
