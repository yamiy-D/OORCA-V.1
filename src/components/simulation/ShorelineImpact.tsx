/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShorelineImpact as ShorelineImpactType, RiskLevel } from '../../types/simulation';

interface ShorelineImpactProps {
  shorelines: ShorelineImpactType[];
  onSelectShoreline?: (coord: [number, number]) => void;
}

export function ShorelineImpact({ shorelines, onSelectShoreline }: ShorelineImpactProps) {
  const getImpactBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
      case 'High':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  };

  return (
    <div 
      id="simulation-shoreline-impact-card"
      className="bg-black/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between select-none shadow-xl backdrop-blur-xl font-geist text-white"
    >
      <div className="text-[11px] font-semibold text-white/80 tracking-wider uppercase mb-2">
        SHORELINE IMPACT (EST.)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-white/50 border-b border-white/10">
              <th className="pb-1.5 font-normal">Location</th>
              <th className="pb-1.5 font-normal text-center">Arrival Time</th>
              <th className="pb-1.5 font-normal text-right">Impact Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {shorelines.map((shore) => (
              <tr 
                key={shore.id} 
                onClick={() => onSelectShoreline?.(shore.coordinates)}
                className="hover:bg-white/5 transition-colors cursor-pointer"
                title={`Click to center on ${shore.location}`}
              >
                <td className="py-1.5 text-white/90 font-medium whitespace-nowrap">
                  {shore.location}
                </td>
                <td className="py-1.5 text-white/70 text-center font-mono-code text-[11px]">
                  {shore.arrivalTime}
                </td>
                <td className="py-1.5 text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono-code ${getImpactBadge(shore.impactLevel)}`}>
                    {shore.impactLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
