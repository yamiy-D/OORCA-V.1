/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Save, 
  FileText, 
  Share2, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Flame,
  Cloud,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OorcaBrandLogo } from '../brand/OorcaBrandLogo';

// STEP 1: Header Props Definition with Weather & Dock Toggle Support
interface SimulationHeaderProps {
  onNewSimulation: () => void;
  onSaveSimulation: () => void;
  onExportReport: () => void;
  onShareSimulation: () => void;
  isSaved?: boolean;
  onToggleParameters: () => void;
  isParametersOpen: boolean;
  activeSpillSummary?: string;
  isTimelineOpen?: boolean;
  onToggleTimeline?: () => void;
  isConcentrationOpen?: boolean;
  onToggleConcentration?: () => void;
  isWeatherOpen?: boolean;
  onToggleWeather?: () => void;
  // STEP 2: Operations Command Dock Toggle Props
  isDockOpen?: boolean;
  onToggleDock?: () => void;
}

export function SimulationHeader({
  onNewSimulation,
  onSaveSimulation,
  onExportReport,
  onShareSimulation,
  isSaved = false,
  onToggleParameters,
  isParametersOpen,
  activeSpillSummary = '100t Crude',
  isTimelineOpen = false,
  onToggleTimeline,
  isConcentrationOpen = false,
  onToggleConcentration,
  isWeatherOpen = false,
  onToggleWeather,
  isDockOpen = false,
  onToggleDock,
}: SimulationHeaderProps) {
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    onShareSimulation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setShareDropdownOpen(false);
  };

  return (
    <header 
      id="simulation-page-header"
      className="h-14 bg-black/95 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none font-geist backdrop-blur-xl"
    >
      {/* LEFT: OORCA Logo + Vertical Divider + Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <OorcaBrandLogo size="sm" asLink />
          <Link to="/" className="text-base font-semibold tracking-tight text-white hover:text-white/80 transition-colors">
            OORCA
          </Link>
        </div>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-[1px] bg-white/15 mx-1" />

        {/* Page Title */}
        <h1 className="text-sm font-medium text-white/80">
          Oil Spill Simulator
        </h1>

        {/* Quick Parameters Access Button */}
        <button
          id="btn-header-toggle-params"
          onClick={onToggleParameters}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
            isParametersOpen
              ? 'bg-white text-black border-white shadow-md font-semibold'
              : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:border-white/25'
          }`}
          title={isParametersOpen ? "Close Input Parameters" : "Open Input Parameters Panel"}
        >
          <SlidersHorizontal className={`w-3.5 h-3.5 ${isParametersOpen ? 'text-black' : 'text-white/60'}`} />
          <span className="hidden sm:inline">Parameters</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
            isParametersOpen ? 'bg-black/10 text-black' : 'bg-white/10 text-white/70'
          }`}>
            {activeSpillSummary}
          </span>
        </button>
      </div>

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
        {/* STEP 2: Floating Controls Quick Access Cluster: Timeline, Oil Concentration & Weather */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10">
          {/* Timeline Icon Button */}
          <button
            id="btn-header-timeline"
            type="button"
            onClick={onToggleTimeline}
            className={`relative p-1.5 sm:px-2 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isTimelineOpen
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Simulation Timeline — Toggle draggable playback controls, time scrubber, and projection metrics"
            aria-label="Toggle Simulation Timeline"
          >
            <Clock className={`w-3.5 h-3.5 ${isTimelineOpen ? 'text-black' : 'text-white/70'}`} />
          </button>

          {/* Oil Spill Concentration Icon Button */}
          <button
            id="btn-header-concentration"
            type="button"
            onClick={onToggleConcentration}
            className={`relative p-1.5 sm:px-2 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isConcentrationOpen
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Oil Spill Concentration — Toggle draggable concentration gradient, peak thickness, and physical zone filters"
            aria-label="Toggle Oil Spill Concentration"
          >
            <Flame className={`w-3.5 h-3.5 ${isConcentrationOpen ? 'text-black fill-black/20' : 'text-white/70'}`} />
          </button>

          {/* Live Weather Intelligence Icon Button */}
          <button
            id="btn-header-weather"
            type="button"
            onClick={onToggleWeather}
            className={`relative p-1.5 sm:px-2 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isWeatherOpen
                ? 'bg-emerald-400 text-black shadow-md font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Live Weather Intelligence — Toggle real-time OpenWeather atmospheric monitor and 72h forecast strip"
            aria-label="Toggle Live Weather Intelligence"
          >
            <Cloud className={`w-3.5 h-3.5 ${isWeatherOpen ? 'text-black' : 'text-white/70'}`} />
          </button>

          {/* STEP 3: Operational Command Dock Toggle Button */}
          {onToggleDock && (
            <button
              id="btn-header-dock"
              type="button"
              onClick={onToggleDock}
              className={`relative p-1.5 sm:px-2 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isDockOpen
                  ? 'bg-amber-400 text-black shadow-md font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Operational Command Dock — Toggle bottom risk assessment, shoreline impact, and ecological table"
              aria-label="Toggle Operational Command Dock"
            >
              <Activity className={`w-3.5 h-3.5 ${isDockOpen ? 'text-black' : 'text-white/70'}`} />
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-white/15 mx-0.5 hidden xs:block" />

        {/* New Simulation */}
        <button
          id="btn-new-simulation"
          onClick={onNewSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Reset parameters to start a new simulation"
        >
          <PlusCircle className="w-3.5 h-3.5 text-white/70" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Save */}
        <button
          id="btn-save-simulation"
          onClick={onSaveSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Save simulation parameters"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-white/70" />
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </button>

        {/* Export Report */}
        <button
          id="btn-export-report"
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Export scientific simulation report"
        >
          <FileText className="w-3.5 h-3.5 text-white/70" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Share Dropdown */}
        <div className="relative">
          <button
            id="btn-share-simulation"
            onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-white/70" />
            <span className="hidden sm:inline">Share</span>
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>

          {shareDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-lg bg-black border border-white/15 shadow-2xl py-1 z-50 text-xs backdrop-blur-xl">
              <button
                onClick={handleShareClick}
                className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white flex items-center justify-between"
              >
                <span>{copied ? 'Link Copied!' : 'Copy Simulation Link'}</span>
                {copied && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                  setShareDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Copy Coordinates
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
