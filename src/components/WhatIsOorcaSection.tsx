import React from 'react';
import { ArrowRight } from 'lucide-react';

export const WhatIsOorcaSection: React.FC = () => {
  return (
    <section 
      id="what-is-oorca"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
            <span>02 / Platform Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
            Turning ocean data into <br />
            <span className="text-white/60">environmental accountability.</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            OORCA bridges the gap between undetected offshore pollution and verifiable legal accountability. 
            By fusing orbital radar sensors, physical ocean simulations, and maritime fleet kinematics, 
            OORCA transforms disjointed oceanic signals into irrefutable evidence.
          </p>
        </div>

        {/* 4 Core Pillars: What it is / Problem / Technology / Why Combining Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm">
            <div>
              <div className="text-sm font-mono-code text-white/40 mb-5">
                01.
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">What OORCA Is</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                An enterprise-grade marine geospatial intelligence platform designed for coastguards, environmental ministries, maritime regulators, and international legal authorities.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40 font-mono-code">
              Autonomous Deep-Ocean Sentry
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm">
            <div>
              <div className="text-sm font-mono-code text-rose-400/70 mb-5">
                02.
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">The Problem Solved</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Over 80% of marine oil contamination results from intentional nighttime bilge washing. Polluting vessels exploit offshore darkness and lack of continuous tracking to evade prosecution.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-rose-400/70 font-mono-code">
              Eliminating Evidentiary Gaps
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm">
            <div>
              <div className="text-sm font-mono-code text-emerald-400/70 mb-5">
                03.
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Technology Fusion</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Combines high-resolution radar satellites with AI vision classifiers, multi-source AIS fleet tracking, and reverse hydrodynamic drift physics models to reconstruct pollution events.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-400/70 font-mono-code">
              Physics & Satellite Fusion
            </div>
          </div>

          <div className="p-7 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm">
            <div>
              <div className="text-sm font-mono-code text-amber-400/70 mb-5">
                04.
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Why Fusion Matters</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                A satellite image alone shows only a slick; an AIS trace alone shows only a ship. Only by synthesizing both through MetOcean ocean drift can legal liability and responsibility be proven.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-amber-400/70 font-mono-code">
              From Detection to Legal Proof
            </div>
          </div>

        </div>

        {/* Navigation CTA */}
        <div className="flex items-center justify-start">
          <a
            href="#technology-behind"
            className="rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 px-5 py-2.5 text-xs font-medium transition-all inline-flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:border-white/30"
          >
            <span>Explore Interconnected Sensor Network</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
