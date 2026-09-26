/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldAlert, 
  Compass, 
  Search, 
  Leaf, 
  Scale, 
  ShieldCheck, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';

const VALUE_PILLARS = [
  {
    title: 'Oil-Spill Detection',
    desc: 'Autonomous multi-spectral and synthetic aperture radar (SAR) dampening classification across remote ocean basins.',
    icon: ShieldAlert,
    tag: 'RADAR SURVEILLANCE',
  },
  {
    title: 'Vessel Attribution',
    desc: 'Hydrodynamic backward-in-time drift modeling intersecting live and dark ship transponder trajectories with physical slicks.',
    icon: Compass,
    tag: 'CAUSAL CORRELATION',
  },
  {
    title: 'Forensic Investigation',
    desc: 'Rapid reconstruction of casualty events, wake-discharge Kelvin envelopes, and bilge dumping signatures.',
    icon: Search,
    tag: 'RECONSTRUCTION',
  },
  {
    title: 'Environmental Intelligence',
    desc: 'Quantification of sensitive marine sanctuary exposure, coral reef vulnerability indices, and ecological impact radius.',
    icon: Leaf,
    tag: 'SANCTUARY DEFENSE',
  },
  {
    title: 'Compliance Intelligence',
    desc: 'International maritime convention enforcement, MARPOL Annex I violation logging, and port state control oversight.',
    icon: Scale,
    tag: 'TREATY MONITORING',
  },
  {
    title: 'Risk Reduction',
    desc: 'Proactive fleet vulnerability screening, operator risk scoring, and early warning boundary alarms before landfall.',
    icon: ShieldCheck,
    tag: 'LOSS PREVENTION',
  },
  {
    title: 'Evidence Generation',
    desc: 'Legally resilient, court-admissible cryptographic dossiers structured for port authorities and international marine claims.',
    icon: FileCheck,
    tag: 'LEGAL ADMISSIBILITY',
  },
];

export const ValuePhilosophySection: React.FC = () => {
  return (
    <section id="value-philosophy-section" className="py-16 sm:py-24 border-t border-white/10 bg-black font-geist text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono-code text-white/50 font-semibold uppercase tracking-widest mb-3">
            <span>COMMERCIAL PHILOSOPHY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Why OORCA is priced differently
          </h2>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl mx-auto">
            OORCA is not an API wrapper or a raw telemetry feed. Customers do not pay for raw satellite pixels or database queries—you invest in the tangible operational outcome of transforming complex ocean signals into decisive, actionable maritime intelligence.
          </p>
        </div>

        {/* 7 Value Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/25 hover:bg-white/[0.04] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono-code text-white/40 uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 rounded border border-white/10">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono-code text-white/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/70" />
                  <span>Value-Driven Architecture</span>
                </div>
              </div>
            );
          })}

          {/* Synthesis Card */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono-code text-white/60 uppercase tracking-widest font-semibold">
                OUTCOME GUARANTEE
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">
                Decisive Environmental Clarity
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                By taking full responsibility for telemetry acquisition, noise rejection, current modeling, and multi-source correlation, OORCA eliminates millions in custom engineering costs for your organisation.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/15 text-[11px] font-mono-code text-white font-medium">
              Zero Raw Compute Overheads
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
