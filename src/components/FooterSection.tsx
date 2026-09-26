import React from 'react';
import { OorcaBrandLogo } from './brand/OorcaBrandLogo';
import { CheckCircle2 } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative w-full bg-black text-white/60 font-geist py-16 px-6 md:px-12 lg:px-16 border-t border-white/10">
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <OorcaBrandLogo size="sm" asLink />
              <span className="text-xl font-semibold tracking-tight text-white">
                OORCA
              </span>
            </div>

            <p className="text-xs font-mono-code text-white/70">
              Marine Oil Spill Detection & Suspect Vessel Attribution Platform
            </p>

            <p className="text-sm text-white/50 max-w-md leading-relaxed font-normal">
              Automated detection of marine oil slicks using remote sensing satellite data, hydrodynamic drift modeling, and suspect-vessel attribution based on spatio-temporal correlation.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono-code text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Satellite & MetOcean Telemetry Live</span>
            </div>
          </div>

          {/* Section Direct Anchors */}
          <div className="md:col-span-3 space-y-3 text-xs font-mono-code">
            <div className="text-white font-medium uppercase tracking-wider mb-2">
              Intelligence Layers
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#what-is-oorca" className="hover:text-white transition-colors text-white/50">
                  Overview & Pipeline Flow
                </a>
              </li>
              <li>
                <a href="#core-capabilities" className="hover:text-white transition-colors text-white/50">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors text-white/50">
                  Detection & Attribution Pipeline
                </a>
              </li>
              <li>
                <a href="#environmental-impact" className="hover:text-white transition-colors text-white/50">
                  Ecological Impact Analysis
                </a>
              </li>
              <li>
                <a href="#technology-behind" className="hover:text-white transition-colors text-white/50">
                  Sensor & Model Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Regulatory Standards */}
          <div className="md:col-span-3 space-y-3 text-xs font-mono-code">
            <div className="text-white font-medium uppercase tracking-wider mb-2">
              Technical Standards & Feeds
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                <span>Remote Sensing SAR & EO Constellations</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                <span>Historic AIS Spatio-Temporal Filtering</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                <span>Metocean Wind & Ocean Currents</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                <span>Lagrangian Forward & Backward Drift</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                <span>Multi-Factor Suspect Vessel Ranking</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-white/40">
          <div>
            © {new Date().getFullYear()} OORCA Maritime Environmental Intelligence. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Spatio-Temporal Attribution Scores</span>
            <span>·</span>
            <span>WGS 84 Dynamic Datum</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
