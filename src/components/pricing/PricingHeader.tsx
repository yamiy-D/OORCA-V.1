/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { OorcaBrandLogo } from '../brand/OorcaBrandLogo';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PricingHeaderProps {
  onOpenConsultation?: () => void;
}

export const PricingHeader: React.FC<PricingHeaderProps> = ({ onOpenConsultation }) => {
  return (
    <header 
      id="oorca-pricing-header"
      className="sticky top-0 z-40 w-full h-14 sm:h-16 bg-black/90 border-b border-white/10 px-6 md:px-12 flex items-center justify-between backdrop-blur-xl select-none font-geist text-white"
    >
      {/* Left: OORCA Brand & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <OorcaBrandLogo size="sm" asLink />
        
        <div className="h-5 w-[1px] bg-white/10 hidden xs:block" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
              OORCA
            </span>
            <span className="hidden sm:inline-block text-white/30 font-mono-code text-xs">/</span>
            <span className="text-xs sm:text-sm font-medium text-white/70 font-mono-code tracking-wide">
              Commercial Intelligence
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] text-white/40 font-mono-code leading-none mt-0.5">
            Marine Environmental Intelligence & Liability Platform
          </span>
        </div>
      </div>

      {/* Right: Quick Links & Contact CTA */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/simulation"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>Simulation</span>
        </Link>
        <Link
          to="/alerts"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>Alerts</span>
        </Link>

        {onOpenConsultation && (
          <button
            onClick={onOpenConsultation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-code font-semibold text-black bg-white hover:scale-105 transition-transform shadow-md cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consultation</span>
          </button>
        )}
      </div>
    </header>
  );
};
