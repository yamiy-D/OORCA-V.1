/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

interface NgoDiscountNoticeProps {
  onApplyDiscount?: () => void;
}

export const NgoDiscountNotice: React.FC<NgoDiscountNoticeProps> = ({ onApplyDiscount }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 font-geist">
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono-code text-white/80 font-semibold mb-2.5">
              <HeartHandshake className="w-3.5 h-3.5 text-white/90" />
              <span>SUBSIDIZED CONSERVATION ACCESS</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Environmental Impact Program
            </h3>

            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Verified NGOs, non-profit marine conservation bodies, and academic research institutions may receive a{' '}
              <strong className="text-white font-semibold">30–50% program discount</strong> through our Environmental Impact Grant allocation.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono-code text-white/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                <span>Eligibility verified in &lt; 48 hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                <span>Applicable to Annual & Multi-User Deployments</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onApplyDiscount}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-mono-code font-semibold text-black bg-white hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <span>Apply for NGO Program</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
