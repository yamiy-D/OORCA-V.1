/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SimulationParameters, 
  SimulationResult, 
  SimulationControlsState,
} from '../types/simulation';
import { simulationService, DEFAULT_PARAMETERS } from '../services/simulationService';
import { SimulationHeader } from '../components/simulation/SimulationHeader';
import { InputParametersPanel } from '../components/simulation/InputParametersPanel';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { ConcentrationLegend } from '../components/simulation/ConcentrationLegend';
import { MapControls } from '../components/simulation/MapControls';
import { CompassAndScale } from '../components/simulation/CompassAndScale';
import { SimulationMap } from '../components/simulation/SimulationMap';
import { OperationalCommandDock } from '../components/simulation/OperationalCommandDock';
// STEP 1: Live OpenWeather Metocean Intelligence Monitor Widget
import { LiveWeatherMonitor } from '../components/simulation/LiveWeatherMonitor';
// STEP 2: On-Canvas Floating Quick-Toggle Hub (Allows toggling all panels/popups)
import { FloatingQuickToggleHub } from '../components/simulation/FloatingQuickToggleHub';
// STEP 2.5: GFW Vessel Identity & Risk Assessment Modal
import { GfwVesselIdentityModal } from '../components/simulation/GfwVesselIdentityModal';
// STEP 2.6: Maritime Geographic Land Validation (Avoid vessel to locate over land)
import { isLandLocation, getMaritimeRegionName } from '../utils/geoValidation';

export function SimulationPage() {
  // Simulation Inputs & Parameters
  const [parameters, setParameters] = useState<SimulationParameters>(() => {
    const saved = localStorage.getItem('oorca_sim_params');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old Arabian Sea coordinates, update to default Bay of Bengal
        if (parsed.location?.latitude === 18.9076 || !parsed.location) {
          return DEFAULT_PARAMETERS;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_PARAMETERS;
      }
    }
    return DEFAULT_PARAMETERS;
  });

  // Timeline & Playback State
  const [currentHour, setCurrentHour] = useState<number>(48);
  const [totalHours] = useState<number>(72);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Dynamic Ocean Slick & Continuous Seepage State
  const [showOceanSlick, setShowOceanSlick] = useState<boolean>(true);
  const [showHighZone, setShowHighZone] = useState<boolean>(true);
  const [showMediumZone, setShowMediumZone] = useState<boolean>(true);
  const [showLowZone, setShowLowZone] = useState<boolean>(true);
  const [seepageRate, setSeepageRate] = useState<number>(parameters.spillDetails.seepageRateTonnesPerHour ?? 25);

  // =========================================================================
  // STEP 3: PREVIOUS INITIAL PANEL OPEN STATES (COMMENTED OUT FOR EASY UPDATE LATER)
  // =========================================================================
  /*
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(true);
  const [isConcentrationOpen, setIsConcentrationOpen] = useState<boolean>(true);
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(true);
  const [isInputPanelOpen, setIsInputPanelOpen] = useState<boolean>(true);
  */

  // STEP 4: Initial Collapsed State for All Panels & Popups (User Request: Initially everything collapsed)
  const [isInputPanelOpen, setIsInputPanelOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isConcentrationOpen, setIsConcentrationOpen] = useState<boolean>(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(false);
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [focusedPanel, setFocusedPanel] = useState<'timeline' | 'concentration'>('timeline');

  // STEP 5: Individual Toggle Handlers
  const handleToggleTimeline = () => {
    setIsTimelineOpen((prev) => {
      const next = !prev;
      if (next) setFocusedPanel('timeline');
      return next;
    });
  };

  const handleToggleConcentration = () => {
    setIsConcentrationOpen((prev) => {
      const next = !prev;
      if (next) setFocusedPanel('concentration');
      return next;
    });
  };

  const handleToggleWeather = () => {
    setIsWeatherOpen((prev) => !prev);
  };

  const handleToggleDock = () => {
    setIsDockOpen((prev) => !prev);
  };

  const handleToggleInputPanel = () => {
    setIsInputPanelOpen((prev) => !prev);
  };

  // STEP 6: Master Bulk Actions (Expand All / Collapse All)
  const handleExpandAll = () => {
    setIsInputPanelOpen(true);
    setIsTimelineOpen(true);
    setIsConcentrationOpen(true);
    setIsWeatherOpen(true);
    setIsDockOpen(true);
  };

  const handleCollapseAll = () => {
    setIsInputPanelOpen(false);
    setIsTimelineOpen(false);
    setIsConcentrationOpen(false);
    setIsWeatherOpen(false);
    setIsDockOpen(false);
  };

  // Layout & UI Toggles
  const [currentLayerId, setCurrentLayerId] = useState<string>('dark');
  const [showWind, setShowWind] = useState<boolean>(false);
  const [showWaves, setShowWaves] = useState<boolean>(false);
  // STEP 6.5: GFW Apparent Fishing Effort & Vessel Identity Modal States
  const [showFishingEffort, setShowFishingEffort] = useState<boolean>(false);
  const [isGfwModalOpen, setIsGfwModalOpen] = useState<boolean>(false);

  // STEP 6.6: Interactive Maritime Map Pinpoint State & Handler (Avoid vessel to locate over land)
  const [isPinpointMode, setIsPinpointMode] = useState<boolean>(false);

  const handlePinpointLocation = (lat: number, lng: number) => {
    // Avoid vessel to locate over land check
    if (isLandLocation(lat, lng)) {
      return;
    }

    const regionName = getMaritimeRegionName(lat, lng);
    setParameters((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng,
        locationName: regionName,
      },
    }));

    setFocusCoords([lat, lng]);
    setIsPinpointMode(false);
  };

  const [zoomAction, setZoomAction] = useState<number>(0);
  const [zoomOutAction, setZoomOutAction] = useState<number>(0);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);

  // Map State (spillLocation, simulationActive, affectedRadius)
  const [spillLocation, setSpillLocation] = useState<{ lat: number; lng: number } | null>({
    lat: parameters.location.latitude,
    lng: parameters.location.longitude,
  });
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [affectedRadius, setAffectedRadius] = useState<number>(50000);

  // Keep spillLocation synchronized if parameters are loaded/updated from panel
  useEffect(() => {
    if (parameters.location.latitude && parameters.location.longitude) {
      setSpillLocation({
        lat: parameters.location.latitude,
        lng: parameters.location.longitude,
      });
    }
  }, [parameters.location.latitude, parameters.location.longitude]);

  // Simulation Computed Output
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Execute or refresh simulation
  const executeSimulation = useCallback(async (
    paramsToUse: SimulationParameters = parameters,
    hourToUse: number = currentHour
  ) => {
    const result = await simulationService.runSimulation(paramsToUse, hourToUse, totalHours);
    setSimulationResult(result);
  }, [parameters, totalHours]);

  // Initial load
  useEffect(() => {
    executeSimulation(parameters, currentHour);
  }, [parameters, executeSimulation]);

  // Update simulation when currentHour changes
  useEffect(() => {
    if (simulationResult && simulationResult.currentHour !== currentHour) {
      setSimulationResult(prev => prev ? { ...prev, currentHour } : null);
    }
    executeSimulation(parameters, currentHour);
  }, [currentHour, parameters, executeSimulation]);

  // Playback timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentHour((prev) => {
          if (prev >= totalHours) {
            setIsPlaying(false);
            return totalHours;
          }
          return prev + 1;
        });
      }, 750 / playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalHours, playbackSpeed]);

  // Handle RUN SIMULATION button
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 600)); // Smooth feedback
    await executeSimulation(parameters, currentHour);
    setIsSimulating(false);
  };

  // STEP 2: Live OpenWeather & Metocean Refresh Handler
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);
  const handleRefreshWeather = async () => {
    setIsRefreshingWeather(true);
    await executeSimulation(parameters, currentHour);
    setIsRefreshingWeather(false);
  };

  // Reset to default
  const handleNewSimulation = () => {
    setParameters(DEFAULT_PARAMETERS);
    setCurrentHour(48);
    setIsPlaying(false);
    executeSimulation(DEFAULT_PARAMETERS, 48);
  };

  // Save parameters
  const handleSaveSimulation = () => {
    localStorage.setItem('oorca_sim_params', JSON.stringify(parameters));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Export report
  const handleExportReport = () => {
    if (!simulationResult) return;
    const reportData = {
      title: 'OORCA Oil Spill Simulation Scientific Assessment',
      model: 'OpenDrift Marine Dispersion Engine (Calibrated)',
      generatedUtc: new Date().toISOString(),
      parameters,
      simulationResult,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OORCA_Simulation_Report_${parameters.vesselDetails.vesselName.replace(/\s+/g, '_')}_${currentHour}h.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share simulation
  const handleShareSimulation = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // Controls State Bundle
  const controlsState: SimulationControlsState = {
    currentHour,
    totalHours,
    isPlaying,
    playbackSpeed,
    simulationTimeLabel: `+ ${currentHour}h`,
    currentTimeFormatted: simulationResult?.currentTimeFormatted || '29/05/2025 10:00',
  };

  return (
    <div 
      id="oorca-simulation-page-root"
      className="min-h-screen h-screen w-full bg-black text-white flex flex-col overflow-hidden font-geist select-none"
    >
      {/* 1. Top Application Header */}
      <SimulationHeader
        onNewSimulation={handleNewSimulation}
        onSaveSimulation={handleSaveSimulation}
        onExportReport={handleExportReport}
        onShareSimulation={handleShareSimulation}
        isSaved={isSaved}
        onToggleParameters={handleToggleInputPanel}
        isParametersOpen={isInputPanelOpen}
        activeSpillSummary={`${parameters.spillDetails.amount} ${parameters.spillDetails.amountUnit} • ${parameters.spillDetails.oilType.split(' ')[0]}`}
        isTimelineOpen={isTimelineOpen}
        onToggleTimeline={handleToggleTimeline}
        isConcentrationOpen={isConcentrationOpen}
        onToggleConcentration={handleToggleConcentration}
        isWeatherOpen={isWeatherOpen}
        onToggleWeather={handleToggleWeather}
        isDockOpen={isDockOpen}
        onToggleDock={handleToggleDock}
      />

      {/* 2. Main Workspace: Left Panel + Center Map */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Input Parameters Panel */}
        <InputParametersPanel
          parameters={parameters}
          onChangeParameters={(newParams) => {
            setParameters(newParams);
          }}
          onRunSimulation={handleRunSimulation}
          isRunning={isSimulating}
          isOpen={isInputPanelOpen}
          onToggleOpen={() => setIsInputPanelOpen(!isInputPanelOpen)}
          environmentalConditions={simulationResult?.environmentalConditions}
          onSyncWeather={handleRefreshWeather}
          onOpenGfwVesselModal={() => setIsGfwModalOpen(true)}
          // STEP 2.7: Map Pinpointing Props (Avoid vessel to locate over land)
          isPinpointMode={isPinpointMode}
          onTogglePinpointMode={() => setIsPinpointMode((prev) => !prev)}
        />

        {/* Central Map & Overlays Container */}
        <main className="flex-1 relative flex flex-col overflow-hidden bg-black">
          
          {/* MAP CANVAS VIEW (NOW EXPANSIVE & PRIMARY) */}
          <div className="flex-1 relative overflow-hidden">
            <SimulationMap
              spillLocation={spillLocation}
              simulationActive={simulationActive}
              affectedRadius={affectedRadius}
              flyToLocation={focusCoords ? { lat: focusCoords[0], lng: focusCoords[1] } : null}
              simulationResult={simulationResult}
              parameters={parameters}
              currentLayerId={currentLayerId}
              showWind={showWind}
              showWaves={showWaves}
              zoomAction={zoomAction}
              zoomOutAction={zoomOutAction}
              focusCoords={focusCoords}
              onOpenParameters={() => setIsInputPanelOpen(true)}
              showOceanSlick={showOceanSlick}
              onToggleOceanSlick={setShowOceanSlick}
              showHighZone={showHighZone}
              onToggleHighZone={setShowHighZone}
              showMediumZone={showMediumZone}
              onToggleMediumZone={setShowMediumZone}
              showLowZone={showLowZone}
              onToggleLowZone={setShowLowZone}
              seepageRate={seepageRate}
              onSeepageRateChange={setSeepageRate}
              currentHour={currentHour}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              showFishingEffort={showFishingEffort}
              onToggleFishingEffort={(val) => setShowFishingEffort(val)}
              // STEP 2.8: Map Pinpointing Handlers
              isPinpointMode={isPinpointMode}
              onPinpointLocation={handlePinpointLocation}
              onCancelPinpoint={() => setIsPinpointMode(false)}
            />

            {/* STEP 3.5: On-Canvas Floating Quick-Toggle Hub (Controls all panels/popups directly on map) */}
            <FloatingQuickToggleHub
              isInputPanelOpen={isInputPanelOpen}
              onToggleInputPanel={handleToggleInputPanel}
              isTimelineOpen={isTimelineOpen}
              onToggleTimeline={handleToggleTimeline}
              isConcentrationOpen={isConcentrationOpen}
              onToggleConcentration={handleToggleConcentration}
              isWeatherOpen={isWeatherOpen}
              onToggleWeather={handleToggleWeather}
              isDockOpen={isDockOpen}
              onToggleDock={handleToggleDock}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              showFishingEffort={showFishingEffort}
              onToggleFishingEffort={() => setShowFishingEffort((prev) => !prev)}
              onOpenGfwModal={() => setIsGfwModalOpen(true)}
            />

            {/* STEP 4: Floating Live OpenWeather Intelligence Monitor & Change Detector */}
            {simulationResult?.environmentalConditions && (
              <LiveWeatherMonitor
                conditions={simulationResult.environmentalConditions}
                currentHour={currentHour}
                locationName={parameters.location.locationName}
                onRefreshWeather={handleRefreshWeather}
                isRefreshing={isRefreshingWeather}
                isOpen={isWeatherOpen}
                onToggleOpen={handleToggleWeather}
                onClose={() => setIsWeatherOpen(false)}
              />
            )}

            {/* Floating Draggable Overlay 1: Simulation Controls */}
            <SimulationControls
              controlsState={controlsState}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onHourChange={(hr) => setCurrentHour(hr)}
              onSelectTimeOption={(opt) => {
                const hr = parseInt(opt.replace(/\D/g, ''), 10);
                if (!isNaN(hr)) setCurrentHour(hr);
              }}
              onOpenParameters={() => setIsInputPanelOpen(true)}
              seepageRate={seepageRate}
              initialAmount={parameters.spillDetails.amount}
              onChangePlaybackSpeed={setPlaybackSpeed}
              isOpen={isTimelineOpen}
              onClose={() => setIsTimelineOpen(false)}
              zIndex={focusedPanel === 'timeline' ? 35 : 30}
              onFocus={() => setFocusedPanel('timeline')}
              initialPosition={{ x: 16, y: 16 }}
            />

            {/* Floating Draggable Overlay 2: Concentration Legend */}
            <ConcentrationLegend 
              showOceanSlick={showOceanSlick}
              onToggleOceanSlick={() => setShowOceanSlick(!showOceanSlick)}
              showHighZone={showHighZone}
              onToggleHighZone={() => setShowHighZone(!showHighZone)}
              showMediumZone={showMediumZone}
              onToggleMediumZone={() => setShowMediumZone(!showMediumZone)}
              showLowZone={showLowZone}
              onToggleLowZone={() => setShowLowZone(!showLowZone)}
              peakThicknessMicrons={simulationResult?.peakThicknessMicrons ?? 350}
              isOpen={isConcentrationOpen}
              onClose={() => setIsConcentrationOpen(false)}
              zIndex={focusedPanel === 'concentration' ? 35 : 30}
              onFocus={() => setFocusedPanel('concentration')}
              initialPosition={{ x: 340, y: 16 }}
            />

            {/* Floating Overlay 3: Map Controls (Top Right) */}
            <MapControls
              currentLayerId={currentLayerId}
              onChangeLayer={(id) => setCurrentLayerId(id)}
              showWind={showWind}
              onToggleWind={() => setShowWind(!showWind)}
              showWaves={showWaves}
              onToggleWaves={() => setShowWaves(!showWaves)}
              onZoomIn={() => setZoomAction((prev) => prev + 1)}
              onZoomOut={() => setZoomOutAction((prev) => prev + 1)}
              showFishingEffort={showFishingEffort}
              onToggleFishingEffort={() => setShowFishingEffort((prev) => !prev)}
            />

            {/* Floating Overlay 4: Compass & Scale */}
            <CompassAndScale />
          </div>

          {/* =========================================================================
              STEP 7: PREVIOUS STATIC DOCK (COMMENTED OUT FOR EASY UPDATE LATER)
              ========================================================================= */}
          {/*
          {simulationResult && (
            <OperationalCommandDock
              simulationResult={simulationResult}
              parameters={parameters}
              onSelectShoreline={(coords) => setFocusCoords(coords)}
              onOpenParameters={() => setIsInputPanelOpen(true)}
            />
          )}
          */}

          {/* STEP 8: Bottom Operational Intelligence Dock (Initially collapsed into pill button, toggleable) */}
          {simulationResult && (
            <OperationalCommandDock
              simulationResult={simulationResult}
              parameters={parameters}
              onSelectShoreline={(coords) => setFocusCoords(coords)}
              onOpenParameters={() => setIsInputPanelOpen(true)}
              isOpen={isDockOpen}
              onToggleOpen={handleToggleDock}
            />
          )}

          {/* STEP 5: Footer / Data Attribution Bar (Fitted with truncation & overflow-hidden) */}
          <footer 
            id="simulation-data-attribution-footer"
            className="h-7 px-4 bg-black/90 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono-code shrink-0 z-10 select-none overflow-hidden gap-3"
          >
            <div className="truncate min-w-0 mr-2">
              <span className="truncate hidden sm:inline">Disclaimer: Simulation based on calibrated physical parameters and metocean models.</span>
              <span className="truncate inline sm:hidden">Calibrated metocean models active.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[10px] sm:text-[11px]">
              <span className="hidden md:inline">Model: <strong className="text-white/80 font-semibold">OpenDrift</strong></span>
              <span className="hidden md:inline text-white/20">|</span>
              <span>Weather: <strong className="text-emerald-400 font-semibold">OpenWeather</strong></span>
              <span className="text-white/20">|</span>
              <span>AIS &amp; Fisheries: <strong className="text-cyan-400 font-semibold">Global Fishing Watch</strong></span>
            </div>
          </footer>

        </main>
      </div>

      {/* STEP 9: Global Fishing Watch (GFW) Vessel Identity & Risk Assessment Modal */}
      <GfwVesselIdentityModal
        isOpen={isGfwModalOpen}
        onClose={() => setIsGfwModalOpen(false)}
        currentVessel={parameters.vesselDetails}
        spillOrigin={{ lat: parameters.location.latitude, lng: parameters.location.longitude }}
        onApplyVessel={(updatedVessel) => {
          setParameters((prev) => ({
            ...prev,
            vesselDetails: updatedVessel,
          }));
        }}
      />
    </div>
  );
}
