/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PricingPlan, BillingCycle } from '../../types/pricing';
import { 
  Check, 
  Sparkles, 
  Shield, 
  Coins, 
  Users, 
  ArrowRight, 
  Layers
} from 'lucide-react';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingCycle,
  onSelectPlan,
}) => {
  const isAnnual = billingCycle === 'annual';
  
  const displayPrice = plan.isCustom
    ? 'Custom'
    : isAnnual
    ? `$${(plan.annualPrice as number).toLocaleString()}`
    : `$${(plan.monthlyPrice as number).toLocaleString()}`;

  const billingPeriodLabel = plan.isCustom
    ? 'Token-Based'
    : isAnnual
    ? '/ year'
    : '/ month';

  return (
    <div
      id={`pricing-card-${plan.id}`}
      className={`relative flex flex-col rounded-xl transition-all duration-300 text-left backdrop-blur-xl font-geist text-white ${
        plan.isPopular
          ? 'bg-white/[0.06] border-2 border-white shadow-2xl -translate-y-1 lg:-translate-y-2'
          : plan.isGovernment
          ? 'bg-white/[0.03] border border-white/20 hover:border-white/40 shadow-xl hover:-translate-y-1'
          : 'bg-white/[0.02] border border-white/10 hover:border-white/25 shadow-lg hover:-translate-y-1'
      } p-6 sm:p-7 flex-1`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-code font-semibold uppercase tracking-wider bg-white text-black shadow-md">
          <Sparkles className="w-3 h-3 text-black fill-black" />
          <span>Most Popular</span>
        </div>
      )}

      {/* Government Badge */}
      {plan.isGovernment && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-code font-semibold uppercase tracking-wider bg-black border border-white/20 text-white shadow-md">
          <Shield className="w-3 h-3 text-white/80" />
          <span>Sovereign & Regulatory</span>
        </div>
      )}

      {/* Custom Enterprise Badge */}
      {plan.isCustom && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-code font-semibold uppercase tracking-wider bg-black border border-white/20 text-white">
          <Coins className="w-3 h-3 text-white/80" />
          <span>Token-Based Architecture</span>
        </div>
      )}

      {/* Card Header */}
      <div className="pb-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono-code tracking-widest text-white/60 font-medium uppercase">
            {plan.code}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono-code text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <Users className="w-3 h-3 text-white/70" />
            <span>{plan.userLimit}</span>
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-1">
          {plan.name}
        </h3>

        <p className="text-xs font-mono-code text-white/70 mb-3">
          {plan.positioning}
        </p>

        <p className="text-xs text-white/50 leading-relaxed min-h-[36px]">
          {plan.targetAudience}
        </p>
      </div>

      {/* Price Display */}
      <div className="py-5 border-b border-white/10">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
            {displayPrice}
          </span>
          <span className="text-xs sm:text-sm font-mono-code text-white/50">
            {billingPeriodLabel}
          </span>
        </div>

        {/* Annual equivalent note */}
        {!plan.isCustom && (
          <div className="mt-1.5 text-[11px] font-mono-code text-white/40">
            {isAnnual ? (
              <span className="text-emerald-400 font-medium">Billed annually (${~~((plan.annualPrice as number) / 12)} / mo equiv.)</span>
            ) : (
              <span>or ${ (plan.annualPrice as number).toLocaleString() } billed annually</span>
            )}
          </div>
        )}

        {plan.isCustom && (
          <div className="mt-1.5 text-[11px] font-mono-code text-white/60">
            Custom commercial agreement & SLA
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-5 pb-6">
        <button
          type="button"
          onClick={() => onSelectPlan(plan)}
          className={`w-full py-3 px-4 rounded-lg text-xs font-mono-code font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            plan.isPopular
              ? 'bg-white text-black hover:scale-105 shadow-lg'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-white/30'
          }`}
        >
          <span>{plan.ctaText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Features List */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {plan.inheritedFrom && (
            <div className="text-[11px] font-mono-code text-white/80 font-medium mb-3 tracking-wide uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-white/60" />
              <span>{plan.inheritedFrom}</span>
            </div>
          )}

          {!plan.inheritedFrom && (
            <div className="text-[11px] font-mono-code text-white/50 mb-3 tracking-wide uppercase">
              Intelligence capabilities:
            </div>
          )}

          <ul className="space-y-2.5 text-xs text-white/70">
            {plan.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                  plan.isPopular ? 'bg-white text-black' : 'bg-white/10 text-white'
                }`}>
                  <Check className="w-3 h-3" />
                </span>
                <span className="leading-snug text-white/80">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Custom Plan Token Specification Callout */}
        {plan.isCustom && (
          <div className="mt-6 p-4 rounded-lg bg-black/60 border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-white font-mono-code font-medium mb-2">
              <Coins className="w-3.5 h-3.5 text-white/70" />
              <span>Token-based usage</span>
            </div>
            <p className="text-white/50 text-[11px] mb-2 leading-relaxed">
              Tokens can be consumed dynamically by:
            </p>
            <ul className="grid grid-cols-1 gap-1 text-[11px] text-white/70 font-mono-code mb-3">
              {plan.tokenOperations?.map((op, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span>{op}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 leading-relaxed italic">
              {plan.tokenNotes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
