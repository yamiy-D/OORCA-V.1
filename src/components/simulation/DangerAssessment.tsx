/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DangerAssessment as DangerAssessmentType, RiskLevel } from '../../types/simulation';

interface DangerAssessmentProps {
  assessment: DangerAssessmentType;
}

export function DangerAssessment({ assessment }: DangerAssessmentProps) {
  const getRiskTextColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
      case 'High':
        return 'text-red-400 font-medium';
      case 'Medium':
        return 'text-amber-400 font-medium';
      case 'Low':
      default:
        return 'text-emerald-400 font-medium';
    }
  };

  const getOverallBadgeStyle = (overall: string) => {
    switch (overall) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div 
      id="simulation-danger-assessment-card"
      className="bg-black/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between select-none shadow-xl backdrop-blur-xl font-geist text-white"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 tracking-wider uppercase mb-3">
        <span className="text-[10px] text-white/40">▷</span>
        <span>DANGER ASSESSMENT</span>
      </div>

      {/* OVERALL RISK BANNER */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/10 mb-3">
        <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">
          OVERALL RISK
        </span>
        <span className={`px-3 py-1 rounded text-xs font-bold font-mono-code tracking-wider border ${getOverallBadgeStyle(assessment.overallRisk)}`}>
          {assessment.overallRisk}
        </span>
      </div>

      {/* RISKS LIST */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Risk to Environment</span>
          <span className={getRiskTextColor(assessment.riskToEnvironment)}>
            {assessment.riskToEnvironment}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/60">Risk to Shoreline</span>
          <span className={getRiskTextColor(assessment.riskToShoreline)}>
            {assessment.riskToShoreline}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/60">Risk to Human Health</span>
          <span className={getRiskTextColor(assessment.riskToHumanHealth)}>
            {assessment.riskToHumanHealth}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/60">Clean-up Difficulty</span>
          <span className={getRiskTextColor(assessment.cleanUpDifficulty)}>
            {assessment.cleanUpDifficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
