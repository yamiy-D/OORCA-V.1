/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Wind, Waves, Plus, Minus, Check, Ship, Shield, Sparkles, Fish } from 'lucide-react';
import { TILE_LAYERS } from '../../services/mapService';

interface MapControlsProps {
  currentLayerId: string;
  onChangeLayer: (layerId: string) => void;
  showWind: boolean;
  onToggleWind: () => void;
  showWaves: boolean;
  onToggleWaves: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFocusShip?: () => void;
  showBooms?: boolean;
  onToggleBooms?: () => void;
  showLiveParticles?: boolean;
  onToggleLiveParticles?: () => void;
  // STEP 1: GFW Apparent Fishing Effort Overlay Props
  showFishingEffort?: boolean;
  onToggleFishingEffort?: () => void;
}

export function MapControls({
  currentLayerId,
  onChangeLayer,
  showWind,
  onToggleWind,
  showWaves,
  onToggleWaves,
  onZoomIn,
  onZoomOut,
  onFocusShip,
  showBooms = true,
  onToggleBooms,
  showLiveParticles = true,
  onToggleLiveParticles,
  showFishingEffort = false,
  onToggleFishingEffort,
}: MapControlsProps) {
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);

  return (
    <div 
      id="map-tool-controls"
      className="absolute top-4 right-4 z-20 flex flex-col gap-2 select-none font-geist text-white"
    >
      {/* Layers Button */}
      <div className="relative">
        <button
          id="btn-map-layers"
          onClick={() => setLayersMenuOpen(!layersMenuOpen)}
          className={`w-9 h-9 rounded-lg bg-black/90 border flex items-center justify-center text-white/80 hover:text-white shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
            layersMenuOpen ? 'border-white text-white bg-white/10' : 'border-white/15 hover:border-white/30'
          }`}
          title="Map Layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        {layersMenuOpen && (
          <div className="absolute right-11 top-0 w-44 rounded-lg bg-black border border-white/15 p-1.5 shadow-2xl backdrop-blur-2xl text-xs z-30">
            <div className="text-[10px] text-white/40 font-medium px-2 py-1 uppercase tracking-wider border-b border-white/10 mb-1">
              Tile Layers
            </div>
            {Object.values(TILE_LAYERS).map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  onChangeLayer(layer.id);
                  setLayersMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer ${
                  currentLayerId === layer.id 
                    ? 'bg-white text-black font-semibold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{layer.name}</span>
                {currentLayerId === layer.id && <Check className="w-3.5 h-3.5 text-black" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wind Toggle Button */}
      <button
        id="btn-map-toggle-wind"
        onClick={onToggleWind}
        className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
          showWind
            ? 'bg-white text-black border-white font-semibold'
            : 'bg-black/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
        }`}
        title="Toggle Wind Vectors"
      >
        <Wind className="w-3.5 h-3.5" />
        <span className="text-[9px] font-mono-code">Wind</span>
      </button>

      {/* Waves Toggle Button */}
      <button
        id="btn-map-toggle-waves"
        onClick={onToggleWaves}
        className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
          showWaves
            ? 'bg-white text-black border-white font-semibold'
            : 'bg-black/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
        }`}
        title="Toggle Ocean Waves Streamlines"
      >
        <Waves className="w-3.5 h-3.5" />
        <span className="text-[9px] font-mono-code">Waves</span>
      </button>

      {/* STEP 2: Apparent Fishing Effort (GFW) Toggle Button */}
      {onToggleFishingEffort && (
        <button
          id="btn-map-toggle-fishing-effort"
          onClick={onToggleFishingEffort}
          className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
            showFishingEffort
              ? 'bg-cyan-400 text-black border-cyan-400 font-semibold shadow-[0_0_15px_rgba(34,211,238,0.55)]'
              : 'bg-black/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
          }`}
          title="Toggle Global Fishing Watch (GFW) Apparent Fishing Effort (AFE)"
        >
          <Fish className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono-code">Effort</span>
        </button>
      )}

      {/* Focus Ship & Ruptured Hull */}
      {onFocusShip && (
        <button
          id="btn-map-focus-ship"
          onClick={onFocusShip}
          className="w-9 h-11 rounded-lg bg-black/90 border border-white/15 hover:border-white/35 text-white/70 hover:text-white flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer hover:bg-white/5"
          title="Zoom to Ship Location"
        >
          <Ship className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono-code">Ship</span>
        </button>
      )}

      {/* Containment Booms Barrier Toggle */}
      {onToggleBooms && (
        <button
          id="btn-map-toggle-booms"
          onClick={onToggleBooms}
          className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
            showBooms
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-black/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
          }`}
          title="Toggle Emergency Containment Booms"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono-code">Booms</span>
        </button>
      )}

      {/* Live Drifting Lagrangian Oil Flow Particles Toggle */}
      {onToggleLiveParticles && (
        <button
          id="btn-map-toggle-particles"
          onClick={onToggleLiveParticles}
          className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-xl transition-all cursor-pointer ${
            showLiveParticles
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-black/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
          }`}
          title="Toggle Live Drifting Oil Droplet Particles"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono-code">Flow</span>
        </button>
      )}

      {/* Zoom In & Out */}
      <div className="flex flex-col rounded-lg bg-black/90 border border-white/15 overflow-hidden shadow-2xl backdrop-blur-xl">
        <button
          id="btn-map-zoom-in"
          onClick={onZoomIn}
          className="w-9 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="btn-map-zoom-out"
          onClick={onZoomOut}
          className="w-9 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
