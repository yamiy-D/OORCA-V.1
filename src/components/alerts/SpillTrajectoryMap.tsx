/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wind, 
  Waves, 
  Thermometer, 
  Navigation
} from 'lucide-react';
import { MetoceanData, TrajectoryPoint } from '../../types/alertTypes';

interface SpillTrajectoryMapProps {
  trajectory: {
    origin: TrajectoryPoint;
    current: TrajectoryPoint;
    predictions: TrajectoryPoint[];
  };
  metocean: MetoceanData;
  isFocused?: boolean;
}

export function SpillTrajectoryMap({
  trajectory,
  metocean,
}: SpillTrajectoryMapProps) {
  const [selectedProjection, setSelectedProjection] = useState<'ALL' | '+6H' | '+12H' | '+24H'>('ALL');
  const [activeHoverPoint, setActiveHoverPoint] = useState<string | null>(null);

  const { origin, current, predictions } = trajectory;
  const p6 = predictions.find((p) => p.label === '+6 Hours') || predictions[0];
  const p12 = predictions.find((p) => p.label === '+12 Hours') || predictions[1];
  const p24 = predictions.find((p) => p.label === '+24 Hours') || predictions[2];

  return (
    <section 
      id="spill-trajectory-movement"
      className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden shadow-2xl mb-6 font-geist text-white"
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-mono-code text-white uppercase tracking-wide">
                🌊 SPILL TRAJECTORY & MOVEMENT
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-white/5 border border-white/10 text-white/80">
                LAGRANGIAN DRIFT MODEL
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono-code mt-0.5">
              Directional Path: <strong className="text-amber-300">Estimated Origin</strong> → <strong className="text-white">Current Spill</strong> → <strong className="text-neutral-300">Future Prediction</strong>
            </p>
          </div>
        </div>

        {/* Forecast Horizon Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 p-1 rounded-xl text-xs font-mono-code self-start md:self-auto">
          {(['ALL', '+6H', '+12H', '+24H'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedProjection(tab)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedProjection === tab
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'ALL' ? 'Full Track' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Environmental Field Conditions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-white/[0.02] border-b border-white/10 text-xs font-mono-code">
        <div className="flex items-center gap-2">
          <Navigation 
            className="w-4 h-4 text-white/80 shrink-0" 
            style={{ transform: `rotate(${metocean.currentHeadingDeg}deg)` }} 
          />
          <div>
            <span className="text-[10px] text-white/40 block">SURFACE CURRENT</span>
            <span className="text-white font-bold">
              {metocean.surfaceCurrentKts} kts @ {metocean.currentHeadingDeg}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind 
            className="w-4 h-4 text-white/80 shrink-0" 
            style={{ transform: `rotate(${metocean.windDirectionDeg}deg)` }} 
          />
          <div>
            <span className="text-[10px] text-white/40 block">WIND VECTOR</span>
            <span className="text-white font-bold">
              {metocean.windSpeedKts} kts @ {metocean.windDirectionDeg}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-white/80 shrink-0" />
          <div>
            <span className="text-[10px] text-white/40 block">SIGNIFICANT WAVE</span>
            <span className="text-white font-bold">
              {metocean.waveHeightMeters}m (Beaufort {metocean.seaStateBeaufort})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-white/80 shrink-0" />
          <div>
            <span className="text-[10px] text-white/40 block">SEA SURFACE TEMP</span>
            <span className="text-white font-bold">
              {metocean.waterTemperatureC}°C
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Vector Map Canvas Area */}
      <div className="relative w-full h-[420px] sm:h-[480px] bg-black overflow-hidden select-none">
        {/* Tactical Nautical Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Vector SVG Trajectory Graphics */}
        <svg 
          className="w-full h-full absolute inset-0"
          viewBox="0 0 900 480"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="backwardDriftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
            </linearGradient>

            <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#f59e0b" />
            </marker>

            <marker id="arrow-white" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#ffffff" />
            </marker>

            <marker id="arrow-neutral" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#a3a3a3" />
            </marker>
          </defs>

          {/* 1. BACKWARD VECTOR: Estimated Origin -> Current Spill */}
          <g id="origin-vector-group">
            <line
              x1="170"
              y1="130"
              x2="410"
              y2="225"
              stroke="url(#backwardDriftGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <circle cx="290" cy="180" r="3" fill="#f59e0b" className="animate-ping" />
          </g>

          {/* 2. FORWARD VECTOR: Current Spill -> +6H -> +12H -> +24H */}
          <g id="forward-vector-group">
            {(selectedProjection === 'ALL' || selectedProjection === '+6H') && (
              <line
                x1="430"
                y1="235"
                x2="570"
                y2="285"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
            )}

            {(selectedProjection === 'ALL' || selectedProjection === '+12H') && (
              <line
                x1="580"
                y1="290"
                x2="700"
                y2="335"
                stroke="#d4d4d4"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#arrow-neutral)"
              />
            )}

            {(selectedProjection === 'ALL' || selectedProjection === '+24H') && (
              <line
                x1="710"
                y1="340"
                x2="810"
                y2="395"
                stroke="#a3a3a3"
                strokeWidth="2"
                strokeDasharray="4 3"
                markerEnd="url(#arrow-neutral)"
              />
            )}

            {/* Uncertainty Dispersion Cone */}
            {(selectedProjection === 'ALL' || selectedProjection === '+24H') && (
              <path
                d="M 420 230 L 800 350 A 60 40 0 0 1 840 430 L 420 230 Z"
                fill="rgba(255, 255, 255, 0.04)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
          </g>

          {/* POINT A: ESTIMATED ORIGIN */}
          <g 
            id="point-origin"
            transform="translate(170, 130)"
            className="cursor-pointer"
            onMouseEnter={() => setActiveHoverPoint('ORIGIN')}
            onMouseLeave={() => setActiveHoverPoint(null)}
          >
            <circle r="36" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
            <circle r="8" fill="#f59e0b" />
            <circle r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />

            <rect x="-80" y="-45" width="160" height="24" rx="6" fill="#000000" stroke="#f59e0b" strokeWidth="1.2" />
            <text x="0" y="-30" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ORIGIN: {origin.coordinates.formattedLat}
            </text>
            <text x="0" y="24" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {origin.timestampUtc}
            </text>
          </g>

          {/* POINT B: CURRENT SPILL POSITION */}
          <g 
            id="point-current"
            transform="translate(420, 230)"
            className="cursor-pointer"
            onMouseEnter={() => setActiveHoverPoint('CURRENT')}
            onMouseLeave={() => setActiveHoverPoint(null)}
          >
            <ellipse rx="32" ry="14" fill="#000000" stroke="#ffffff" strokeWidth="2" transform="rotate(-15)" />
            <circle r="4" fill="#ef4444" />
            <circle r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin" />

            <rect x="-90" y="-48" width="180" height="26" rx="6" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="-32" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              CURRENT SPILL CENTROID
            </text>
            <text x="0" y="28" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {current.coordinates.formattedLat}, {current.coordinates.formattedLon}
            </text>
          </g>

          {/* POINT C: PREDICTED +6H */}
          {(selectedProjection === 'ALL' || selectedProjection === '+6H') && (
            <g 
              id="point-p6"
              transform="translate(580, 290)"
              className="cursor-pointer"
              onMouseEnter={() => setActiveHoverPoint('+6H')}
              onMouseLeave={() => setActiveHoverPoint(null)}
            >
              <circle r="22" fill="rgba(255, 255, 255, 0.08)" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
              <circle r="6" fill="#ffffff" />
              <rect x="-40" y="-30" width="80" height="18" rx="4" fill="#000000" stroke="#ffffff" strokeWidth="1" />
              <text x="0" y="-18" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                +6 HOURS
              </text>
              <text x="0" y="22" fill="#a3a3a3" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {p6.coordinates.formattedLat}
              </text>
            </g>
          )}

          {/* POINT D: PREDICTED +12H */}
          {(selectedProjection === 'ALL' || selectedProjection === '+12H') && (
            <g 
              id="point-p12"
              transform="translate(710, 340)"
              className="cursor-pointer"
              onMouseEnter={() => setActiveHoverPoint('+12H')}
              onMouseLeave={() => setActiveHoverPoint(null)}
            >
              <circle r="28" fill="rgba(255, 255, 255, 0.06)" stroke="#d4d4d4" strokeWidth="1" strokeDasharray="3 3" />
              <circle r="5" fill="#d4d4d4" />
              <rect x="-42" y="-30" width="84" height="18" rx="4" fill="#000000" stroke="#d4d4d4" strokeWidth="1" />
              <text x="0" y="-18" fill="#d4d4d4" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                +12 HOURS
              </text>
              <text x="0" y="24" fill="#a3a3a3" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {p12.coordinates.formattedLat}
              </text>
            </g>
          )}

          {/* POINT E: PREDICTED +24H */}
          {(selectedProjection === 'ALL' || selectedProjection === '+24H') && (
            <g 
              id="point-p24"
              transform="translate(820, 400)"
              className="cursor-pointer"
              onMouseEnter={() => setActiveHoverPoint('+24H')}
              onMouseLeave={() => setActiveHoverPoint(null)}
            >
              <circle r="36" fill="rgba(255, 255, 255, 0.04)" stroke="#a3a3a3" strokeWidth="1" strokeDasharray="3 3" />
              <circle r="5" fill="#a3a3a3" />
              <rect x="-42" y="-30" width="84" height="18" rx="4" fill="#000000" stroke="#a3a3a3" strokeWidth="1" />
              <text x="0" y="-18" fill="#a3a3a3" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                +24 HOURS
              </text>
              <text x="0" y="26" fill="#a3a3a3" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {p24.coordinates.formattedLat}
              </text>
            </g>
          )}
        </svg>

        {/* Legend Box */}
        <div className="absolute top-3 right-3 bg-black/90 border border-white/15 rounded-xl p-3 text-[11px] font-mono-code shadow-2xl backdrop-blur-md max-w-xs">
          <div className="text-white/50 font-bold mb-2 uppercase text-[10px] tracking-wider border-b border-white/10 pb-1">
            TRAJECTORY LEGEND
          </div>
          <div className="space-y-1.5 text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span><strong>Estimated Origin</strong> (Backward Drift)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white border border-red-500" />
              <span><strong>Current Position</strong> (SAR Centroid)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neutral-400" />
              <span><strong>Predicted Movement</strong> (+6h, +12h, +24h)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-white/50 text-[10px]">
              <span className="w-4 h-0.5 border-t border-dashed border-amber-400" />
              <span>Lagrangian Vector (-8.8 Hours)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Hover Tooltip */}
        {activeHoverPoint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/95 border border-white/20 rounded-xl px-4 py-2 text-xs font-mono-code text-white shadow-2xl">
            Selected Waypoint: <strong className="text-white">{activeHoverPoint}</strong> • Hydrodynamic advection rate: {metocean.surfaceCurrentKts} knots
          </div>
        )}
      </div>

      {/* Trajectory Table Breakdown */}
      <div className="p-4 bg-black border-t border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-code">
          {/* Card 1: Origin */}
          <div className="bg-white/[0.02] border border-amber-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
              <span>ESTIMATED ORIGIN</span>
              <span className="text-[10px] text-white/40">T - 8.8h</span>
            </div>
            <div className="text-white">{origin.coordinates.formattedLat}, {origin.coordinates.formattedLon}</div>
            <div className="text-[11px] text-white/50 mt-1">Dispersion Radius: {origin.dispersionRadiusKm} km</div>
          </div>

          {/* Card 2: Current */}
          <div className="bg-white/[0.02] border border-white/20 rounded-xl p-3">
            <div className="flex items-center justify-between text-white font-bold mb-1">
              <span>CURRENT OBSERVATION</span>
              <span className="text-[10px] text-white/40">Observed</span>
            </div>
            <div className="text-white">{current.coordinates.formattedLat}, {current.coordinates.formattedLon}</div>
            <div className="text-[11px] text-white/50 mt-1">Dispersion Radius: {current.dispersionRadiusKm} km</div>
          </div>

          {/* Card 3: +24H Prediction */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between text-neutral-300 font-bold mb-1">
              <span>PREDICTED +24H</span>
              <span className="text-[10px] text-white/40">Forecast</span>
            </div>
            <div className="text-white">{p24.coordinates.formattedLat}, {p24.coordinates.formattedLon}</div>
            <div className="text-[11px] text-white/50 mt-1">Dispersion Radius: {p24.dispersionRadiusKm} km</div>
          </div>
        </div>
      </div>
    </section>
  );
}
