/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FEATURE_MATRIX } from '../../data/pricingData';
import { Check, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export const FeatureMatrixTable: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Group matrix rows by category
  const categories = Array.from(new Set(FEATURE_MATRIX.map((r) => r.category)));

  const renderCell = (val: boolean | string) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className="inline-flex p-1 rounded-full bg-white/10 text-white">
          <Check className="w-4 h-4" />
        </span>
      ) : (
        <span className="inline-flex p-1 text-white/20">
          <Minus className="w-4 h-4" />
        </span>
      );
    }
    return <span className="text-xs font-mono-code text-white/90">{val}</span>;
  };

  return (
    <section id="feature-matrix-section" className="py-16 sm:py-24 border-t border-white/10 bg-black font-geist text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-code text-white/50 font-semibold uppercase tracking-widest mb-2">
              <span>DETAILED SPECIFICATIONS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Compare Intelligence Coverage
            </h2>
            <p className="text-sm text-white/60 mt-1.5 max-w-2xl">
              Evaluate features, data archival depth, evidence certification, and user allocations across all tiers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-code text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{isExpanded ? 'Collapse Matrix' : 'Expand Matrix'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Matrix Container */}
        {isExpanded && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              
              {/* Header Columns */}
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-xs font-mono-code">
                  <th className="p-4 sm:p-5 text-white/60 uppercase tracking-wider w-1/3">
                    Capability / Vector
                  </th>
                  <th className="p-4 sm:p-5 text-center text-white/90 font-bold w-1/6">
                    <div>NGO</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">$299 / mo</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center text-white font-bold bg-white/[0.06] border-x border-white/15 w-1/6">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>PRIVATE</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="text-[10px] text-white/70 font-normal mt-0.5">$1,499 / mo</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center text-white/90 font-bold w-1/6">
                    <div>GOVERNMENT</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">$4,999 / mo</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center text-white/90 font-bold w-1/6">
                    <div>CUSTOM</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">Token-Based</div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-white/10 text-sm">
                {categories.map((cat, catIdx) => {
                  const rows = FEATURE_MATRIX.filter((r) => r.category === cat);
                  return (
                    <React.Fragment key={catIdx}>
                      {/* Category Header Row */}
                      <tr className="bg-white/[0.03] border-t border-b border-white/10">
                        <td
                          colSpan={5}
                          className="px-4 py-2.5 text-[11px] font-mono-code font-bold uppercase tracking-widest text-white/70"
                        >
                          {cat}
                        </td>
                      </tr>

                      {/* Rows under this category */}
                      {rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="p-4 sm:p-5">
                            <div className="font-medium text-white text-xs sm:text-sm">
                              {row.feature}
                            </div>
                            {row.tooltip && (
                              <div className="text-[11px] text-white/50 mt-0.5 font-mono-code">
                                {row.tooltip}
                              </div>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            {renderCell(row.ngo)}
                          </td>
                          <td className="p-4 sm:p-5 text-center bg-white/[0.03] border-x border-white/10">
                            {renderCell(row.private)}
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            {renderCell(row.government)}
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            {renderCell(row.custom)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </section>
  );
};
