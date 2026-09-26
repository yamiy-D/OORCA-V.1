/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Target, 
  Droplets, 
  HelpCircle, 
  ShieldCheck, 
  ExternalLink
} from 'lucide-react';
import { Coordinates, SpillCharacteristics } from '../../types/alertTypes';

interface SpillLocationAndCharacteristicsProps {
  location: Coordinates;
  characteristics: SpillCharacteristics;
  onFocusLocation: () => void;
  sourceAgency?: string;
  officialUrl?: string;
  externalIncidentId?: string;
  threatCommodity?: string;
}

export function SpillLocationAndCharacteristics({
  location,
  characteristics,
  onFocusLocation,
  sourceAgency,
  officialUrl,
  externalIncidentId,
}: SpillLocationAndCharacteristicsProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${location.formattedLat}, ${location.formattedLon}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 font-geist text-white">
      {/* 4. OIL SPILL LOCATION (5 Cols) */}
      <section 
        id="oil-spill-location"
        className="lg:col-span-5 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
                <MapPin className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono-code text-white uppercase tracking-wider">
                  📍 OIL SPILL LOCATION
                </h2>
                <p className="text-[11px] text-white/50 font-mono-code">
                  Centroid Coordinates
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCoords}
              className="text-[10px] font-mono-code px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>

          {/* Essential Coordinate Display */}
          <div className="bg-white/[0.02] border border-white/15 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono-code text-white/40 uppercase block mb-1">
                  Latitude
                </span>
                <span className="text-base sm:text-lg font-bold font-mono-code text-white tracking-wide">
                  {location.formattedLat}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono-code text-white/40 uppercase block mb-1">
                  Longitude
                </span>
                <span className="text-base sm:text-lg font-bold font-mono-code text-white tracking-wide">
                  {location.formattedLon}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono-code flex items-center justify-between text-white/60">
              <span>Maritime Zone:</span>
              <span className="text-white font-medium truncate max-w-[200px]">
                {location.seaRegion}
              </span>
            </div>

            {/* Official Source Provenance Indicator */}
            {sourceAgency && (
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] font-mono-code flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[170px]">{sourceAgency}</span>
                </div>
                {officialUrl && (
                  <a
                    href={officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>{externalIncidentId || 'NOAA Report'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Focus on Spill Location Button */}
        <button
          id="btn-focus-spill-location"
          onClick={onFocusLocation}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black font-semibold text-xs font-mono-code flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg group"
        >
          <Target className="w-4 h-4 text-white/70 group-hover:text-black transition-colors" />
          <span>Focus on Spill Location</span>
        </button>
      </section>

      {/* 5. SPILL CHARACTERISTICS (7 Cols) */}
      <section 
        id="spill-characteristics"
        className="lg:col-span-7 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
                <Droplets className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono-code text-white uppercase tracking-wider">
                  🛢 SPILL CHARACTERISTICS
                </h2>
                <p className="text-[11px] text-white/50 font-mono-code">
                  Morphological & Physical Analysis
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-amber-500/10 border border-amber-500/30 text-amber-300">
              *Model-Derived Estimates
            </span>
          </div>

          {/* Properties Table / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-code mb-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Estimated Area</span>
              <span className="text-base font-bold text-white">
                {characteristics.estimatedAreaKm2} km²
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Length</span>
              <span className="text-base font-bold text-white">
                {characteristics.lengthKm} km
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Width</span>
              <span className="text-base font-bold text-white">
                {characteristics.widthKm} km
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Estimated Age</span>
              <span className="text-base font-bold text-amber-300">
                {characteristics.estimatedAgeHours}
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Confidence</span>
              <span className="text-base font-bold text-emerald-400">
                {characteristics.confidencePercentage}% Match
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-white/50 block mb-1">Est. Volume</span>
              <span className="text-base font-bold text-white/90">
                {characteristics.estimatedVolumeM3 || '48.5'} m³
              </span>
            </div>
          </div>

          {/* Plume Shape Details */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 mb-3 text-xs font-mono-code flex items-start gap-2">
            <span className="text-white font-semibold shrink-0">Spill Shape:</span>
            <span className="text-white/70 leading-relaxed">
              {characteristics.shapeDescription}
            </span>
          </div>
        </div>

        {/* Clear Model Estimation Disclaimer */}
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-[11px] text-white/50 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-tight">
            <strong className="text-white/80">Advisory Note:</strong> Physical characteristics are derived from satellite SAR backscatter inversion and hydrodynamic drift models. Values are scientific estimates and require ground-truth sampling for statutory calibration.
          </p>
        </div>
      </section>
    </div>
  );
}
