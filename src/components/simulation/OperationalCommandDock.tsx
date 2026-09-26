/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  Droplets, 
  MapPin, 
  Clock, 
  Waves, 
  Minimize2,
  Wind,
  Gauge,
  Thermometer,
  Cloud,
  Zap,
  Sparkles
} from 'lucide-react';
import { SimulationResult, SimulationParameters } from '../../types/simulation';
import { SpillSummary } from './SpillSummary';
import { DangerAssessment } from './DangerAssessment';
import { EcologicalRiskTable } from './EcologicalRiskTable';
import { ShorelineImpact } from './ShorelineImpact';

interface OperationalCommandDockProps {
  simulationResult: SimulationResult;
  parameters: SimulationParameters;
  onSelectShoreline: (coords: [number, number]) => void;
  onOpenParameters: () => void;
  // STEP 1: Controlled Collapse State Props (Defaults to false / collapsed initially)
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

// STEP 2: Dock Tab Types with Weather Intelligence
type DockTab = 'summary' | 'weather' | 'shoreline' | 'ecology' | 'danger' | 'all';

export function OperationalCommandDock({
  simulationResult,
  parameters,
  onSelectShoreline,
  isOpen = false,
  onToggleOpen,
}: OperationalCommandDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocalMinimized, setIsLocalMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<DockTab>('summary');

  const { summary, dangerAssessment, shorelineImpacts, ecologicalRisks } = simulationResult;

  const getOverallRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  // STEP 3: Collapsed View — Sleek Compact Floating Pill Toggle Button (Default on load)
  const isCurrentlyMinimized = !isOpen || isLocalMinimized;

  if (isCurrentlyMinimized) {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 select-none font-geist pointer-events-auto">
        <button
          id="btn-restore-dock-pill"
          onClick={() => {
            setIsLocalMinimized(false);
            if (onToggleOpen && !isOpen) {
              onToggleOpen();
            }
          }}
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-xl shadow-2xl transition-all cursor-pointer bg-black/90 hover:scale-105 hover:bg-black ${getOverallRiskBadgeClass(dangerAssessment.overallRisk)}`}
          title="Restore Operational Telemetry Dock"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Operations: {dangerAssessment.overallRisk} Risk</span>
          <span className="text-[11px] font-mono-code opacity-80">· {summary.spillAreaEstKm2.toFixed(1)} km²</span>
          <ChevronUp className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>
    );
  }

  return (
    <div 
      id="operational-command-dock"
      className="z-20 bg-black/95 border-t border-white/10 flex flex-col shrink-0 select-none backdrop-blur-2xl shadow-2xl transition-all duration-300 font-geist text-white"
    >
      {/* 1. PRIMARY OPERATIONAL BAR */}
      <div className="h-12 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs">
        
        {/* LEFT: RISK INDICATOR & LOCATION */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span 
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium font-mono-code tracking-wider border flex items-center gap-1.5 ${getOverallRiskBadgeClass(dangerAssessment.overallRisk)}`}
              title="Overall Emergency Danger Level"
            >
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{dangerAssessment.overallRisk} RISK</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-white/70 border-l border-white/10 pl-3">
            <MapPin className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <span className="font-medium text-white truncate max-w-[200px]">
              {parameters.location.locationName.split(',')[0]}
            </span>
            <span className="text-[10px] font-mono-code text-white/40">
              ({parameters.location.latitude.toFixed(2)}°N, {parameters.location.longitude.toFixed(2)}°E)
            </span>
          </div>
        </div>

        {/* STEP 2: CENTER: SUMMARY & PHYSICS METRICS (Fitted with min-w-0, overflow-hidden and truncation to prevent text leaking) */}
        <div className="hidden md:flex items-center justify-center gap-2 lg:gap-3 xl:gap-4 text-xs font-mono-code min-w-0 flex-1 overflow-hidden px-2">
          <div className="flex items-center gap-1.5 text-white/70 shrink-0">
            <Clock className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/40 text-[11px]">Age:</span>
            <strong className="text-white">+{simulationResult.currentHour}h</strong>
          </div>

          <div className="h-3 w-[1px] bg-white/10 shrink-0" />

          <div className="flex items-center gap-1.5 text-white/70 shrink-0">
            <span className="text-white/40 text-[11px]">Area:</span>
            <strong className="text-white font-medium">{summary.spillAreaEstKm2.toFixed(1)} km²</strong>
          </div>

          <div className="hidden xl:block h-3 w-[1px] bg-white/10 shrink-0" />

          <div className="hidden xl:flex items-center gap-1.5 text-white/70 shrink-0">
            <Droplets className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-white/40 text-[11px]">Peak:</span>
            <strong className="text-white truncate max-w-[85px]">{simulationResult.maxConcentrationMicrons ? `${simulationResult.maxConcentrationMicrons} μm` : '> 200 μm'}</strong>
          </div>

          <div className="hidden lg:block h-3 w-[1px] bg-white/10 shrink-0" />

          <div className="hidden lg:flex items-center gap-1.5 text-white/70 min-w-0 shrink">
            <Waves className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span className="text-white/40 text-[11px] shrink-0">Plume:</span>
            <strong 
              className="text-white truncate max-w-[100px] xl:max-w-[160px] 2xl:max-w-none inline-block align-bottom"
              title={`${simulationResult.plumeDirectionCompass ?? 'NE'} (${simulationResult.plumeDirectionDeg ?? 45}°)${simulationResult.affectedDistanceKm ? ` · ${simulationResult.affectedDistanceKm} km` : ''}`}
            >
              {simulationResult.plumeDirectionCompass ?? 'NE'} ({simulationResult.plumeDirectionDeg ?? 45}°)
              {simulationResult.affectedDistanceKm ? ` · ${simulationResult.affectedDistanceKm}km` : ''}
            </strong>
          </div>

          <div className="hidden lg:block h-3 w-[1px] bg-white/10 shrink-0" />

          <div className="hidden lg:flex items-center gap-1.5 text-white/70 shrink-0">
            <span className="text-white/40 text-[11px] shrink-0">Landfall:</span>
            <strong className="text-white truncate max-w-[80px] xl:max-w-[120px]">{summary.maxShoreArrival}</strong>
          </div>
        </div>

        {/* STEP 3: RIGHT: TABS & DRAWER EXPANSION TOGGLE (shrink-0 to guarantee clean fitting) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct Category Tab Chips */}
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => {
                setActiveTab('summary');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isExpanded && activeTab === 'summary'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Summary
            </button>

            {/* STEP 2: Weather & Metocean Tab Button */}
            <button
              onClick={() => {
                setActiveTab('weather');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isExpanded && activeTab === 'weather'
                  ? 'bg-emerald-400 text-black font-semibold shadow-sm'
                  : 'text-emerald-300/80 hover:text-emerald-200'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>Weather & Shifts</span>
              {simulationResult.environmentalConditions?.weatherShiftDetected && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('shoreline');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isExpanded && activeTab === 'shoreline'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Shorelines ({shorelineImpacts.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('ecology');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isExpanded && activeTab === 'ecology'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Ecology ({ecologicalRisks.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('danger');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isExpanded && activeTab === 'danger'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Threats
            </button>

            <button
              onClick={() => {
                setActiveTab('all');
                setIsExpanded(true);
              }}
              className={`hidden xl:block px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isExpanded && activeTab === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Panels
            </button>
          </div>

          {/* Expand / Collapse Button */}
          <button
            id="btn-toggle-telemetry-drawer"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
            title={isExpanded ? "Collapse Telemetry Drawer" : "Expand Full Scientific Telemetry"}
          >
            <span>{isExpanded ? 'Collapse' : 'Details'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronUp className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* STEP 4: Minimize To Pill Button */}
          <button
            id="btn-minimize-dock"
            onClick={() => {
              setIsLocalMinimized(true);
              if (onToggleOpen && isOpen) {
                onToggleOpen();
              }
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimize dock completely for maximum map view"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. EXPANDED SCIENTIFIC TELEMETRY DRAWER */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 sm:p-5 bg-black/95 overflow-y-auto max-h-[360px] custom-scrollbar animate-in slide-in-from-bottom-2 duration-200">
          
          {/* TAB: SPILL SUMMARY */}
          {activeTab === 'summary' && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpillSummary summary={summary} />
                <DangerAssessment assessment={dangerAssessment} />
              </div>
            </div>
          )}

          {/* STEP 3: TAB: LIVE OPENWEATHER & METOCEAN DYNAMICS */}
          {activeTab === 'weather' && (
            <div className="max-w-5xl mx-auto space-y-4">
              
              {/* Atmospheric Header & Current Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] font-mono-code text-white/50 flex items-center gap-1.5 mb-1">
                    <Cloud className="w-3.5 h-3.5 text-white/60" />
                    <span>ATMOSPHERIC CONDITION</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {simulationResult.environmentalConditions?.weatherCondition || 'Clouds'}
                  </div>
                  <div className="text-[11px] text-white/60 capitalize mt-0.5">
                    {simulationResult.environmentalConditions?.weatherDescription || 'scattered clouds'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] font-mono-code text-white/50 flex items-center gap-1.5 mb-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WIND SPEED & VECTOR</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono-code">
                    {simulationResult.environmentalConditions?.windSpeedKts.toFixed(1)} kts
                  </div>
                  <div className="text-[11px] text-emerald-300 font-mono-code mt-0.5">
                    Heading: {simulationResult.environmentalConditions?.windDirectionDeg}° (Surface Drift ~3.2%)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] font-mono-code text-white/50 flex items-center gap-1.5 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>AIR & SEA TEMPERATURE</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono-code">
                    {simulationResult.environmentalConditions?.airTemperatureC.toFixed(1)} °C
                  </div>
                  <div className="text-[11px] text-white/60 font-mono-code mt-0.5">
                    Sea Surface: {simulationResult.environmentalConditions?.waterTemperatureC.toFixed(1)} °C
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] font-mono-code text-white/50 flex items-center gap-1.5 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <span>BAROMETRIC & HUMIDITY</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono-code">
                    {simulationResult.environmentalConditions?.pressureHpa || 1012} hPa
                  </div>
                  <div className="text-[11px] text-white/60 font-mono-code mt-0.5">
                    Humidity: {simulationResult.environmentalConditions?.humidityPct || 76}%
                  </div>
                </div>
              </div>

              {/* STEP 4: Weather Shift & Hydrodynamic Trajectory Impact Panel */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-black to-blue-950/30 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Hydrodynamic Weather Impact on Oil Dispersion (+{simulationResult.currentHour}h)
                  </span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed space-y-1">
                  <p>
                    • <strong>Wind Forcing:</strong> Surface wind at {simulationResult.environmentalConditions?.windSpeedKts.toFixed(1)} kts imparts a Lagrangian drift component of {(simulationResult.environmentalConditions?.windSpeedKts * 0.032).toFixed(2)} kts towards {(simulationResult.environmentalConditions?.windDirectionDeg + 180) % 360}°.
                  </p>
                  <p>
                    • <strong>Weathering & Evaporation:</strong> Ambient temperature of {simulationResult.environmentalConditions?.airTemperatureC.toFixed(1)}°C and wave shearing drive a {summary.evaporationPct}% volatile fraction evaporation rate over {simulationResult.currentHour} hours.
                  </p>
                  {simulationResult.environmentalConditions?.currentWeatherAlert && (
                    <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200">
                      <strong className="block text-xs font-semibold">
                        ⚡ Active Meteorological Event: {simulationResult.environmentalConditions.currentWeatherAlert.headline}
                      </strong>
                      <span className="text-[11px] opacity-90">
                        {simulationResult.environmentalConditions.currentWeatherAlert.description} — {simulationResult.environmentalConditions.currentWeatherAlert.dispersionImpact}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 5: 72-Hour Metocean Progression Timeline */}
              {simulationResult.environmentalConditions?.timelineForecast && simulationResult.environmentalConditions.timelineForecast.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OpenWeather 72-Hour Forecast Evolution</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {simulationResult.environmentalConditions.timelineForecast.map((step) => {
                      const isCurrent = Math.abs(step.hourOffset - simulationResult.currentHour) < 2;
                      return (
                        <div 
                          key={`tab-step-${step.hourOffset}`}
                          className={`p-2.5 rounded-lg border text-center font-mono-code transition-all ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                              : 'bg-white/[0.03] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-white">+{step.hourOffset}h</div>
                          <div className="text-xs font-medium text-emerald-300 mt-1">{step.windSpeedKts} kts</div>
                          <div className="text-[10px] text-white/50">{step.windDirectionDeg}°</div>
                          <div className="text-[10px] text-white/80 mt-1 capitalize truncate">{step.condition}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: SHORELINE IMPACT */}
          {activeTab === 'shoreline' && (
            <div className="max-w-5xl mx-auto">
              <ShorelineImpact 
                shorelines={shorelineImpacts} 
                onSelectShoreline={(coords) => {
                  onSelectShoreline(coords);
                }}
              />
            </div>
          )}

          {/* TAB: ECOLOGICAL RISKS */}
          {activeTab === 'ecology' && (
            <div className="max-w-5xl mx-auto">
              <EcologicalRiskTable inhabitants={ecologicalRisks} />
            </div>
          )}

          {/* TAB: DANGER ASSESSMENT */}
          {activeTab === 'danger' && (
            <div className="max-w-4xl mx-auto">
              <DangerAssessment assessment={dangerAssessment} />
            </div>
          )}

          {/* TAB: ALL PANELS GRID */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 max-w-[1920px] mx-auto">
              <SpillSummary summary={summary} />
              <DangerAssessment assessment={dangerAssessment} />
              <EcologicalRiskTable inhabitants={ecologicalRisks} />
              <ShorelineImpact 
                shorelines={shorelineImpacts} 
                onSelectShoreline={onSelectShoreline}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
