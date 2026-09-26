import React from 'react';
import { 
  Check, 
  X, 
  Sparkles
} from 'lucide-react';

export const WhyOorcaIsDifferentSection: React.FC = () => {
  const comparisonData = [
    {
      feature: 'Satellite SAR & EO Slick Detection',
      traditional: 'Isolated Imagery (Cloud delays, manual photo-interpreter reviews take days)',
      oorca: 'Automated Satellite Ingestion (Processes SAR & EO imagery with ML classifiers)',
    },
    {
      feature: 'Historic AIS Traffic & Anomaly Handling',
      traditional: 'Blind Spot (Vessels disappear or blend into high traffic volume)',
      oorca: 'Historic AIS Spatio-Temporal Filtering & Vessel Behavioural Anomaly Detection',
    },
    {
      feature: 'Slick Hindcasting & Origin Estimation',
      traditional: 'Static Weather Maps (Basic wind estimates without oceanographic current backtracking)',
      oorca: 'MetOcean Hindcasting (Traces slick drift backward to probable release origin & time)',
    },
    {
      feature: 'Suspect Vessel Attribution & Ranking',
      traditional: 'Manual Inspection (Unranked lists of maritime vessels without correlation)',
      oorca: 'Multi-Factor Attribution Scoring (Ranks candidate vessels by proximity, trajectory & anomalies)',
    },
    {
      feature: 'Unified Analysis Workflow',
      traditional: 'Fragmented Tools (Separate disconnected viewers for imagery, drift, and AIS)',
      oorca: 'Single Interactive Canvas: Detect → Characterise → Hindcast → Forecast → Attribute',
    },
  ];

  const processFlow = [
    { title: 'Detect', desc: 'SAR & EO Satellite Feeds' },
    { title: 'Characterise', desc: 'Geometry & Age Estimate' },
    { title: 'Hindcast', desc: 'MetOcean Backward Drift' },
    { title: 'Forecast', desc: 'Predictive Slick Motion' },
    { title: 'Reconstruct', desc: 'Historic AIS Traffic' },
    { title: 'Attribute', desc: 'Rank Suspect Vessels' },
  ];

  return (
    <section 
      id="why-oorca-is-different"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Background Grids */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
            <span>07 / Architectural Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
            From satellite detection <br />
            to suspect attribution — <br />
            <span className="text-white/60">in one integrated workflow.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Addressing marine oil spills requires bridging remote sensing, ocean hydrodynamics, and maritime traffic reconstruction. OORCA unifies detection, drift modeling, and suspect-vessel ranking into a single workflow.
          </p>
        </div>

        {/* Process Flow Ribbon */}
        <div className="mb-16 p-6 sm:p-8 rounded-xl bg-white/[0.03] border border-white/15 backdrop-blur-md">
          <div className="text-xs font-mono-code text-white/50 mb-6 uppercase tracking-wider">
            The Unified OORCA Intelligence Lifecycle
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
            {processFlow.map((step, idx) => (
              <div 
                key={idx}
                className="relative p-4 rounded-lg bg-black/60 border border-white/10 flex flex-col justify-between group hover:border-white/30 transition-colors"
              >
                <div>
                  <div className="text-[10px] font-mono-code text-white/40 mb-1">
                    0{idx + 1}.
                  </div>
                  <div className="text-sm font-semibold text-white tracking-tight">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-white/50 font-mono-code mt-0.5">
                    {step.desc}
                  </div>
                </div>

                {idx < processFlow.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-white/30 text-xs">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Matrix */}
        <div className="rounded-xl bg-white/[0.03] border border-white/15 overflow-hidden shadow-2xl backdrop-blur-md">
          
          <div className="p-5 sm:p-6 bg-white/[0.02] border-b border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 text-xs font-mono-code text-white/50 uppercase tracking-wider">
              Capability Comparison
            </div>
            <div className="md:col-span-4 text-xs font-mono-code text-white/40 uppercase">
              Legacy Disconnected Silos
            </div>
            <div className="md:col-span-4 text-xs font-mono-code text-white font-medium uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              OORCA Unified Ecosystem
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {comparisonData.map((row, idx) => (
              <div 
                key={idx} 
                className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="md:col-span-4">
                  <span className="text-sm font-medium text-white tracking-tight">
                    {row.feature}
                  </span>
                </div>
                <div className="md:col-span-4 flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400/80 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/50 leading-relaxed font-mono-code">
                    {row.traditional}
                  </span>
                </div>
                <div className="md:col-span-4 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90 font-medium leading-relaxed font-mono-code">
                    {row.oorca}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
