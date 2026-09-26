/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Play, 
  RefreshCw, 
  X, 
  ChevronRight,
  ChevronDown,
  Sliders,
  Ship,
  Droplets,
  Wind,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Waves,
  ShieldAlert
} from 'lucide-react';
import { 
  SimulationParameters, 
  OilType, 
  AmountUnit, 
  VesselType 
} from '../../types/simulation';
import { validateCoordinates, getMaritimeRegionName, snapToNearestWater } from '../../utils/geoValidation';

// STEP 1: Input Parameters Panel Interface
interface InputParametersPanelProps {
  parameters: SimulationParameters;
  onChangeParameters: (newParams: SimulationParameters) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  environmentalConditions?: any;
  onSyncWeather?: () => void;
  // STEP 2: GFW Vessel Identity & Risk Modal Trigger
  onOpenGfwVesselModal?: () => void;
  // STEP 2.5: Interactive Maritime Map Pinpoint Trigger
  isPinpointMode?: boolean;
  onTogglePinpointMode?: () => void;
}

export function InputParametersPanel({
  parameters,
  onChangeParameters,
  onRunSimulation,
  isRunning,
  isOpen,
  onToggleOpen,
  environmentalConditions,
  onSyncWeather,
  onOpenGfwVesselModal,
  isPinpointMode = false,
  onTogglePinpointMode,
}: InputParametersPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accordion expansion states
  const [locationOpen, setLocationOpen] = useState(true);
  const [spillOpen, setSpillOpen] = useState(true);
  const [vesselOpen, setVesselOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);

  // Controlled coordinate inputs and validation state
  const [latInput, setLatInput] = useState<string>(parameters.location.latitude.toFixed(4));
  const [lngInput, setLngInput] = useState<string>(parameters.location.longitude.toFixed(4));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  // Synchronize local input state whenever parameters update externally
  useEffect(() => {
    setLatInput(parameters.location.latitude.toFixed(4));
    setLngInput(parameters.location.longitude.toFixed(4));
  }, [parameters.location.latitude, parameters.location.longitude]);

  // Validate coordinates and relocate vessel
  const handleApplyCoordinates = (targetLat = latInput, targetLng = lngInput): boolean => {
    const result = validateCoordinates(targetLat, targetLng);
    if (!result.isValid) {
      setValidationError(result.error || 'Invalid coordinates.');
      setIsSuccessFeedback(false);
      return false;
    }

    setValidationError(null);
    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2500);

    const lat = result.lat!;
    const lng = result.lng!;
    const regionName = getMaritimeRegionName(lat, lng);

    onChangeParameters({
      ...parameters,
      location: {
        ...parameters.location,
        latitude: lat,
        longitude: lng,
        locationName: regionName,
      },
    });

    return true;
  };

  // Location search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    if (query.includes('bengal') || query.includes('vizag') || query.includes('visakhapatnam')) {
      handleLocationPreset('Bay of Bengal, Visakhapatnam Sector', 17.6500, 83.4000);
    } else if (query.includes('kakinada')) {
      handleLocationPreset('Bay of Bengal, Kakinada Offshore Basin', 16.8500, 82.5000);
    } else if (query.includes('mumbai') || query.includes('arabian')) {
      handleLocationPreset('Arabian Sea, Offshore Mumbai, India', 18.9076, 72.8177);
    } else if (query.includes('alibaug')) {
      handleLocationPreset('Alibaug Coastal Sector, Maharashtra', 18.6414, 72.8722);
    } else if (query.includes('murud')) {
      handleLocationPreset('Murud Offshore Approaches, India', 18.3283, 72.9622);
    } else {
      const parts = searchQuery.split(/[\s,]+/);
      if (parts.length >= 2) {
        setLatInput(parts[0]);
        setLngInput(parts[1]);
        handleApplyCoordinates(parts[0], parts[1]);
      }
    }
  };

  const handleLocationPreset = (name: string, lat: number, lng: number) => {
    setLatInput(lat.toFixed(4));
    setLngInput(lng.toFixed(4));
    setValidationError(null);
    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2000);
    onChangeParameters({
      ...parameters,
      location: {
        ...parameters.location,
        latitude: lat,
        longitude: lng,
        locationName: name,
      },
    });
  };

  // If closed: Always-visible dock tab on the left edge
  if (!isOpen) {
    return (
      <div className="absolute left-0 top-48 z-20 select-none font-geist">
        <button
          id="btn-expand-input-panel"
          onClick={onToggleOpen}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-r-lg bg-black/90 hover:bg-black border-y border-r border-white/15 text-white shadow-2xl backdrop-blur-xl transition-all cursor-pointer"
          title="Open Simulation Parameters (Coordinates, Spill Volume, Vessel Details)"
        >
          <Sliders className="w-3.5 h-3.5 text-white/80 group-hover:scale-110 transition-transform shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-medium tracking-wider uppercase text-white">
              Parameters
            </span>
            <span className="text-[9px] font-mono-code text-white/50">
              {parameters.spillDetails.amount} {parameters.spillDetails.amountUnit} · {parameters.spillDetails.oilType.split(' ')[0]}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <aside
      id="input-parameters-panel"
      className="w-80 md:w-[340px] bg-black border-r border-white/10 flex flex-col z-30 shrink-0 select-none backdrop-blur-2xl transition-all duration-300 shadow-2xl font-geist text-white"
    >
      {/* Panel Top Title */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between text-xs text-white font-medium tracking-wider uppercase bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-white/70" />
          <span>Simulation Parameters</span>
        </div>
        <button 
          id="btn-close-input-panel"
          onClick={onToggleOpen} 
          className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Parameters Drawer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Accordion Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs custom-scrollbar">
        
        {/* ACCORDION 1: LOCATION */}
        <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden">
          {/* STEP 2.1: CSS Selector 2 - Location Accordion Header Button with Quick Pinpoint Toggle */}
          <button
            id="btn-accordion-toggle-location"
            onClick={() => setLocationOpen(!locationOpen)}
            className="w-full px-3 py-2.5 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 via-white/[0.03] to-transparent hover:from-cyan-900/40 hover:to-white/[0.07] border-b border-white/10 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[11px] text-white uppercase tracking-wide">
                1. Spill Location
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Quick Pinpoint Mode Header Button */}
              {onTogglePinpointMode && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePinpointMode();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onTogglePinpointMode();
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono-code font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    isPinpointMode
                      ? 'bg-cyan-400 text-neutral-950 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse font-extrabold'
                      : 'bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
                  }`}
                  title="Toggle interactive map pinpointing mode (feed ocean coordinates by clicking map)"
                >
                  <Crosshair className="w-2.5 h-2.5" />
                  <span>{isPinpointMode ? 'PINPOINT ACTIVE' : 'PINPOINT'}</span>
                </span>
              )}

              {!locationOpen && (
                <span className="text-[10px] font-mono-code text-white/60 truncate max-w-[105px]">
                  {parameters.location.latitude.toFixed(2)}°N, {parameters.location.longitude.toFixed(2)}°E
                </span>
              )}
              {locationOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </div>
          </button>

          {locationOpen && (
            /* STEP 2.2: CSS Selector 1 - Location Accordion Body with Easy Access Map Pinpointer & Land Avoidance */
            <div className="p-3 space-y-3 border-t border-cyan-500/25 bg-gradient-to-b from-neutral-950/95 via-black/90 to-neutral-950/95 text-white backdrop-blur-xl shadow-inner">
              
              {/* Dedicated Interactive Map Pinpoint Tool */}
              <div className={`p-2.5 rounded-lg border transition-all ${
                isPinpointMode 
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)]' 
                  : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crosshair className={`w-3.5 h-3.5 ${isPinpointMode ? 'text-cyan-400 animate-spin' : 'text-cyan-300'}`} />
                    <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider font-mono-code">
                      Map Pinpointing Feed
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono-code font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase">
                    Ocean Water Only
                  </span>
                </div>

                <button
                  id="btn-toggle-map-pinpointing-tool"
                  type="button"
                  onClick={onTogglePinpointMode}
                  className={`w-full py-2 px-3 rounded-md flex items-center justify-center gap-2 text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-md ${
                    isPinpointMode
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-extrabold animate-pulse'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 hover:text-white'
                  }`}
                  title="Click anywhere on the maritime map to feed location information"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{isPinpointMode ? '🎯 PINPOINT ACTIVE — CLICK OCEAN MAP' : '📍 PINPOINT ON MAP (FEED LOCATION)'}</span>
                </button>

                <div className="mt-2 flex items-start gap-1.5 text-[9px] text-cyan-200/70 font-mono-code leading-tight">
                  <ShieldAlert className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Land avoidance active: vessel cannot be located over terrestrial landmasses. Only marine waters accepted.</span>
                </div>
              </div>

              {/* Search Location Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sector (e.g. Bay of Bengal, Mumbai)"
                  className="w-full h-8 pl-8 pr-3 rounded bg-white/[0.04] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5 pointer-events-none" />
              </form>

              {/* Quick Maritime Sector Presets */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold block">
                  Maritime Presets (Ocean Verified)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLocationPreset('Bay of Bengal, Offshore Basin', 16.5000, 83.2500)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Bay of Bengal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationPreset('Bay of Bengal, Visakhapatnam Sector', 17.6500, 83.4000)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Visakhapatnam
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationPreset('Bay of Bengal, Kakinada Offshore Basin', 16.8500, 82.5000)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Kakinada
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationPreset('Arabian Sea, Offshore Mumbai', 18.9076, 72.8177)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Offshore Mumbai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationPreset('Alibaug Coastal Sector', 18.6414, 72.8722)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    Alibaug
                  </button>
                </div>
              </div>

              {/* Editable Latitude & Longitude Parameters */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="input-latitude" className="text-[10px] text-white/60 font-medium">
                      Latitude
                    </label>
                    <span className="text-[9px] font-mono-code text-white/40">-90° to 90°</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-latitude"
                      type="text"
                      inputMode="decimal"
                      value={latInput}
                      onChange={(e) => {
                        setLatInput(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      onBlur={() => handleApplyCoordinates()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoordinates();
                        }
                      }}
                      placeholder="16.5000"
                      className={`w-full h-8 pl-2 pr-7 rounded bg-white/[0.04] border text-white font-mono-code text-[11px] focus:outline-none transition-colors ${
                        validationError ? 'border-red-500/70 focus:border-red-500' : 'border-white/15 focus:border-cyan-400'
                      }`}
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono-code text-white/40 pointer-events-none">
                      {Number(latInput) >= 0 ? '°N' : '°S'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="input-longitude" className="text-[10px] text-white/60 font-medium">
                      Longitude
                    </label>
                    <span className="text-[9px] font-mono-code text-white/40">-180° to 180°</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-longitude"
                      type="text"
                      inputMode="decimal"
                      value={lngInput}
                      onChange={(e) => {
                        setLngInput(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      onBlur={() => handleApplyCoordinates()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoordinates();
                        }
                      }}
                      placeholder="83.2500"
                      className={`w-full h-8 pl-2 pr-7 rounded bg-white/[0.04] border text-white font-mono-code text-[11px] focus:outline-none transition-colors ${
                        validationError ? 'border-red-500/70 focus:border-red-500' : 'border-white/15 focus:border-cyan-400'
                      }`}
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono-code text-white/40 pointer-events-none">
                      {Number(lngInput) >= 0 ? '°E' : '°W'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimal Relocate Vessel Action Button */}
              <button
                id="btn-relocate-vessel"
                type="button"
                onClick={() => handleApplyCoordinates()}
                className="w-full h-7 px-3 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center gap-1.5 text-[10.5px] font-semibold tracking-wide transition-all cursor-pointer shadow-sm"
                title="Validate coordinates and relocate vessel"
              >
                <Navigation className="w-3 h-3 text-white rotate-45" />
                <span>RELOCATE VESSEL</span>
              </button>

              {/* Validation Warning Alert (with Snap to Nearest Water option) */}
              {validationError && (
                <div 
                  id="coordinate-validation-error-alert"
                  className="p-2.5 rounded bg-red-950/80 border border-red-500/70 text-red-200 text-[11px] space-y-2 animate-in fade-in duration-200 shadow-md"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-snug font-medium">{validationError}</span>
                  </div>

                  {/* Nearest water quick snap action if landmass detected */}
                  {snapToNearestWater(Number(latInput) || 0, Number(lngInput) || 0).snapped && (
                    <button
                      type="button"
                      onClick={() => {
                        const nearest = snapToNearestWater(Number(latInput) || 0, Number(lngInput) || 0);
                        if (nearest.snapped) {
                          setLatInput(nearest.lat.toFixed(4));
                          setLngInput(nearest.lng.toFixed(4));
                          handleApplyCoordinates(nearest.lat.toFixed(4), nearest.lng.toFixed(4));
                        }
                      }}
                      className="w-full py-1 px-2.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-[10px] font-mono-code font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-inner"
                    >
                      <Waves className="w-3 h-3 text-cyan-300" />
                      <span>Snap to Nearest Ocean Water (~{snapToNearestWater(Number(latInput) || 0, Number(lngInput) || 0).distanceKm} km away)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Success Notification */}
              {isSuccessFeedback && !validationError && (
                <div 
                  id="coordinate-validation-success-alert"
                  className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center gap-1.5 animate-in fade-in duration-200 font-mono-code"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Vessel relocated to maritime water sector</span>
                </div>
              )}

              {/* Selected Location Display */}
              <div className="px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/10 text-white/80 flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate text-white/90">{parameters.location.locationName}</span>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 2: SPILL CHARACTERISTICS */}
        <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden">
          <button
            onClick={() => setSpillOpen(!spillOpen)}
            className="w-full px-3 py-2.5 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-[11px] text-white uppercase tracking-wide">
                2. Spill Volume & Oil Type
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!spillOpen && (
                <span className="text-[10px] font-mono-code text-amber-400/90">
                  {parameters.spillDetails.amount} {parameters.spillDetails.amountUnit}
                </span>
              )}
              {spillOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </div>
          </button>

          {spillOpen && (
            <div className="p-3 space-y-2.5 border-t border-white/10 bg-black/40">
              {/* Spill Amount + Unit */}
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Spill Amount</label>
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={parameters.spillDetails.amount}
                    onChange={(e) =>
                      onChangeParameters({
                        ...parameters,
                        spillDetails: {
                          ...parameters.spillDetails,
                          amount: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="col-span-7 h-7 px-2 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                  />
                  <select
                    value={parameters.spillDetails.amountUnit}
                    onChange={(e) =>
                      onChangeParameters({
                        ...parameters,
                        spillDetails: {
                          ...parameters.spillDetails,
                          amountUnit: e.target.value as AmountUnit,
                        },
                      })
                    }
                    className="col-span-5 h-7 px-1.5 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white text-xs cursor-pointer"
                  >
                    <option value="Tonnes" className="bg-neutral-900">Tonnes</option>
                    <option value="Barrels" className="bg-neutral-900">Barrels</option>
                    <option value="m³" className="bg-neutral-900">m³</option>
                    <option value="Gallons" className="bg-neutral-900">Gallons</option>
                  </select>
                </div>
              </div>

              {/* Oil Type Dropdown */}
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Hydrocarbon Classification</label>
                <select
                  value={parameters.spillDetails.oilType}
                  onChange={(e) =>
                    onChangeParameters({
                      ...parameters,
                      spillDetails: {
                        ...parameters.spillDetails,
                        oilType: e.target.value as OilType,
                      },
                    })
                  }
                  className="w-full h-7 px-2 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white text-xs cursor-pointer"
                >
                  <option value="Crude Oil" className="bg-neutral-900">Crude Oil (Heavy Viscosity)</option>
                  <option value="Diesel" className="bg-neutral-900">Diesel (Light Distillate)</option>
                  <option value="Heavy Fuel Oil" className="bg-neutral-900">Heavy Fuel Oil (HFO Bunker)</option>
                  <option value="Marine Fuel Oil" className="bg-neutral-900">Marine Fuel Oil (MFO)</option>
                  <option value="Refined Petroleum Product" className="bg-neutral-900">Refined Petroleum Product</option>
                </select>
              </div>

              {/* Spill Start Time */}
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Spill Incident Start Time (UTC)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={parameters.spillDetails.startTime}
                    onChange={(e) =>
                      onChangeParameters({
                        ...parameters,
                        spillDetails: {
                          ...parameters.spillDetails,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="w-full h-7 pl-2 pr-7 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                  />
                  <Calendar className="w-3.5 h-3.5 text-white/40 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 3: VESSEL KINEMATICS */}
        <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden">
          <button
            onClick={() => setVesselOpen(!vesselOpen)}
            className="w-full px-3 py-2.5 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Ship className="w-3.5 h-3.5 text-white/80" />
              <span className="font-semibold text-[11px] text-white uppercase tracking-wide">
                3. Vessel Specifications
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!vesselOpen && (
                <span className="text-[10px] font-mono-code text-white/50 truncate max-w-[130px]">
                  {parameters.vesselDetails.vesselName} • {parameters.vesselDetails.heading}°
                </span>
              )}
              {vesselOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </div>
          </button>

          {vesselOpen && (
            <div className="p-3 space-y-2.5 border-t border-white/10 bg-black/40">
              {/* STEP 3: GFW Vessel Identity & Risk Assessment Lookup Button */}
              {onOpenGfwVesselModal && (
                <button
                  type="button"
                  onClick={onOpenGfwVesselModal}
                  className="w-full mb-1 py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                  title="Query Global Fishing Watch API for vessel identity verification and risk assessment"
                >
                  <div className="flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">GFW Vessel Identity & Risk</span>
                  </div>
                  <span className="text-[10px] text-blue-400/80 uppercase font-semibold">Lookup →</span>
                </button>
              )}

              {/* Vessel Name */}
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Vessel Name</label>
                <input
                  type="text"
                  value={parameters.vesselDetails.vesselName}
                  onChange={(e) =>
                    onChangeParameters({
                      ...parameters,
                      vesselDetails: {
                        ...parameters.vesselDetails,
                        vesselName: e.target.value,
                      },
                    })
                  }
                  className="w-full h-7 px-2 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white text-xs"
                />
              </div>

              {/* Vessel Type & IMO Number */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Vessel Type</label>
                  <select
                    value={parameters.vesselDetails.vesselType}
                    onChange={(e) =>
                      onChangeParameters({
                        ...parameters,
                        vesselDetails: {
                          ...parameters.vesselDetails,
                          vesselType: e.target.value as VesselType,
                        },
                      })
                    }
                    className="w-full h-7 px-1 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white text-[11px] cursor-pointer"
                  >
                    <option value="Oil Tanker" className="bg-neutral-900">Oil Tanker</option>
                    <option value="Cargo Ship" className="bg-neutral-900">Cargo Ship</option>
                    <option value="Container Vessel" className="bg-neutral-900">Container Vessel</option>
                    <option value="Fishing Vessel" className="bg-neutral-900">Fishing Vessel</option>
                    <option value="Passenger Vessel" className="bg-neutral-900">Passenger Vessel</option>
                    <option value="Other" className="bg-neutral-900">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">IMO Number</label>
                  <input
                    type="text"
                    value={parameters.vesselDetails.imoNumber}
                    onChange={(e) =>
                      onChangeParameters({
                        ...parameters,
                        vesselDetails: {
                          ...parameters.vesselDetails,
                          imoNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full h-7 px-2 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                  />
                </div>
              </div>

              {/* Length & Breadth */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Length</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={parameters.vesselDetails.length}
                      onChange={(e) =>
                        onChangeParameters({
                          ...parameters,
                          vesselDetails: {
                            ...parameters.vesselDetails,
                            length: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full h-7 pl-2 pr-6 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                    />
                    <span className="text-[10px] text-white/40 absolute right-2 top-1.5 pointer-events-none">m</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Breadth</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={parameters.vesselDetails.breadth}
                      onChange={(e) =>
                        onChangeParameters({
                          ...parameters,
                          vesselDetails: {
                            ...parameters.vesselDetails,
                            breadth: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full h-7 pl-2 pr-6 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                    />
                    <span className="text-[10px] text-white/40 absolute right-2 top-1.5 pointer-events-none">m</span>
                  </div>
                </div>
              </div>

              {/* Draft & Heading */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Speed / Draft</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={parameters.vesselDetails.draft}
                      onChange={(e) =>
                        onChangeParameters({
                          ...parameters,
                          vesselDetails: {
                            ...parameters.vesselDetails,
                            draft: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full h-7 pl-2 pr-9 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                    />
                    <span className="text-[9px] text-white/40 absolute right-1.5 top-1.5 pointer-events-none">knots</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">Gyro Heading</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={parameters.vesselDetails.heading}
                      onChange={(e) =>
                        onChangeParameters({
                          ...parameters,
                          vesselDetails: {
                            ...parameters.vesselDetails,
                            heading: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full h-7 pl-2 pr-5 rounded bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-white font-mono-code text-xs"
                    />
                    <span className="text-[10px] text-white/40 absolute right-2 top-1.5 pointer-events-none">°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: ACCORDION 4: METOCEAN DRIVERS (OPENWEATHERMAP) */}
        <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden">
          <button
            onClick={() => setEnvOpen(!envOpen)}
            className="w-full px-3 py-2.5 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-white/80" />
              <span className="font-semibold text-[11px] text-white uppercase tracking-wide">
                4. Metocean Baseline (Live)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!envOpen && (
                <span className="text-[10px] font-mono-code text-white/50">
                  {environmentalConditions?.windSpeedKts ? `${environmentalConditions.windSpeedKts.toFixed(1)} kts` : '14.5 kts'} • {environmentalConditions?.weatherCondition || 'Clouds'}
                </span>
              )}
              {envOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </div>
          </button>

          {envOpen && (
            <div className="p-3 space-y-2 border-t border-white/10 bg-black/40 text-[11px]">
              
              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Weather Provider</span>
                <span className="font-mono-code text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OpenWeatherMap API
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Atmospheric Condition</span>
                <span className="font-mono-code text-white capitalize">
                  {environmentalConditions?.weatherDescription || 'scattered clouds'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Wind Speed (10m)</span>
                <span className="font-mono-code text-white">
                  {environmentalConditions?.windSpeedKts ? `${environmentalConditions.windSpeedKts.toFixed(1)} kts` : '14.5 kts'} ({environmentalConditions?.windDirectionDeg ?? 225}°)
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Surface Current</span>
                <span className="font-mono-code text-white">
                  {environmentalConditions?.currentSpeedKts ? `${environmentalConditions.currentSpeedKts.toFixed(1)} kts` : '1.2 kts'} @ {environmentalConditions?.currentDirectionDeg ?? 145}° SE
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Air / Sea Temperature</span>
                <span className="font-mono-code text-white">
                  {environmentalConditions?.airTemperatureC ? `${environmentalConditions.airTemperatureC.toFixed(1)}°C` : '28.5°C'} / {environmentalConditions?.waterTemperatureC ? `${environmentalConditions.waterTemperatureC.toFixed(1)}°C` : '29.0°C'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                <span>Barometric Pressure</span>
                <span className="font-mono-code text-white">
                  {environmentalConditions?.pressureHpa ?? 1012} hPa
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-white/60">
                <span>Fay's Spreading Phase</span>
                <span className="font-mono-code text-white">Viscous-Surface Tension</span>
              </div>

              {onSyncWeather && (
                <button
                  type="button"
                  onClick={onSyncWeather}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-mono-code flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                  <span>Sync with OpenWeather Observation</span>
                </button>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Sticky Bottom Action */}
      <div className="p-3.5 border-t border-white/10 bg-black">
        <button
          id="btn-run-simulation"
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full h-11 rounded-lg bg-white hover:scale-[1.02] active:scale-95 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Calculating Dispersion...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN SIMULATION</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
