import React, { useState } from 'react';
import { 
  Radar, 
  Ship, 
  Waves, 
  ShieldAlert, 
  Scale, 
  Globe, 
  ArrowUpRight, 
  Activity, 
  Satellite, 
  Cpu, 
  Layers, 
  FileText, 
  CheckCircle2,
  X
} from 'lucide-react';
import { CORE_CAPABILITIES } from '../data/mockData';
import { IntelligenceCapability } from '../types';

export const CoreCapabilitiesSection: React.FC = () => {
  const [activeCapability, setActiveCapability] = useState<IntelligenceCapability | null>(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  const intelligenceLayers = [
    {
      id: 'layer-satellite',
      name: 'Satellite Oil Slick Detection',
      badge: '01 / SATELLITE',
      icon: Satellite,
      input: 'Remote Sensing Satellite Data (SAR & EO Imagery)',
      transformation: 'Synthetic Aperture Radar (SAR) backscatter analysis and Electro-Optical (EO) imagery detect surface oil slicks through cloud cover and darkness.',
      output: 'Georeferenced Oil Slick Polygon',
      metrics: 'All-weather SAR & optical EO remote sensing',
    },
    {
      id: 'layer-ai',
      name: 'Slick Characterisation & Geometry',
      badge: '02 / CHARACTERISATION',
      icon: Cpu,
      input: 'Detected Slick Boundaries & Sensor Feeds',
      transformation: 'Calculates slick geometric properties (area, perimeter, orientation) and estimates spill age where feasible while filtering false-positive lookalikes.',
      output: 'Calculated Geometric Properties & Spill Age Estimate',
      metrics: 'Automated geometric extraction · Lookalike rejection',
    },
    {
      id: 'layer-simulation',
      name: 'Slick Hindcasting & Forecasting',
      badge: '03 / DRIFT PHYSICS',
      icon: Waves,
      input: 'Oceanographic Currents & Meteorological Wind Data',
      transformation: 'Traces the slick backward toward its probable origin point and release time, and forecasts future drift and flow paths using metocean data.',
      output: 'Probable Origin Estimate & Forward Drift Trajectory',
      metrics: 'Lagrangian backward trace & forward flow prediction',
    },
    {
      id: 'layer-vessel',
      name: 'Historic AIS Traffic Reconstruction',
      badge: '04 / FLEET KINEMATICS',
      icon: Ship,
      input: 'Historic AIS Vessel Trajectories',
      transformation: 'Reconstructs vessel traffic around the estimated spill origin in space and time, filtering irrelevant traffic to identify candidate suspect vessels.',
      output: 'Filtered Candidate Suspect Vessels & Trajectory Logs',
      metrics: 'Spatio-temporal traffic filtering & candidate isolation',
    },
    {
      id: 'layer-attribution',
      name: 'Suspect Vessel Attribution & Ranking',
      badge: '05 / ATTRIBUTION',
      icon: Scale,
      input: 'Candidate Vessel Tracks + Probable Origin Window',
      transformation: 'Ranks potential suspect vessels based on spatio-temporal correlation, evaluating spatial proximity, trajectory correlation, and behavioural anomalies.',
      output: 'Ranked Suspect Vessel Attribution Scores & Analysis',
      metrics: 'Multi-factor suspect vessel scoring & ranking',
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radar':
        return <Radar className="w-5 h-5" />;
      case 'Ship':
        return <Ship className="w-5 h-5" />;
      case 'Waves':
        return <Waves className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <section 
      id="core-capabilities"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Background Grids */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
              <span>04 / System Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
              Core intelligence capabilities.
            </h2>
            <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed">
              Six dedicated intelligence engines engineered to detect oil slicks from satellite imagery, characterise geometry, model backward/forward drift, reconstruct historic AIS traffic, rank suspect vessels, and provide interactive visual analysis.
            </p>
          </div>
          <div className="text-xs font-mono-code text-white/60 bg-white/5 px-4 py-2 rounded-lg border border-white/10 w-fit">
            Synchronized & Operational
          </div>
        </div>

        {/* The 5-Layer Data Transformation Flow */}
        <div className="mb-20 p-6 sm:p-8 rounded-xl bg-white/[0.03] border border-white/15 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono-code text-white/50 tracking-wider uppercase">
                Integrated Intelligence Pipeline
              </span>
              <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight mt-1">
                The 5-Layer Data Transformation Flow
              </h3>
            </div>
            <div className="text-xs text-white/50 font-mono-code">
              Select any stage to inspect inputs and forensic outputs
            </div>
          </div>

          {/* Interactive Flow Sequence Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative mb-6">
            {intelligenceLayers.map((layer, index) => {
              const Icon = layer.icon;
              const isSelected = selectedLayerIndex === index;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayerIndex(index)}
                  className={`relative text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl'
                      : 'bg-black/60 border-white/10 hover:border-white/30 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-mono-code ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                      {layer.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight mb-1">{layer.name}</h4>
                  <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-black/70' : 'text-white/50'}`}>
                    {layer.output}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Layer Inspection Console */}
          {intelligenceLayers[selectedLayerIndex] && (
            <div className="p-6 rounded-lg bg-black/80 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4">
                  <div className="text-xs font-mono-code text-white/50 mb-1">
                    {intelligenceLayers[selectedLayerIndex].badge}
                  </div>
                  <h4 className="text-lg font-medium text-white tracking-tight">
                    {intelligenceLayers[selectedLayerIndex].name}
                  </h4>
                  <p className="text-xs text-white/50 font-mono-code mt-1">
                    {intelligenceLayers[selectedLayerIndex].metrics}
                  </p>
                </div>

                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
                    <span className="text-white/50 block mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-white/70" />
                      RAW DATA INGESTION
                    </span>
                    <span className="text-white font-medium">
                      {intelligenceLayers[selectedLayerIndex].input}
                    </span>
                    <p className="text-white/60 mt-2 text-[11px] font-geist leading-relaxed">
                      {intelligenceLayers[selectedLayerIndex].transformation}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
                    <span className="text-white/50 block mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      ACTIONABLE FORENSIC OUTPUT
                    </span>
                    <span className="text-white font-medium">
                      {intelligenceLayers[selectedLayerIndex].output}
                    </span>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Attribution and liability correlation verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6 Capabilities Cards Grid */}
        <div className="mb-6">
          <span className="text-xs font-mono-code text-white/40 tracking-wider uppercase block mb-1">
            Subsystem Architecture
          </span>
          <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
            Six Specialized Intelligence Engines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_CAPABILITIES.map((cap) => (
            <div
              key={cap.id}
              className="group p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm"
            >
              <div>
                {/* Header Icon and Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-200">
                    {getIcon(cap.iconName)}
                  </div>
                  <span className="text-[10px] uppercase font-mono-code text-white/40">
                    {cap.tagline.split(' ')[0]} ENGINE
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-lg font-medium text-white tracking-tight">
                  {cap.title}
                </h3>
                <p className="text-xs text-white/50 font-mono-code mt-0.5 mb-3">
                  {cap.tagline}
                </p>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed mb-6 font-normal">
                  {cap.description}
                </p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-black/60 border border-white/10">
                  {cap.metrics.slice(0, 2).map((metric, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[10px] text-white/40 font-mono-code uppercase">
                        {metric.label}
                      </span>
                      <span className="text-xs font-semibold text-white font-mono-code mt-0.5">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Data Flow Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cap.dataFlow.map((flow, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-white/5 text-white/60 border border-white/10"
                    >
                      {flow}
                    </span>
                  ))}
                </div>

                {/* Interactive Modal Trigger */}
                <button
                  onClick={() => setActiveCapability(cap)}
                  className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono-code text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Inspect Specifications</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for In-Depth Capability Inspection */}
        {activeCapability && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-xl bg-black border border-white/20 p-6 sm:p-8 shadow-2xl">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveCapability(null)}
                className="absolute top-5 right-5 text-white/60 hover:text-white p-1 rounded-md bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                  {getIcon(activeCapability.iconName)}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white tracking-tight">
                    {activeCapability.title}
                  </h3>
                  <p className="text-xs text-white/50 font-mono-code">
                    {activeCapability.tagline}
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                {activeCapability.description}
              </p>

              <div className="mb-6">
                <span className="text-xs font-mono-code text-white/50 block mb-2 uppercase">
                  Telemetry Benchmarks & Verification
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {activeCapability.metrics.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 block uppercase font-mono-code">
                        {m.label}
                      </span>
                      <span className="text-sm font-semibold text-white font-mono-code mt-1 block">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-mono-code text-white/50 block mb-2 uppercase">
                  Connected Data Ingestion Pipelines
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCapability.dataFlow.map((f, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono-code text-white/70 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setActiveCapability(null)}
                  className="rounded-lg bg-white px-5 py-2 text-xs font-medium text-black hover:scale-105 transition-transform cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
