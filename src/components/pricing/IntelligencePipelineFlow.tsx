/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Cpu, 
  Search, 
  ShieldCheck, 
  Layers, 
  Database,
  CheckCircle2
} from 'lucide-react';

export const IntelligencePipelineFlow: React.FC = () => {
  return (
    <section id="infrastructure-architecture-section" className="py-16 sm:py-24 border-t border-white/10 bg-black font-geist text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono-code text-white/50 font-semibold uppercase tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5 text-white/70" />
            <span>COMMERCIAL INFRASTRUCTURE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Centrally Operated. Instantly Consumed.
          </h2>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl mx-auto">
            The global 10-minute intelligence engine operates centrally, allowing customers to consume processed intelligence rather than independently running a full research cycle.
          </p>
        </div>

        {/* Visual Pipeline Flow Container */}
        <div className="relative p-6 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Step 1: Raw Ingest Layer */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left relative group hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono-code text-white/40 uppercase tracking-widest font-semibold">
                    STAGE 01 • INGESTION
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 text-white/80 border border-white/10">
                    <Database className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-2">
                  Satellite + AIS + Ocean Data
                </h4>

                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Continuous ingestion of Sentinel-1 C-SAR radar, global S-AIS/T-AIS vessel positions, and ECMWF/HYCOM metocean current arrays.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono-code text-white/60">
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Sentinel-1</span>
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">S-AIS</span>
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">HYCOM</span>
              </div>
            </div>

            {/* Step 2: Core Processing Engine */}
            <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/25 text-left relative group shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono-code text-white uppercase tracking-widest font-bold">
                    STAGE 02 • CORE PLATFORM
                  </span>
                  <div className="p-2 rounded-lg bg-white text-black font-bold shadow-md">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-2">
                  OORCA Intelligence Engine
                </h4>

                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  High-throughput distributed engine running continuous 10-minute automated spatial passes, wake-overlap filters, and hydrodynamic hindcasting.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono-code text-white font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>10-MIN CONTINUOUS AUTONOMY</span>
              </div>
            </div>

            {/* Step 3: Five-Stage Transformation Pipeline */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left relative group hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono-code text-white/40 uppercase tracking-widest font-semibold">
                    STAGE 03 • SYNTHESIS
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 text-white/80 border border-white/10">
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-2">
                  Five Forensic Vectors
                </h4>

                <div className="space-y-1.5 text-xs font-mono-code text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">1.</span>
                    <span>Detection (SAR Anomaly)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">2.</span>
                    <span>Attribution (Drift Intersect)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">3.</span>
                    <span>Investigation (Track History)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">4.</span>
                    <span>Impact (Sanctuary ESI)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">5.</span>
                    <span>Evidence (SHA-256 Dossier)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Actionable Intelligence Delivery */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left relative group hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono-code text-white/40 uppercase tracking-widest font-bold">
                    STAGE 04 • OUTCOME
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 text-white/80 border border-white/10">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-2">
                  Actionable Intelligence
                </h4>

                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Immediate incident dispatch, compliance enforcement filings, executive briefings, and automated risk reduction alerts.
                </p>
              </div>

              <div className="text-[11px] font-mono-code text-white/80 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Zero Research Lag</span>
              </div>
            </div>

          </div>

          {/* Bottom Callout Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-white/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70" />
              <span>Multi-Tenant Infrastructure • Dedicated Enclave Isolation Available</span>
            </div>
            <div className="text-white/80 font-medium">
              Serves NGOs, Fleet Operators & Sovereign Regulators with Identical Sub-Second Precision
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
