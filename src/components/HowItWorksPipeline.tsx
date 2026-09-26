import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Cpu, 
  Radio, 
  Compass, 
  Target, 
  FileCheck2, 
  ArrowRight, 
  Play, 
  Pause,
  CheckCircle2
} from 'lucide-react';
import { PIPELINE_STEPS } from '../data/mockData';

export const HowItWorksPipeline: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const getStepIcon = (iconName: string, active: boolean) => {
    const className = `w-4 h-4 ${active ? 'text-black' : 'text-white/80'}`;
    switch (iconName) {
      case 'Satellite':
        return <Satellite className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'FileCheck2':
        return <FileCheck2 className={className} />;
      default:
        return <Satellite className={className} />;
    }
  };

  const currentStep = PIPELINE_STEPS[activeStepIndex];

  return (
    <section 
      id="how-it-works"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
              <span>05 / Detection & Attribution Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
              How OORCA works.
            </h2>
            <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed font-normal">
              An end-to-end analytical pipeline from remote sensing satellite detection to hydrodynamic drift modeling and suspect-vessel ranking based on spatio-temporal correlation.
            </p>
          </div>

          {/* Sequence Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono-code text-white transition-all cursor-pointer backdrop-blur-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white/70" /> : <Play className="w-3.5 h-3.5 text-white/70" />}
              <span>{isPlaying ? 'Pause Sequence' : 'Resume Sequence'}</span>
            </button>
            <span className="text-xs font-mono-code text-white/40">
              0{activeStepIndex + 1} / 0{PIPELINE_STEPS.length}
            </span>
          </div>
        </div>

        {/* Pipeline Step Navigator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.stepNumber}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setIsPlaying(false);
                }}
                className={`relative p-3.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black border-white shadow-xl'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/25 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono-code font-medium ${isActive ? 'text-black/60' : 'text-white/40'}`}>
                    0{step.stepNumber}.
                  </span>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                    {getStepIcon(step.icon, isActive)}
                  </div>
                </div>
                <div className="text-xs font-semibold tracking-tight truncate">
                  {step.title}
                </div>
                <div className={`text-[10px] truncate ${isActive ? 'text-black/70' : 'text-white/40'} font-mono-code`}>
                  {step.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Active Step Stage Showcase */}
        <div className="p-8 sm:p-12 rounded-xl bg-white/[0.03] border border-white/15 backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Step Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded bg-white text-black font-mono-code font-semibold text-xs">
                  STAGE 0{activeStepIndex + 1}
                </span>
                <span className="text-xs font-mono-code text-white/50 tracking-wider uppercase">
                  Analytical Pipeline Phase
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white tracking-tight leading-tight">
                {currentStep.title} — <span className="text-white/70">{currentStep.subtitle}</span>
              </h3>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
                {currentStep.description}
              </p>

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono-code">
                <div className="p-4 rounded-lg bg-black/60 border border-white/10">
                  <span className="text-white/40 block mb-1">CORE ENGINE</span>
                  <span className="text-white font-medium text-sm">{currentStep.keyTech}</span>
                </div>
                <div className="p-4 rounded-lg bg-black/60 border border-white/10">
                  <span className="text-white/40 block mb-1">EVIDENTIARY ARTIFACT</span>
                  <span className="text-emerald-400 font-medium text-sm">{currentStep.outputArtifact}</span>
                </div>
              </div>

              {/* Next Step Link */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
                    setIsPlaying(false);
                  }}
                  className="rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2 text-xs font-medium transition-all inline-flex items-center gap-2 backdrop-blur-md cursor-pointer hover:border-white/30"
                >
                  <span>Advance to Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Stage Display */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-square rounded-xl bg-black/80 border border-white/15 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Dense Grid */}
                <div className="absolute inset-0 ocean-grid-dense opacity-20 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between text-xs font-mono-code text-white/60">
                  <span>Stage {currentStep.stepNumber}</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Model
                  </span>
                </div>

                {/* Center Visual Representation */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center p-4">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/15 mb-4 shadow-lg">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-ping-slow" />
                    {getStepIcon(currentStep.icon, false)}
                  </div>
                  <h4 className="text-base font-medium text-white mb-1 tracking-tight">
                    {currentStep.outputArtifact}
                  </h4>
                  <p className="text-xs text-white/50 font-mono-code max-w-xs">
                    Spatio-temporal analysis aligned with marine surveillance standards.
                  </p>
                </div>

                {/* Bottom Status Feed */}
                <div className="relative z-10 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] font-mono-code flex items-center justify-between text-white/70">
                  <span>Status: Validated</span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Evidence
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
