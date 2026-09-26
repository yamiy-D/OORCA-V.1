/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Waves, X, GripHorizontal } from 'lucide-react';
import { useDraggablePanel } from '../../hooks/useDraggablePanel';

export interface ConcentrationLegendProps {
  showOceanSlick?: boolean;
  onToggleOceanSlick?: () => void;
  showHighZone?: boolean;
  onToggleHighZone?: () => void;
  showMediumZone?: boolean;
  onToggleMediumZone?: () => void;
  showLowZone?: boolean;
  onToggleLowZone?: () => void;
  peakThicknessMicrons?: number;
  isOpen?: boolean;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
  initialPosition?: { x: number; y: number };
}

export function ConcentrationLegend({
  showOceanSlick = true,
  onToggleOceanSlick,
  showHighZone = true,
  onToggleHighZone,
  showMediumZone = true,
  onToggleMediumZone,
  showLowZone = true,
  onToggleLowZone,
  peakThicknessMicrons = 350,
  isOpen = true,
  onClose,
  zIndex = 30,
  onFocus,
  initialPosition = { x: 340, y: 16 },
}: ConcentrationLegendProps) {
  const {
    panelRef,
    position,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useDraggablePanel({
    initialPosition,
    onFocus,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={panelRef}
      id="oil-concentration-legend"
      onMouseDown={onFocus}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
      }}
      className={`absolute w-[94vw] max-w-[480px] sm:w-[480px] rounded-xl bg-black/90 border p-3 backdrop-blur-xl transition-shadow select-none font-geist text-white ${
        isDragging
          ? 'border-white/40 shadow-2xl ring-1 ring-white/30 cursor-grabbing'
          : 'border-white/15 shadow-2xl'
      }`}
    >
      {/* Draggable Header Row */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10 cursor-grab active:cursor-grabbing group/header"
        title="Click and drag to reposition panel across the map"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <GripHorizontal className="w-3.5 h-3.5 text-white/40 group-hover/header:text-white transition-colors" />
          <Flame className="w-3.5 h-3.5 text-white/80" />
          <span className="text-[10px] font-medium text-white/80 tracking-wider uppercase">
            Oil Spill Concentration
          </span>
        </div>

        <div className="flex items-center gap-1.5" data-no-drag="true">
          {/* Quick Toggle: Master Oil Slick Layer */}
          {onToggleOceanSlick && (
            <button
              type="button"
              onClick={onToggleOceanSlick}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                showOceanSlick
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
              }`}
              title={showOceanSlick ? 'Hide Oil Spill Layer' : 'Show Oil Spill Layer'}
            >
              <Waves className="w-2.5 h-2.5" />
              <span>Slick Layer</span>
            </button>
          )}

          <span className="text-[9px] font-mono-code text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
            &gt;{peakThicknessMicrons}μm
          </span>

          {onClose && (
            <button
              type="button"
              id="btn-close-concentration-panel"
              onClick={onClose}
              className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer ml-0.5"
              title="Close Oil Concentration Panel"
              aria-label="Close Oil Concentration Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Oil Concentration Gradient Bar */}
      <div className="w-full h-2 rounded-sm overflow-hidden border border-white/15 bg-gradient-to-r from-[#fb923c] via-[#ea580c] via-50%-[#dc2626] to-[#881337] relative shadow-inner">
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
          <div className="w-[1px] h-full bg-white"></div>
          <div className="w-[1px] h-full bg-white"></div>
          <div className="w-[1px] h-full bg-white"></div>
          <div className="w-[1px] h-full bg-white"></div>
          <div className="w-[1px] h-full bg-white"></div>
        </div>
      </div>

      {/* Thickness & Optical State Labels */}
      <div className="flex justify-between text-[9px] text-white/60 mt-1.5 font-mono-code px-0.5">
        <span>0.1 μm (Sheen)</span>
        <span>50 μm (Mousse)</span>
        <span>&gt;250 μm (Heavy Core)</span>
      </div>

      {/* 3 Physical Oil Spill Concentration Zones */}
      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[9.5px]">
        {/* Low Zone */}
        <button
          type="button"
          onClick={onToggleLowZone}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
            showLowZone
              ? 'bg-white/10 border-white/25 text-white shadow-sm'
              : 'bg-black/60 border-white/10 text-white/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-left">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <div className="font-medium text-white leading-tight">Low Zone</div>
              <div className="text-[8px] text-white/50 leading-tight">Light Sheen</div>
            </div>
          </div>
          <span className="text-[8px] font-mono-code px-1 py-0.5 rounded bg-black/60 text-white/70 border border-white/10">
            {showLowZone ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Medium Zone */}
        <button
          type="button"
          onClick={onToggleMediumZone}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
            showMediumZone
              ? 'bg-white/10 border-white/25 text-white shadow-sm'
              : 'bg-black/60 border-white/10 text-white/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-left">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <div>
              <div className="font-medium text-white leading-tight">Medium Zone</div>
              <div className="text-[8px] text-white/50 leading-tight">Emulsion</div>
            </div>
          </div>
          <span className="text-[8px] font-mono-code px-1 py-0.5 rounded bg-black/60 text-white/70 border border-white/10">
            {showMediumZone ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* High Zone */}
        <button
          type="button"
          onClick={onToggleHighZone}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
            showHighZone
              ? 'bg-white/10 border-white/25 text-white shadow-sm'
              : 'bg-black/60 border-white/10 text-white/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-left">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="font-medium text-white leading-tight">High Zone</div>
              <div className="text-[8px] text-white/50 leading-tight">Core Layer</div>
            </div>
          </div>
          <span className="text-[8px] font-mono-code px-1 py-0.5 rounded bg-black/60 text-white/70 border border-white/10">
            {showHighZone ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </div>
  );
}
