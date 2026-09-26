/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EcologicalInhabitant, RiskLevel } from '../../types/simulation';

interface EcologicalRiskTableProps {
  inhabitants: EcologicalInhabitant[];
}

export function EcologicalRiskTable({ inhabitants }: EcologicalRiskTableProps) {
  const getHabitatIcon = (iconType: string) => {
    switch (iconType) {
      case 'mangrove':
        return '🌲';
      case 'coral':
        return '🪸';
      case 'seagrass':
        return '🌿';
      case 'dolphin':
        return '🐬';
      case 'turtle':
        return '🐢';
      case 'fish':
        return '🐟';
      case 'plankton':
      default:
        return '🦠';
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
      case 'High':
        return 'bg-red-500/15 text-red-400 border border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'Low':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
  };

  return (
    <div 
      id="simulation-ecological-risk-card"
      className="bg-black/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between select-none shadow-xl backdrop-blur-xl font-geist"
    >
      <div className="text-[11px] font-semibold text-white/80 tracking-wider uppercase mb-2">
        ECOLOGICAL INHABITANTS AT RISK
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-white/50 border-b border-white/10">
              <th className="pb-1.5 font-normal">Species / Habitat</th>
              <th className="pb-1.5 font-normal text-center">Presence</th>
              <th className="pb-1.5 font-normal text-right">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {inhabitants.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-1.5 text-white/90 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm">{getHabitatIcon(item.iconType)}</span>
                  <span>{item.speciesHabitat}</span>
                </td>
                <td className="py-1.5 text-white/70 text-center font-mono-code text-[11px]">
                  {item.presence}
                </td>
                <td className="py-1.5 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono-code ${getRiskBadge(item.riskLevel)}`}>
                    {item.riskLevel}
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
