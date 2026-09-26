/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BillingCycle } from '../../types/pricing';
import { Radar, Satellite, Globe, Sparkles, Activity } from 'lucide-react';

interface PricingHeroProps {
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
}

export const PricingHero: React.FC<PricingHeroProps> = ({
  billingCycle,
  onBillingCycleChange,
}) => {
  return (
    <div className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 px-6 md:px-12 text-center max-w-4xl mx-auto font-geist text-white">
      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-white/80 shadow-sm mb-6 backdrop-blur-md">
        <Radar className="w-3.5 h-3.5 text-white/70" />
        <span className="tracking-wide">OORCA Intelligence Plans</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] mb-6">
        Environmental intelligence, <br />
        <span className="text-white/60">priced for impact.</span>
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal mb-10 text-balance">
        Choose the intelligence layer that fits your operational scale—from accessible environmental monitoring for NGOs to national-scale maritime enforcement and fully customized enterprise deployments.
      </p>

      {/* Telemetry Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-mono-code text-white/50 mb-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10">
          <Satellite className="w-3 h-3 text-white/60" />
          <span>Copernicus Sentinel-1 C-SAR</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10">
          <Globe className="w-3 h-3 text-white/60" />
          <span>Global AIS Fleet Correlation</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10">
          <Activity className="w-3 h-3 text-white/60" />
          <span>10-Min Surveillance Pass</span>
        </div>
      </div>

      {/* Interactive Billing Toggle (Monthly | Annual) */}
      <div className="flex flex-col items-center justify-center gap-2.5">
        <div 
          id="billing-cycle-toggle-container"
          className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/15 shadow-xl backdrop-blur-xl"
          role="group"
          aria-label="Billing frequency toggle"
        >
          <button
            type="button"
            id="btn-billing-monthly"
            onClick={() => onBillingCycleChange('monthly')}
            className={`px-5 py-2 rounded-lg text-xs font-mono-code font-medium transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Monthly
          </button>
          
          <button
            type="button"
            id="btn-billing-annual"
            onClick={() => onBillingCycleChange('annual')}
            className={`px-5 py-2 rounded-lg text-xs font-mono-code font-medium transition-all cursor-pointer flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
              billingCycle === 'annual' 
                ? 'bg-black/15 text-black' 
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            }`}>
              Save ~17%
            </span>
          </button>
        </div>

        {/* Clear Annual Benefit Notice */}
        <div className="flex items-center gap-1.5 text-xs font-mono-code text-white/60 pt-1">
          <Sparkles className="w-3 h-3 text-white/70" />
          <span>Annual Billing: <strong>Approximately 2 months free</strong></span>
        </div>
      </div>
    </div>
  );
};
