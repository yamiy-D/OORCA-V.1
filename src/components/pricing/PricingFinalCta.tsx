/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, MessageSquare, ArrowRight, Shield } from 'lucide-react';

interface PricingFinalCtaProps {
  onTalkToOorca: () => void;
}

export const PricingFinalCta: React.FC<PricingFinalCtaProps> = ({ onTalkToOorca }) => {
  const navigate = useNavigate();

  return (
    <section id="pricing-final-cta" className="py-20 sm:py-28 border-t border-white/10 bg-black font-geist text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-code text-white/70 mb-6">
          <Shield className="w-3.5 h-3.5 text-white/80" />
          <span>OPERATIONAL MARITIME SURVEILLANCE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
          Turn Ocean Signals Into Actionable Intelligence.
        </h2>

        <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
          Whether you are protecting marine ecosystems, managing a fleet, or enforcing maritime environmental regulations, OORCA provides the intelligence layer required to detect, attribute and investigate marine pollution.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-mono-code font-semibold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95"
          >
            <Compass className="w-4 h-4 text-white/70" />
            <span>Explore OORCA</span>
          </button>

          <button
            type="button"
            onClick={onTalkToOorca}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-mono-code font-semibold text-black bg-white hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-black" />
            <span>Talk to OORCA</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>

      </div>
    </section>
  );
};
