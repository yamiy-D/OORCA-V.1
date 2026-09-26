/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SpillSummary as SpillSummaryType } from '../../types/simulation';

interface SpillSummaryProps {
  summary: SpillSummaryType;
}

export function SpillSummary({ summary }: SpillSummaryProps) {
  return (
    <div 
      id="simulation-spill-summary-card"
      className="bg-black/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between select-none shadow-xl backdrop-blur-xl font-geist text-white"
    >
      <div className="text-[11px] font-semibold text-white/80 tracking-wider uppercase mb-3">
        SPILL SUMMARY
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-white/60">
          <span>Total Spilled</span>
          <span className="font-mono-code text-white font-medium">
            {summary.totalSpilled}
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Spill Area (Est.)</span>
          <span className="font-mono-code text-white font-medium">
            {summary.spillAreaEstKm2.toFixed(2)} km²
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Max Shore Arrival</span>
          <span className="font-mono-code text-amber-400 font-medium">
            {summary.maxShoreArrival}
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Weathering</span>
          <span className="font-mono-code text-white font-medium">
            {summary.weathering}
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Evaporation</span>
          <span className="font-mono-code text-white font-medium">
            {summary.evaporationPct} %
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Dispersion</span>
          <span className="font-mono-code text-white font-medium">
            {summary.dispersionPct} %
          </span>
        </div>

        <div className="flex items-center justify-between text-white/60">
          <span>Remaining on Surface</span>
          <span className="font-mono-code text-white font-medium">
            {summary.remainingOnSurfacePct} %
          </span>
        </div>
      </div>
    </div>
  );
}
