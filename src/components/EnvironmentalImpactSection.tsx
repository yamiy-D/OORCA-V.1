import React, { useState } from 'react';
import { 
  Fish, 
  Waves, 
  Scale, 
  FileWarning, 
  CheckCircle2, 
  TrendingDown,
  Anchor
} from 'lucide-react';

export const EnvironmentalImpactSection: React.FC = () => {
  const [comparisonState, setComparisonState] = useState<'UNMONITORED' | 'OORCA_PROTECTED'>('OORCA_PROTECTED');

  return (
    <section 
      id="environmental-impact"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Headline */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
            <span>06 / Ecological Stewardship & Liability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
            “The ocean cannot speak. <br />
            <span className="text-white/60">Data can.”</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Every year, thousands of metric tons of hydrocarbon sludges are illicitly discharged into global waters under the cloak of night. 
            Without objective, synchronized orbital data, marine ecosystems suffer in silence while responsible polluters sail on without consequence.
          </p>
        </div>

        {/* 6 Real Marine Environmental Problems Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                <Fish className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Damage to Marine Ecosystems</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Hydrocarbon slicks block atmospheric oxygen dissolution and sunlight penetration, killing plankton blooms and asphyxiating coral reef barrier ecosystems.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-rose-400/80">
              Phytoplankton & Benthic Devastation
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Waves className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Threats to Coastal Sanctuaries</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Unchecked offshore drift vectors push oily emulsions into intertidal mangroves, marine turtle nesting beaches, and artisanal community fisheries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-amber-400/80">
              Irreversible Coastal Oiling
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white mb-5">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Long-Term Bioaccumulation</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Polycyclic aromatic hydrocarbons (PAHs) persist in oceanic food chains for decades, concentrating in pelagic apex predators and commercial fish stocks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-white/50">
              Decadal Trophic Contamination
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white mb-5">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Suspect Vessel Identification</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Identifying potential responsible vessels requires correlating historic AIS tracks with probable release locations and accounting for vessel traffic density and AIS transmission gaps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-white/50">
              AIS Gaps & Maritime Traffic Density
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                <FileWarning className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Trajectory Correlation</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Without automated hindcasting driven by oceanographic and meteorological data, connecting candidate vessels to an estimated spill origin remains technically challenging.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-rose-400/80">
              Spatio-Temporal Correlation Required
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Environmental & Coastal Exposure</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed font-normal">
                Coastal authorities require rapid drift forecasting and suspect-vessel attribution scores to prioritize containment actions and environmental impact mitigation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono-code text-emerald-400/80">
              Containment & Impact Mitigation
            </div>
          </div>

        </div>

        {/* Transition Comparison: Unmonitored Ocean vs OORCA Protected Ocean */}
        <div className="p-8 sm:p-10 rounded-xl bg-white/[0.03] border border-white/15 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono-code text-white/50 tracking-wider uppercase">
                Analytical Advancement in Marine Surveillance
              </span>
              <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight mt-1">
                From Manual Observation to Automated Spatio-Temporal Analysis
              </h3>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-white/15 text-xs font-mono-code">
              <button
                onClick={() => setComparisonState('UNMONITORED')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  comparisonState === 'UNMONITORED'
                    ? 'bg-rose-950 text-rose-200 border border-rose-800/80 font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Unmonitored Status Quo
              </button>
              <button
                onClick={() => setComparisonState('OORCA_PROTECTED')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  comparisonState === 'OORCA_PROTECTED'
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                OORCA Integrated Platform
              </button>
            </div>
          </div>

          {comparisonState === 'UNMONITORED' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs font-mono-code">
              <div className="space-y-2">
                <span className="text-rose-400 font-semibold text-sm block">DISCHARGE OCCURS UNNOTICED</span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Vessels discharge oily bilge or bunker sludges in open waters. Without automated satellite radar ingestion, discharges remain undetected until washing up on coastlines.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-rose-400 font-semibold text-sm block">DELAYED DETECTION & DRIFT UNCERTAINTY</span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Manual reports arrive days after the incident. By then, ocean currents and winds have dispersed the slick, making backward trajectory reconstruction highly complex.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-rose-400 font-semibold text-sm block">UNRESOLVED ATTRIBUTION</span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Dense maritime traffic and AIS gaps obscure which vessel was in proximity during the release window, leaving authorities with unranked candidates and inconclusive evidence.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-white/[0.04] border border-white/15 text-xs font-mono-code">
              <div className="space-y-2">
                <span className="text-white font-semibold text-sm block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SATELLITE SAR & EO DETECTION
                </span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Synthetic Aperture Radar and Electro-Optical satellite imagery provide automated detection, slick characterisation, and geometric property calculations through clouds and darkness.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-white font-semibold text-sm block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  HINDCASTING & DRIFT FORECASTING
                </span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Oceanographic currents and meteorological wind fields trace the slick backward to probable origin coordinates and forecast future drift trajectories for containment planning.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-white font-semibold text-sm block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SPATIO-TEMPORAL VESSEL ATTRIBUTION
                </span>
                <p className="text-white/70 font-geist text-xs leading-relaxed">
                  Reconstructs historic AIS vessel traffic, filters irrelevant traffic, and scores candidate suspect vessels based on spatial proximity, trajectory correlation, and speed anomalies.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
