/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Clock, 
  CircleDot, 
  Radio, 
  Satellite, 
  Compass, 
  AlertOctagon, 
  Send 
} from 'lucide-react';
import { TimelineEvent } from '../../types/alertTypes';

interface InvestigationTimelineSectionProps {
  timeline: TimelineEvent[];
}

export function InvestigationTimelineSection({
  timeline,
}: InvestigationTimelineSectionProps) {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'STAGE-01':
        return <Compass className="w-4 h-4 text-white/80" />;
      case 'STAGE-02':
        return <Radio className="w-4 h-4 text-amber-400" />;
      case 'STAGE-03':
        return <Satellite className="w-4 h-4 text-white" />;
      case 'STAGE-04':
        return <CircleDot className="w-4 h-4 text-white/70" />;
      case 'STAGE-05':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      default:
        return <Send className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section 
      id="investigation-timeline"
      className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl mb-6 font-geist text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-mono-code text-white uppercase tracking-wide">
              ⏱ INVESTIGATION TIMELINE & EVENT SEQUENCE
            </h2>
            <p className="text-xs text-white/50 font-mono-code mt-0.5">
              Chronological forensic event log from estimated release to dispatch
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-2.5 py-1 rounded text-[10px] font-mono-code bg-white/5 border border-white/10 text-white/50">
          UTC Standard Timing Reference
        </span>
      </div>

      {/* Timeline Steps */}
      <div className="relative">
        {/* Desktop Connected Line */}
        <div className="hidden lg:block absolute top-7 left-8 right-8 h-0.5 bg-white/10 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10 font-mono-code">
          {timeline.map((event, index) => {
            return (
              <div 
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between hover:border-white/25 hover:bg-white/[0.04] transition-all shadow-md group"
              >
                <div>
                  {/* Top: Icon + UTC Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                      {getStageIcon(event.stageCode)}
                    </div>
                    <span className="text-[11px] font-bold text-white">
                      {event.timeUtc}
                    </span>
                  </div>

                  {/* Stage Code & Badge */}
                  <div className="mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                      {event.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                    {event.title}
                  </h4>

                  {/* Description */}
                  <p className="text-[11px] text-white/60 leading-normal">
                    {event.description}
                  </p>
                </div>

                {/* Status dot */}
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Step {index + 1} of {timeline.length}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    event.status === 'COMPLETED'
                      ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                      : 'text-white bg-white/10 border border-white/20'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
