/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, Clock, Sliders, X, GripHorizontal } from 'lucide-react';
import { SimulationControlsState } from '../../types/simulation';
import { useDraggablePanel } from '../../hooks/useDraggablePanel';

interface SimulationControlsProps {
  controlsState: SimulationControlsState;
  onTogglePlay: () => void;
  onHourChange: (hour: number) => void;
  onSelectTimeOption: (option: string) => void;
  onOpenParameters?: () => void;
  seepageRate?: number;
  initialAmount?: number;
  onChangePlaybackSpeed?: (speed: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
  initialPosition?: { x: number; y: number };
}

const TIME_STEPS = [12, 24, 36, 48, 60, 72];

export function SimulationControls({
  controlsState,
  onTogglePlay,
  onHourChange,
  onSelectTimeOption,
  onOpenParameters,
  initialAmount = 100,
  onChangePlaybackSpeed,
  isOpen = true,
  onClose,
  zIndex = 30,
  onFocus,
  initialPosition = { x: 16, y: 16 },
}: SimulationControlsProps) {
  const { currentHour, totalHours, isPlaying, playbackSpeed, currentTimeFormatted } = controlsState;

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
      id="simulation-controls-floating-panel"
      onMouseDown={onFocus}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
      }}
      className={`absolute w-72 sm:w-80 rounded-xl bg-black/90 border p-3.5 backdrop-blur-xl transition-shadow select-none font-geist text-white ${
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
          <Clock className="w-3.5 h-3.5 text-white/80" />
          <span className="text-[10px] font-medium text-white/70 tracking-wider uppercase">
            Simulation Timeline
          </span>
        </div>

        <div className="flex items-center gap-1.5" data-no-drag="true">
          {onOpenParameters && (
            <button
              id="btn-timeline-edit-params"
              onClick={onOpenParameters}
              className="px-2 py-0.5 rounded text-[10px] font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center gap-1"
              title="Open Simulation Parameters"
            >
              <Sliders className="w-3 h-3 text-white/70" />
              <span>Params</span>
            </button>
          )}

          <span className="text-xs font-semibold font-mono-code text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
            +{currentHour}h
          </span>

          {onClose && (
            <button
              type="button"
              id="btn-close-timeline-panel"
              onClick={onClose}
              className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer ml-0.5"
              title="Close Timeline Panel"
              aria-label="Close Timeline Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Play/Pause & Interactive Scrubber */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <button
          id="btn-simulation-play"
          onClick={onTogglePlay}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-white text-black font-semibold shadow-md' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          }`}
          title={isPlaying ? 'Pause Simulation Timeline' : 'Play 72h Forward Projection'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Timeline Slider with Notches */}
        <div className="flex-1 relative flex flex-col justify-center">
          <input
            type="range"
            min="0"
            max={totalHours}
            step="1"
            value={currentHour}
            onChange={(e) => {
              const val = Number(e.target.value);
              onHourChange(val);
              onSelectTimeOption(`+ ${val}h`);
            }}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
          />
          <div className="flex justify-between text-[8px] font-mono-code text-white/40 mt-1 px-0.5">
            <span>0h</span>
            <span>24h</span>
            <span>48h</span>
            <span>72h</span>
          </div>
        </div>
      </div>

      {/* Quick Jump Buttons (+12h, +24h, +36h, +48h, +60h, +72h) */}
      <div className="grid grid-cols-6 gap-1 mb-2.5">
        {TIME_STEPS.map((step) => {
          const isActive = currentHour === step;
          return (
            <button
              key={step}
              onClick={() => {
                onHourChange(step);
                onSelectTimeOption(`+ ${step}h`);
              }}
              className={`py-0.5 text-[10px] font-mono-code rounded transition-all cursor-pointer text-center ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              +{step}h
            </button>
          );
        })}
      </div>

      {/* Spill Volume Display */}
      <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between text-[10px] font-mono-code">
        <div className="flex items-center gap-1.5 text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
          <span>TOTAL SPILL RELEASE</span>
        </div>
        <div>
          <span className="text-white font-medium bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
            {initialAmount.toLocaleString()} Tonnes
          </span>
        </div>
      </div>

      {/* Timestamp & Playback Speed Controls */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code text-white/60">
        <span className="text-white/80 truncate">{currentTimeFormatted}</span>
        
        <div className="flex items-center gap-2">
          {onChangePlaybackSpeed && (
            <div className="flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded border border-white/10">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangePlaybackSpeed(spd)}
                  className={`px-1 text-[8.5px] rounded transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}
          <span className="text-white/80 font-medium shrink-0">
            {isPlaying ? '● SIMULATING' : 'PAUSED'}
          </span>
        </div>
      </div>
    </div>
  );
}
