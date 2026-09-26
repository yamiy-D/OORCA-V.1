/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cloud, 
  Wind, 
  Compass, 
  Thermometer, 
  Gauge, 
  Droplets, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  RefreshCw,
  Zap,
  Minimize2,
  X
} from 'lucide-react';
import { EnvironmentalConditions, WeatherTimelineStep, WeatherChangeAlert } from '../../types/simulation';

// STEP 1: Props Interface for Live Weather Monitor & Toggle Controls
interface LiveWeatherMonitorProps {
  conditions: EnvironmentalConditions;
  currentHour: number;
  locationName: string;
  onRefreshWeather?: () => void;
  isRefreshing?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onClose?: () => void;
}

export function LiveWeatherMonitor({
  conditions,
  currentHour,
  locationName,
  onRefreshWeather,
  isRefreshing = false,
  isOpen = true,
  onToggleOpen,
  onClose,
}: LiveWeatherMonitorProps) {
  // STEP 2: Local State for Widget Collapse / Expand Toggle
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissShiftAlert, setDismissShiftAlert] = useState(false);

  // If the parent component explicitly hides the widget, render nothing
  if (!isOpen) {
    return null;
  }

  // STEP 3: Extract Metocean Weather Telemetry
  const {
    windSpeedKts = 14.5,
    windDirectionDeg = 225,
    airTemperatureC = 28.5,
    pressureHpa = 1012,
    humidityPct = 76,
    weatherCondition = 'Clouds',
    weatherDescription = 'scattered clouds',
    timelineForecast = [],
    weatherChanges = [],
    currentWeatherAlert,
    weatherShiftDetected,
  } = conditions;

  // STEP 4: Compass Heading Cardinal Conversion
  const getCardinalDirection = (deg: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[index];
  };

  // STEP 5: Weather Icon Mapping
  const getWeatherIcon = (cond: string) => {
    switch (cond?.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'clear':
        return '☀️';
      case 'snow':
        return '❄️';
      case 'clouds':
      default:
        return '⛅';
    }
  };

  // STEP 6: Collapsed View — Sleek Compact Floating Pill Toggle Button
  if (isCollapsed) {
    return (
      <div 
        id="live-weather-monitor-widget"
        className="absolute top-3 left-16 z-30 font-geist select-none pointer-events-auto"
      >
        <button
          id="btn-weather-pill-toggle"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 hover:bg-black/95 border border-white/20 hover:border-emerald-400/50 backdrop-blur-xl shadow-2xl text-xs font-mono-code text-white transition-all hover:scale-105 cursor-pointer group"
          title="Click to expand Live OpenWeather Metocean Intelligence"
          aria-label="Expand Live Weather Monitor"
        >
          <span className="text-sm select-none">{getWeatherIcon(weatherCondition)}</span>
          <span className="font-semibold text-white">{airTemperatureC.toFixed(0)}°C</span>
          <span className="text-white/30">|</span>
          <span className="text-emerald-300 flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>{windSpeedKts.toFixed(1)} kts</span>
            <span className="text-white/60 text-[10px]">{getCardinalDirection(windDirectionDeg)}</span>
          </span>
          {weatherShiftDetected && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Weather shift detected at this hour" />
          )}
          <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
        </button>
      </div>
    );
  }

  // STEP 7: Expanded View — Main Weather Capsule Bar
  return (
    <div 
      id="live-weather-monitor-widget"
      className="absolute top-3 left-16 z-30 font-geist select-none pointer-events-auto max-w-[calc(100vw-320px)] sm:max-w-xl transition-all"
    >
      {/* =========================================================================
          STEP 1: PREVIOUS MAIN CARD CONTAINER (COMMENTED OUT FOR EASY UPDATE LATER)
          ========================================================================= */}
      {/*
      <div className="bg-black/95 hover:bg-black backdrop-blur-2xl border border-white/15 hover:border-white/30 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-3 transition-all text-white relative">
      */}

      {/* STEP 2: Selected Element 4 (CSS selector 4: Main Weather Capsule Card Container - fitted, no leaking) */}
      <div className="bg-black/95 hover:bg-black backdrop-blur-2xl border border-white/15 hover:border-white/30 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-2.5 sm:p-3 transition-all text-white relative max-w-full overflow-hidden box-border">
        
        <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0 max-w-full">
          
          {/* Weather Status Icon & Condition */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
            <span className="text-xl sm:text-2xl leading-none select-none shrink-0" title={weatherDescription}>
              {getWeatherIcon(weatherCondition)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white tracking-wide uppercase truncate">
                  {weatherCondition}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-mono-code text-white/50 hidden sm:inline shrink-0">
                  LIVE METOCEAN
                </span>
              </div>
              <div className="text-[10px] text-white/60 capitalize truncate max-w-[110px] sm:max-w-[170px]">
                {weatherDescription} • {airTemperatureC.toFixed(1)}°C
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block shrink-0" />

          {/* Wind Speed & Rotating Vector Direction */}
          <div className="flex items-center gap-2 shrink-0">
            <div 
              className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner"
              title={`Wind origin: ${windDirectionDeg}° (${getCardinalDirection(windDirectionDeg)})`}
            >
              <Wind 
                className="w-4 h-4 text-emerald-300 transition-transform duration-500 shrink-0"
                style={{ transform: `rotate(${windDirectionDeg - 45}deg)` }}
              />
            </div>
            <div>
              <div className="text-[10px] font-mono-code text-white/50">WIND (10m)</div>
              <div className="text-xs font-mono-code font-semibold text-white flex items-center gap-1">
                <span>{windSpeedKts.toFixed(1)} kts</span>
                <span className="text-white/60 text-[10px]">
                  {windDirectionDeg}° {getCardinalDirection(windDirectionDeg)}
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden md:block shrink-0" />

          {/* Barometric Pressure & Humidity */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono-code shrink-0">
            <div>
              <div className="text-[10px] text-white/50 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-white/40" />
                <span>PRESSURE</span>
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                {pressureHpa} hPa
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-white/40" />
                <span>HUMIDITY</span>
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                {humidityPct}%
              </div>
            </div>
          </div>

          {/* STEP 3: Action Buttons & Toggle Controls Container (shrink-0 to prevent leak) */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
            {onRefreshWeather && (
              <button
                onClick={onRefreshWeather}
                disabled={isRefreshing}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0 shrink-0"
                title="Refresh Live OpenWeather Conditions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono-code text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Toggle 72-Hour Weather Evolution"
            >
              <span>72h</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* STEP 4: Selected Element 2 (CSS selector 2: Toggle / Collapse Button) */}
            <button
              id="btn-toggle-weather-collapse"
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0 text-[11px] font-mono-code shrink-0"
              title="Toggle / Minimize Weather Monitor"
              aria-label="Toggle Weather Monitor"
            >
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* STEP 5: Selected Element 3 (CSS selector 3: Close Weather Button) */}
            {onClose && (
              <button
                id="btn-close-weather"
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors cursor-pointer flex items-center justify-center p-0 shrink-0"
                title="Close Weather Monitor"
                aria-label="Close Weather Monitor"
              >
                {/* STEP 6: Selected Element 1 (CSS selector 1: Close Weather SVG Icon) */}
                <X className="w-3.5 h-3.5 shrink-0 block" />
              </button>
            )}
          </div>

        </div>

        {/* STEP 10: Active Weather Shift Notification Badge at Current Hour */}
        {weatherShiftDetected && currentWeatherAlert && !dismissShiftAlert && (
          <div className="mt-2.5 pt-2 border-t border-rose-500/30 flex items-start justify-between gap-2 bg-rose-950/40 rounded-lg p-2 animate-pulse">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-rose-200 flex items-center gap-1.5">
                  <span>WEATHER SHIFT DETECTED (+{currentHour}h)</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-[9px] font-mono-code uppercase">
                    {currentWeatherAlert.severity}
                  </span>
                </div>
                <div className="text-[11px] text-white/90 font-medium mt-0.5">
                  {currentWeatherAlert.headline}: {currentWeatherAlert.description}
                </div>
                <div className="text-[10px] text-rose-300/80 mt-0.5 font-mono-code">
                  Dispersion Impact: {currentWeatherAlert.dispersionImpact}
                </div>
              </div>
            </div>
            <button
              onClick={() => setDismissShiftAlert(true)}
              className="text-[10px] text-white/40 hover:text-white p-1"
              title="Dismiss Notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 11: Expanded 72-Hour Metocean Progression Strip */}
        {isExpanded && timelineForecast && timelineForecast.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>OpenWeather Atmospheric Progression (72-Hour Timeline)</span>
              </div>
              <div className="text-[10px] font-mono-code text-white/40">
                {timelineForecast.length} Forecast Nodes Available
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {timelineForecast.map((step) => {
                const isSelected = Math.abs(step.hourOffset - currentHour) < 2;
                return (
                  <div
                    key={`step-${step.hourOffset}`}
                    className={`shrink-0 p-2 rounded-lg border text-center transition-all min-w-[76px] ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : step.isSignificantShift
                        ? 'bg-rose-500/10 border-rose-500/40 text-white/90'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="text-[10px] font-mono-code font-bold">
                      +{step.hourOffset}h
                    </div>
                    <div className="text-base my-0.5 select-none">
                      {getWeatherIcon(step.condition)}
                    </div>
                    <div className="text-[11px] font-mono-code font-semibold text-white">
                      {step.windSpeedKts} kts
                    </div>
                    <div className="text-[9px] font-mono-code text-white/60">
                      {step.windDirectionDeg}°
                    </div>
                    {step.isSignificantShift && (
                      <span className="mt-1 block text-[8px] px-1 py-0.5 rounded bg-rose-500/40 text-rose-200 font-bold uppercase truncate">
                        Shift
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {weatherChanges && weatherChanges.length > 0 && (
              <div className="mt-2 text-[10px] font-mono-code text-white/60 bg-white/5 p-2 rounded-lg">
                <span className="text-emerald-400 font-semibold">Detected Shift Log: </span>
                {weatherChanges.map((c, i) => (
                  <span key={i} className="inline-block mr-2">
                    • +{c.hour}h: {c.headline}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
