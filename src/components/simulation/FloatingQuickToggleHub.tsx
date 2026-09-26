/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SlidersHorizontal, 
  Clock, 
  Flame, 
  Cloud, 
  Activity, 
  Maximize2, 
  Minimize2,
  Layers,
  Fish,
  Ship
} from 'lucide-react';

interface FloatingQuickToggleHubProps {
  isInputPanelOpen: boolean;
  onToggleInputPanel: () => void;
  isTimelineOpen: boolean;
  onToggleTimeline: () => void;
  isConcentrationOpen: boolean;
  onToggleConcentration: () => void;
  isWeatherOpen: boolean;
  onToggleWeather: () => void;
  isDockOpen: boolean;
  onToggleDock: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  // STEP 1: GFW Apparent Fishing Effort & Vessel Identity/Risk Props
  showFishingEffort?: boolean;
  onToggleFishingEffort?: () => void;
  onOpenGfwModal?: () => void;
}

export function FloatingQuickToggleHub({
  isInputPanelOpen,
  onToggleInputPanel,
  isTimelineOpen,
  onToggleTimeline,
  isConcentrationOpen,
  onToggleConcentration,
  isWeatherOpen,
  onToggleWeather,
  isDockOpen,
  onToggleDock,
  onExpandAll,
  onCollapseAll,
  showFishingEffort = false,
  onToggleFishingEffort,
  onOpenGfwModal,
}: FloatingQuickToggleHubProps) {
  // STEP 2: Compute Whether Any or All Panels Are Currently Open
  const anyPanelOpen = isInputPanelOpen || isTimelineOpen || isConcentrationOpen || isWeatherOpen || isDockOpen || showFishingEffort;
  const allPanelsOpen = isInputPanelOpen && isTimelineOpen && isConcentrationOpen && isWeatherOpen && isDockOpen;

  return (
    <div 
      id="floating-quick-toggle-hub"
      className="absolute top-3 left-4 z-20 font-geist select-none pointer-events-auto"
    >
      {/* STEP 3: Main Floating Translucent Capsule Container */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/85 hover:bg-black/95 border border-white/20 hover:border-white/40 backdrop-blur-xl shadow-2xl transition-all">
        
        {/* Hub Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-code text-white/50 border-r border-white/10">
          <Layers className="w-3.5 h-3.5 text-white/70" />
          <span className="uppercase tracking-wider">Overlays</span>
        </div>

        {/* STEP 4: Toggle Button 1 - Parameters Drawer */}
        <button
          id="hub-btn-toggle-parameters"
          type="button"
          onClick={onToggleInputPanel}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isInputPanelOpen
              ? 'bg-white text-black shadow-md font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isInputPanelOpen ? "Close Parameters Drawer" : "Open Parameters Drawer"}
          aria-label="Toggle Parameters Drawer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="text-[11px]">Params</span>
          {isInputPanelOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        {/* STEP 5: Toggle Button 2 - Timeline Playback Controls */}
        <button
          id="hub-btn-toggle-timeline"
          type="button"
          onClick={onToggleTimeline}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isTimelineOpen
              ? 'bg-white text-black shadow-md font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isTimelineOpen ? "Close Timeline Controls" : "Open Timeline Controls"}
          aria-label="Toggle Timeline Controls"
        >
          <Clock className="w-3 h-3" />
          <span className="text-[11px]">Timeline</span>
          {isTimelineOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        {/* STEP 6: Toggle Button 3 - Concentration Gradient Legend */}
        <button
          id="hub-btn-toggle-legend"
          type="button"
          onClick={onToggleConcentration}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isConcentrationOpen
              ? 'bg-white text-black shadow-md font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isConcentrationOpen ? "Close Oil Concentration Legend" : "Open Oil Concentration Legend"}
          aria-label="Toggle Oil Concentration Legend"
        >
          <Flame className="w-3 h-3" />
          <span className="text-[11px]">Legend</span>
          {isConcentrationOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        {/* STEP 7: Toggle Button 4 - Live Weather Intelligence Monitor */}
        <button
          id="hub-btn-toggle-weather"
          type="button"
          onClick={onToggleWeather}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isWeatherOpen
              ? 'bg-emerald-400 text-black shadow-md font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isWeatherOpen ? "Close Weather Intelligence" : "Open Weather Intelligence"}
          aria-label="Toggle Weather Intelligence"
        >
          <Cloud className="w-3 h-3" />
          <span className="text-[11px]">Weather</span>
          {isWeatherOpen && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
        </button>

        {/* STEP 8: Toggle Button 5 - Operational Command Dock */}
        <button
          id="hub-btn-toggle-dock"
          type="button"
          onClick={onToggleDock}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isDockOpen
              ? 'bg-amber-400 text-black shadow-md font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isDockOpen ? "Collapse Operational Command Dock" : "Open Operational Command Dock"}
          aria-label="Toggle Operational Command Dock"
        >
          <Activity className="w-3 h-3" />
          <span className="text-[11px]">Operations</span>
          {isDockOpen && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
        </button>

        {/* STEP 9: Toggle Button 6 - GFW Apparent Fishing Effort Layer */}
        {onToggleFishingEffort && (
          <button
            id="hub-btn-toggle-fishing-effort"
            type="button"
            onClick={onToggleFishingEffort}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              showFishingEffort
                ? 'bg-cyan-400 text-black shadow-md font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Global Fishing Watch: Map Apparent Fishing Effort (AFE) grid heatmap"
            aria-label="Toggle Apparent Fishing Effort"
          >
            <Fish className="w-3 h-3" />
            <span className="text-[11px]">Fishing Effort</span>
            {showFishingEffort && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
          </button>
        )}

        {/* STEP 10: Action Button 7 - GFW Vessel Identity & Risk Assessment Modal */}
        {onOpenGfwModal && (
          <button
            id="hub-btn-open-gfw-vessel-risk"
            type="button"
            onClick={onOpenGfwModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer text-blue-300 hover:text-white hover:bg-blue-600/30 border border-blue-500/30"
            title="Open Global Fishing Watch Vessel Identity and Multi-Factor Risk Assessment"
            aria-label="GFW Vessel Identity and Risk Assessment"
          >
            <Ship className="w-3 h-3 text-blue-400" />
            <span className="text-[11px]">GFW Vessel Risk</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

        {/* STEP 11: Master Toggle Button - Collapse All / Expand All */}
        <button
          id="hub-btn-toggle-all"
          type="button"
          onClick={anyPanelOpen ? onCollapseAll : onExpandAll}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer text-[10px] font-mono-code"
          title={anyPanelOpen ? "Collapse all open panels and popups" : "Expand all panels and popups"}
        >
          {anyPanelOpen ? (
            <>
              <Minimize2 className="w-3 h-3" />
              <span className="hidden md:inline">Collapse All</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline text-emerald-300">Expand All</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
