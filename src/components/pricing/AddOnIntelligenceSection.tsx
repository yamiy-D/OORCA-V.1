/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ADD_ON_INTELLIGENCE } from '../../data/pricingData';
import { Ship, Radar, ShieldCheck, FileText, Zap, Plus } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ship,
  Radar,
  ShieldCheck,
  FileText,
  Zap,
};

export const AddOnIntelligenceSection: React.FC = () => {
  return (
    <section id="additional-intelligence-section" className="py-16 sm:py-20 border-t border-white/10 bg-black font-geist text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-code text-white/50 font-semibold uppercase tracking-widest mb-2">
              <Plus className="w-3.5 h-3.5 text-white/70" />
              <span>MODULAR CAPABILITIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Additional Intelligence
            </h2>
            <p className="text-sm text-white/60 mt-1.5 max-w-xl leading-relaxed">
              Enhance any tier with on-demand investigation capacity, extra monitored tonnage, and cryptographic forensic packages.
            </p>
          </div>
          
          <div className="text-xs font-mono-code text-white/50 bg-white/[0.03] px-3.5 py-1.5 rounded-lg border border-white/10 self-start sm:self-auto">
            AVAILABLE ON ALL COMMERCIAL PLANS
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ADD_ON_INTELLIGENCE.map((addon) => {
            const Icon = ICON_MAP[addon.iconName] || Zap;
            return (
              <div
                key={addon.id}
                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-white group-hover:bg-white/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono-code text-white/40 uppercase tracking-wider">
                      ADD-ON
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-white transition-colors">
                    {addon.title}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed mb-4">
                    {addon.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="text-base font-bold text-white">
                    {addon.price}
                  </div>
                  <div className="text-[10px] font-mono-code text-white/50 mt-0.5">
                    {addon.pricingType}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
