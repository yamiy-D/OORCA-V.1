/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Satellite, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  Crosshair,
  ShieldCheck,
  Radio,
  Eye,
  Layers,
  Ship,
  Navigation,
  Clock,
  Waves,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { SatelliteMetadata, SpillCharacteristics, OilSpillIncident, SuspectVessel } from '../../types/alertTypes';
import { DEFAULT_CARTO_API_KEY, getCartoApiKey } from '../../services/mapService';
import { generateDynamicOceanSlick } from '../../utils/oceanSlickModel';
import { getVesselHeatmapSvgHtml } from '../../utils/vesselHeatmapGraphic';

export type SatelliteSourceMode = 'SENTINEL_1_SAR' | 'SENTINEL_2_EO' | 'COMPOSITE';

export interface SatelliteSpillViewerProps {
  satellite: SatelliteMetadata;
  characteristics: SpillCharacteristics;
  incidentId: string;
  incident?: OilSpillIncident;
}

const activeCartoKey = getCartoApiKey() || DEFAULT_CARTO_API_KEY;
const cartoKeyParam = activeCartoKey ? `?key=${encodeURIComponent(activeCartoKey)}` : '';

/**
 * High-performance MapLibre style specification optimized for close-up incident investigation.
 */
const INCIDENT_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri World Imagery',
    },
    'dark-tiles': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
      ],
      tileSize: 256,
      attribution: 'CARTO',
    },
  },
  layers: [
    {
      id: 'base-dark-layer',
      type: 'raster',
      source: 'dark-tiles',
      minzoom: 0,
      maxzoom: 20,
      layout: { visibility: 'visible' },
      paint: { 'raster-opacity': 1.0 },
    },
    {
      id: 'base-satellite-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 19,
      layout: { visibility: 'visible' },
      paint: { 
        'raster-opacity': 0.95,
        'raster-contrast': 0.35,
        'raster-saturation': -0.65,
        'raster-brightness-min': 0.05,
      },
    },
  ],
};

export function SatelliteSpillViewer({
  satellite,
  characteristics,
  incidentId,
  incident,
}: SatelliteSpillViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const vesselMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Satellite layer mode: Sentinel-1 SAR (default radar), Sentinel-2 EO (optical), or Composite
  const [satelliteSource, setSatelliteSource] = useState<SatelliteSourceMode>('SENTINEL_1_SAR');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(13.8);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [showVesselCard, setShowVesselCard] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState<boolean>(false);

  // Resolved vessel & incident values
  const vessel: SuspectVessel | undefined = incident?.primarySuspect;
  const vesselName = vessel?.name || 'CASUALTY CRUDE TANKER';
  const vesselMmsi = vessel?.mmsi || '636018442';
  const vesselImo = vessel?.imo || 'IMO 9382104';
  const vesselType = vessel?.vesselType || 'VLCC Crude Oil Tanker';
  const incidentStatus = incident?.status || 'HIGH PRIORITY';
  const detectionTime = incident?.detectionTimestampUtc || satellite.acquisitionTimeUtc;
  const confidenceScore = incident?.confidencePercentage || satellite.aiConfidencePercentage;

  // Pinpoint vessel coordinate: casualty/spill location is the epicenter of the incident
  const vesselLat = incident?.location?.latitude ?? 25.8412;
  const vesselLng = incident?.location?.longitude ?? 56.4921;
  const driftHeading = incident?.metocean?.currentHeadingDeg ?? 128;
  const driftSpeed = incident?.metocean?.surfaceCurrentKts ?? 1.8;
  const windSpeed = incident?.metocean?.windSpeedKts ?? 14.5;
  const windDir = incident?.metocean?.windDirectionDeg ?? 315;

  // 1. Initialize MapLibre GL instance (Once on mount)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      // Practical investigation radius bounding box (~22km radius around vessel)
      const deltaLng = 0.22;
      const deltaLat = 0.18;
      const restrictedBounds: [[number, number], [number, number]] = [
        [vesselLng - deltaLng, vesselLat - deltaLat],
        [vesselLng + deltaLng, vesselLat + deltaLat],
      ];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: INCIDENT_MAP_STYLE,
        center: [vesselLng, vesselLat],
        zoom: 13.8,
        minZoom: 11.5, // Restricted zoom range: users cannot zoom out to distant oceans
        maxZoom: 17.5,
        pitch: 18,
        bearing: 0,
        attributionControl: false,
        maxBounds: restrictedBounds, // Prevent scrolling away from incident
      });

      mapInstanceRef.current = map;

      map.on('error', (e) => {
        if (e.error?.message?.includes('404')) return;
        console.warn('[Incident Map Notice]', e);
      });

      map.on('load', () => {
        setMapLoaded(true);
        map.resize();
      });

      map.on('zoom', () => {
        setCurrentZoom(Number(map.getZoom().toFixed(2)));
      });

      const resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      }, 100);

      return () => {
        clearTimeout(resizeTimer);
        if (vesselMarkerRef.current) {
          vesselMarkerRef.current.remove();
          vesselMarkerRef.current = null;
        }
        map.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      };
    } catch (err) {
      console.error('[Incident Map Initialization Error]:', err);
    }
  }, []);

  // 2. Container ResizeObserver for robust layout adaptation
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // 3. Register GeoJSON sources and simulation oil slick layers once map is loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const ensureSource = (id: string, initialData: GeoJSON.GeoJSON) => {
      if (!map.getSource(id)) {
        map.addSource(id, { type: 'geojson', data: initialData });
      }
    };

    const ensureLayer = (layerDef: maplibregl.LayerSpecification) => {
      if (!map.getLayer(layerDef.id)) {
        map.addLayer(layerDef);
      }
    };

    // Trajectory drift line source & layer
    ensureSource('spill-trajectory', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'spill-trajectory-glow',
      type: 'line',
      source: 'spill-trajectory',
      paint: {
        'line-color': '#ffffff',
        'line-width': 4.0,
        'line-blur': 3.0,
        'line-opacity': showTrajectory ? 0.3 : 0,
      },
    });
    ensureLayer({
      id: 'spill-trajectory-line',
      type: 'line',
      source: 'spill-trajectory',
      paint: {
        'line-color': '#ffffff',
        'line-width': 2.0,
        'line-dasharray': [4, 3],
        'line-opacity': showTrajectory ? 0.9 : 0,
      },
    });

    // Trajectory waypoint nodes
    ensureSource('spill-waypoints', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'spill-waypoints-circle',
      type: 'circle',
      source: 'spill-waypoints',
      paint: {
        'circle-radius': 4.5,
        'circle-color': '#000000',
        'circle-stroke-width': 2.0,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': showTrajectory ? 0.95 : 0,
        'circle-stroke-opacity': showTrajectory ? 1.0 : 0,
      },
    });

    // Tier 1: Outer Low-Concentration Sheen (warm amber / orange glow)
    ensureSource('incident-slick-low', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'incident-slick-low-glow',
      type: 'line',
      source: 'incident-slick-low',
      paint: {
        'line-color': '#f97316',
        'line-width': 9.0,
        'line-blur': 6.0,
        'line-opacity': 0.45,
      },
    });
    ensureLayer({
      id: 'incident-slick-low-fill',
      type: 'fill',
      source: 'incident-slick-low',
      paint: {
        'fill-color': '#fb923c',
        'fill-opacity': 0.42,
      },
    });
    ensureLayer({
      id: 'incident-slick-low-line',
      type: 'line',
      source: 'incident-slick-low',
      paint: {
        'line-color': '#fb923c',
        'line-width': 1.6,
        'line-dasharray': [3, 2],
        'line-opacity': showBoundary ? 0.8 : 0,
      },
    });

    // Tier 2: Intermediate Concentration (Fiery vermilion / red-orange)
    ensureSource('incident-slick-medium', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'incident-slick-medium-glow',
      type: 'line',
      source: 'incident-slick-medium',
      paint: {
        'line-color': '#ea580c',
        'line-width': 6.0,
        'line-blur': 3.5,
        'line-opacity': 0.65,
      },
    });
    ensureLayer({
      id: 'incident-slick-medium-fill',
      type: 'fill',
      source: 'incident-slick-medium',
      paint: {
        'fill-color': '#ea580c',
        'fill-opacity': 0.72,
      },
    });
    ensureLayer({
      id: 'incident-slick-medium-line',
      type: 'line',
      source: 'incident-slick-medium',
      paint: {
        'line-color': '#f97316',
        'line-width': 2.0,
        'line-opacity': showBoundary ? 0.9 : 0,
      },
    });

    // Tier 3: Core High Concentration (Deep blood red / crimson hugging vessel hull)
    ensureSource('incident-slick-high', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'incident-slick-high-glow',
      type: 'line',
      source: 'incident-slick-high',
      paint: {
        'line-color': '#dc2626',
        'line-width': 5.0,
        'line-blur': 2.5,
        'line-opacity': 0.85,
      },
    });
    ensureLayer({
      id: 'incident-slick-high-fill',
      type: 'fill',
      source: 'incident-slick-high',
      paint: {
        'fill-color': '#dc2626',
        'fill-opacity': 0.92,
      },
    });
    ensureLayer({
      id: 'incident-slick-high-line',
      type: 'line',
      source: 'incident-slick-high',
      paint: {
        'line-color': '#f87171',
        'line-width': 2.2,
        'line-opacity': showBoundary ? 0.95 : 0,
      },
    });

    // Ruptured Tank Breach Continuous Release Jet
    ensureSource('incident-slick-breach-jet', { type: 'FeatureCollection', features: [] });
    ensureLayer({
      id: 'incident-slick-breach-jet-fill',
      type: 'fill',
      source: 'incident-slick-breach-jet',
      paint: {
        'fill-color': '#b91c1c',
        'fill-opacity': 0.96,
      },
    });
    ensureLayer({
      id: 'incident-slick-breach-jet-line',
      type: 'line',
      source: 'incident-slick-breach-jet',
      paint: {
        'line-color': '#f87171',
        'line-width': 1.8,
        'line-opacity': 0.98,
      },
    });
  }, [mapLoaded, showBoundary, showTrajectory]);

  // 4. Update dynamic slick geometry & trajectory whenever incident or coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // A. Generate Organic Simulation Oil Spill Slick (Exact matching Simulation page)
    const slick = generateDynamicOceanSlick({
      originLat: vesselLat,
      originLng: vesselLng,
      vesselHeadingDeg: driftHeading,
      envConditions: {
        windSpeedKts: windSpeed,
        windDirectionDeg: windDir,
        currentSpeedKts: driftSpeed,
        currentDirectionDeg: driftHeading,
        waterTemperatureC: 28.5,
        airTemperatureC: 31.0,
        waveHeightMeters: 1.2,
      },
      elapsedHours: 8.5,
      seepageRateTonnesPerHour: 4.2,
      initialTonnes: characteristics.estimatedAreaKm2 * 6.5,
      animPhase: 0.8,
    });

    const highSource = map.getSource('incident-slick-high') as maplibregl.GeoJSONSource | undefined;
    const medSource = map.getSource('incident-slick-medium') as maplibregl.GeoJSONSource | undefined;
    const lowSource = map.getSource('incident-slick-low') as maplibregl.GeoJSONSource | undefined;
    const jetSource = map.getSource('incident-slick-breach-jet') as maplibregl.GeoJSONSource | undefined;

    if (highSource) highSource.setData(slick.highConcentration);
    if (medSource) medSource.setData(slick.mediumConcentration);
    if (lowSource) lowSource.setData(slick.lowConcentration);
    if (jetSource) jetSource.setData(slick.breachJet);

    // B. Build Spill Trajectory Line & Prediction Waypoints
    const trajectorySource = map.getSource('spill-trajectory') as maplibregl.GeoJSONSource | undefined;
    const waypointsSource = map.getSource('spill-waypoints') as maplibregl.GeoJSONSource | undefined;

    if (incident?.trajectory) {
      const { origin, current, predictions } = incident.trajectory;
      const coordsList: [number, number][] = [
        [origin.coordinates.longitude, origin.coordinates.latitude],
        [current.coordinates.longitude, current.coordinates.latitude],
        ...predictions.map((p) => [p.coordinates.longitude, p.coordinates.latitude] as [number, number]),
      ];

      if (trajectorySource) {
        trajectorySource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordsList,
          },
        });
      }

      if (waypointsSource) {
        waypointsSource.setData({
          type: 'FeatureCollection',
          features: predictions.map((p, idx) => ({
            type: 'Feature',
            properties: { label: p.label, idx },
            geometry: {
              type: 'Point',
              coordinates: [p.coordinates.longitude, p.coordinates.latitude],
            },
          })),
        });
      }
    }

    // C. Create / Update Centered Vessel Marker with Aframax Crude Tanker & Heatmap Graphic
    if (vesselMarkerRef.current) {
      vesselMarkerRef.current.setLngLat([vesselLng, vesselLat]);
      const el = vesselMarkerRef.current.getElement();
      if (el) {
        el.innerHTML = getVesselHeatmapSvgHtml(driftHeading, 230, 135, 0.45, 0);
      }
    } else {
      const vesselEl = document.createElement('div');
      vesselEl.className = 'cursor-pointer select-none';
      vesselEl.setAttribute('id', 'vessel-centric-marker');
      vesselEl.innerHTML = getVesselHeatmapSvgHtml(driftHeading, 230, 135, 0.45, 0);

      vesselEl.addEventListener('click', () => {
        setShowVesselCard((prev) => !prev);
      });

      vesselMarkerRef.current = new maplibregl.Marker({ element: vesselEl, anchor: 'center' })
        .setLngLat([vesselLng, vesselLat])
        .addTo(map);
    }
  }, [incident, vesselLat, vesselLng, driftHeading, driftSpeed, windSpeed, windDir, characteristics, mapLoaded]);

  // 5. Automatically center map on vessel whenever incident changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Update bounded box around current vessel
    const deltaLng = 0.22;
    const deltaLat = 0.18;
    const newBounds: [[number, number], [number, number]] = [
      [vesselLng - deltaLng, vesselLat - deltaLat],
      [vesselLng + deltaLng, vesselLat + deltaLat],
    ];

    map.setMaxBounds(newBounds);
    map.flyTo({
      center: [vesselLng, vesselLat],
      zoom: 13.8,
      duration: 1200,
      essential: true,
    });
  }, [incidentId, vesselLat, vesselLng, mapLoaded]);

  // 6. Handle Satellite Source Layer Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (!map.getLayer('base-satellite-layer')) return;

    if (satelliteSource === 'SENTINEL_1_SAR') {
      // Primary radar-based oil-spill detection layer:
      // High-contrast radar backscatter grading, monochrome dark water where oil suppresses capillary waves
      map.setPaintProperty('base-satellite-layer', 'raster-saturation', -0.75);
      map.setPaintProperty('base-satellite-layer', 'raster-contrast', 0.48);
      map.setPaintProperty('base-satellite-layer', 'raster-brightness-min', 0.04);
      map.setPaintProperty('base-satellite-layer', 'raster-opacity', 0.95);
    } else if (satelliteSource === 'SENTINEL_2_EO') {
      // Sentinel-2 Optical/Environmental Imagery:
      // True natural color ocean surface and coastal reflectance
      map.setPaintProperty('base-satellite-layer', 'raster-saturation', 0.2);
      map.setPaintProperty('base-satellite-layer', 'raster-contrast', 0.12);
      map.setPaintProperty('base-satellite-layer', 'raster-brightness-min', 0.0);
      map.setPaintProperty('base-satellite-layer', 'raster-opacity', 1.0);
    } else {
      // Combined Satellite Composite:
      // Multispectral hybrid blend with enhanced anomaly contrast
      map.setPaintProperty('base-satellite-layer', 'raster-saturation', -0.15);
      map.setPaintProperty('base-satellite-layer', 'raster-contrast', 0.32);
      map.setPaintProperty('base-satellite-layer', 'raster-brightness-min', 0.02);
      map.setPaintProperty('base-satellite-layer', 'raster-opacity', 0.96);
    }
  }, [satelliteSource, mapLoaded]);

  // Recenter map on casualty vessel
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [vesselLng, vesselLat],
      zoom: 13.8,
      duration: 800,
      essential: true,
    });
  }, [vesselLng, vesselLat]);

  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomOut({ duration: 300 });
  };

  return (
    <section 
      id="satellite-spill-detection"
      className="rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden mb-6 select-none font-geist text-white"
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold font-mono-code text-white uppercase tracking-wide flex items-center gap-2">
                <span>🛰 VESSEL-CENTRIC SATELLITE SPILL MAP</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-white/5 border border-white/10 text-white/80">
                {satellite.satelliteName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-red-950/70 border border-red-500/40 text-red-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>CASUALTY PINPOINTED</span>
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono-code mt-0.5">
              Acquisition: <span className="text-white/80">{satellite.acquisitionTimeUtc}</span> • {satellite.sensorMode}
            </p>
          </div>
        </div>

        {/* AI Confidence & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] font-mono-code text-white/50">AI DETECTION CONFIDENCE</div>
            <div className="text-base sm:text-lg font-bold font-mono-code text-white flex items-center justify-end gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{confidenceScore}%</span>
            </div>
          </div>

          <button
            id="btn-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg border text-xs font-mono-code transition-colors cursor-pointer ${
              showDetails 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Sensor Specifications"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sensor Metadata Drawer (Collapsible) */}
      {showDetails && (
        <div className="bg-black border-b border-white/10 p-4 text-xs font-mono-code grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/70">
          <div>
            <span className="text-white/40 block text-[10px]">SENSOR PAYLOAD</span>
            <span className="text-white font-semibold">{satellite.sensorType}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px]">POLARIZATION</span>
            <span className="text-white font-semibold">{satellite.polarization}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px]">SPATIAL RESOLUTION</span>
            <span className="text-white font-semibold">{satellite.resolutionMeters}m Pixel Ground Sample</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px]">SCENE ORBIT ID</span>
            <span className="text-white font-mono text-[11px] truncate block">{satellite.passOrbitId}</span>
          </div>
        </div>
      )}

      {/* Main Interactive Vessel-Centric Map Canvas */}
      <div className="relative w-full h-[440px] sm:h-[500px] md:h-[540px] bg-black overflow-hidden select-none border-b border-white/10">
        
        {/* MapLibre GL WebGL Map Container */}
        <div 
          ref={mapContainerRef} 
          id="incident-maplibre-container"
          className="w-full h-full" 
        />

        {/* Tactical Top-Left: Compact Satellite Dataset Layer Selector */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[280px]">
          <div className="bg-black/90 backdrop-blur-md border border-white/15 rounded-xl p-1.5 shadow-2xl">
            <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
              <span className="text-[10px] font-mono-code font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                Satellite Dataset
              </span>
              <span className="text-[9px] font-mono-code text-white/40">10m GSD</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {[
                { 
                  id: 'SENTINEL_1_SAR', 
                  label: 'Sentinel-1 SAR', 
                  tag: 'Radar C-Band',
                  icon: <Radio className="w-3 h-3 text-white" />,
                  desc: 'Primary radar backscatter capillary wave dampening'
                },
                { 
                  id: 'SENTINEL_2_EO', 
                  label: 'Sentinel-2 EO', 
                  tag: 'Optical 10m',
                  icon: <Eye className="w-3 h-3 text-amber-400" />,
                  desc: 'Multispectral true-color visible Earth observation'
                },
                { 
                  id: 'COMPOSITE', 
                  label: 'Satellite Composite', 
                  tag: 'Multi-Sensor',
                  icon: <Layers className="w-3 h-3 text-emerald-400" />,
                  desc: 'Combined SAR radar + optical surface anomaly'
                },
              ].map((layer) => {
                const isActive = satelliteSource === layer.id;
                return (
                  <button
                    key={layer.id}
                    id={`btn-sat-layer-${layer.id}`}
                    onClick={() => setSatelliteSource(layer.id as SatelliteSourceMode)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/15 border border-white/30 text-white'
                        : 'bg-white/[0.03] border border-transparent text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {layer.icon}
                      <div>
                        <div className="font-semibold text-[11px] leading-tight text-white">
                          {layer.label}
                        </div>
                        <div className="text-[9px] text-white/40">
                          {layer.tag}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tactical Top-Right: Coords & Recenter Button */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            id="btn-recenter-vessel"
            onClick={handleRecenter}
            className="px-3 py-1.5 rounded-xl bg-black/90 border border-white/15 text-white hover:bg-white/10 text-xs font-mono-code flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors"
            title="Center Viewpoint Exactly on Casualty Vessel"
          >
            <Crosshair className="w-3.5 h-3.5 text-white/80" />
            <span className="font-bold">CENTER VESSEL</span>
          </button>

          <div className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-black/90 border border-white/10 text-[10px] font-mono-code text-white/70 items-center gap-2 shadow-lg">
            <span className="text-white/40">POS:</span>
            <span className="text-white font-semibold">{vesselLat.toFixed(4)}°N, {vesselLng.toFixed(4)}°E</span>
          </div>
        </div>

        {/* Anchored Vessel Intelligence Card */}
        {showVesselCard && (
          <div className="absolute top-16 right-3 sm:right-6 z-20 w-72 sm:w-80 bg-black/95 border border-white/15 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between border-b border-white/10 pb-2 mb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono-code text-white">
                    {vesselName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold bg-red-950/80 text-red-300 border border-red-500/40">
                    {incidentStatus}
                  </span>
                </div>
                <p className="text-[10px] font-mono-code text-white/50 mt-0.5">
                  {vesselImo} • MMSI {vesselMmsi}
                </p>
              </div>
              <button
                onClick={() => setShowVesselCard(false)}
                className="text-white/50 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
                title="Dismiss Card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-code mb-2.5">
              <div className="bg-white/[0.03] p-2 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[9px]">AI CONFIDENCE</span>
                <span className="text-white font-bold text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {confidenceScore}%
                </span>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[9px]">SLICK EXTENT</span>
                <span className="text-amber-400 font-bold text-xs">
                  {characteristics.estimatedAreaKm2} km²
                </span>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[9px]">DETECTION TIME</span>
                <span className="text-white/80 font-medium truncate block">
                  {detectionTime}
                </span>
              </div>
              <div className="bg-white/[0.03] p-2 rounded-lg border border-white/10">
                <span className="text-white/40 block text-[9px]">DRIFT DYNAMICS</span>
                <span className="text-emerald-400 font-medium">
                  {driftSpeed} kts @ {driftHeading}°
                </span>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-2 text-[10px] font-mono-code text-red-200/90 leading-tight">
              <span className="font-bold text-red-300">⚠️ Discharge Breach Point:</span>
              <span className="block text-white/70 mt-0.5">
                Casualty hull confirmed at spill epicenter. Concentrated red-orange thermal slick radiating along prevailing surface current.
              </span>
            </div>
          </div>
        )}

        {/* Bottom-Left: Restricted Zoom Range Scale & Tactical HUD */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="bg-black/90 border border-white/15 rounded-lg px-2.5 py-1 text-[10px] font-mono-code text-white/70 flex items-center gap-3 shadow-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-1 bg-white" />
              <span>1.0 KM</span>
            </div>
            <span className="text-white/20">|</span>
            <span>ZOOM: {currentZoom.toFixed(1)}x</span>
            <span className="text-white/20">|</span>
            <span className="text-white">FOCUSED RANGE [11.5x - 17.5x]</span>
          </div>

          {/* Toggle Layers Bar */}
          <div className="flex items-center gap-1 bg-black/90 border border-white/15 rounded-lg p-1 text-[10px] font-mono-code">
            <button
              onClick={() => setShowBoundary(!showBoundary)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                showBoundary ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Boundary
            </button>
            <button
              onClick={() => setShowTrajectory(!showTrajectory)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                showTrajectory ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Drift Vector
            </button>
          </div>
        </div>

        {/* Bottom-Right: Map Zoom & Navigation Controls */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/90 border border-white/15 p-1 rounded-xl shadow-xl">
          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            title="Zoom In Closer"
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-reset-vessel"
            onClick={handleRecenter}
            title="Reset to Vessel Focal Point"
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-white/15 mx-0.5" />
          <button
            id="btn-fullscreen-sat"
            onClick={() => setIsFullscreenModal(true)}
            title="Full-Swath Scene Inspection"
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Info Bar & Heatmap Legend */}
      <div className="p-3 sm:p-4 bg-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code text-white/60">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-white/60">Thermal Heatmap Tiers:</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-400" />
              Core Breach (&gt;200 µm)
            </span>
            <span className="flex items-center gap-1 text-[10px] text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300" />
              Intermediate (10–200 µm)
            </span>
            <span className="flex items-center gap-1 text-[10px] text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200" />
              Outer Sheen (0.1–10 µm)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/60">
          <span>Active Layer:</span>
          <span className="text-white font-bold">
            {satelliteSource === 'SENTINEL_1_SAR' && 'Sentinel-1 SAR Radar'}
            {satelliteSource === 'SENTINEL_2_EO' && 'Sentinel-2 Optical EO'}
            {satelliteSource === 'COMPOSITE' && 'Satellite Composite Multi-Sensor'}
          </span>
        </div>
      </div>

      {/* Fullscreen High-Resolution Inspection Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 sm:p-8 backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-white font-mono-code">
            <div className="flex items-center gap-3">
              <Satellite className="w-5 h-5 text-white/80" />
              <span className="font-bold text-sm sm:text-base">
                FULL SCENE SATELLITE INSPECTION • {satellite.satelliteName} ({incidentId})
              </span>
            </div>
            <button
              onClick={() => setIsFullscreenModal(false)}
              className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden my-4 bg-black border border-white/10 rounded-xl p-4">
            <div className="text-center max-w-lg">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-white/15 flex items-center justify-center mb-4 text-white">
                <Satellite className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-base font-bold font-mono-code text-white mb-2">
                10-METER RADAR CALIBRATION SCENE
              </h3>
              <p className="text-xs text-white/60 font-mono-code mb-4 leading-relaxed">
                Full-swath SAR Interferometric Wide scene loaded. Detected slick boundary covers 
                <span className="text-white font-bold"> {characteristics.estimatedAreaKm2} km²</span> surrounding casualty vessel 
                <span className="text-white font-bold"> {vesselName}</span> at coordinates 
                <span className="text-white"> {vesselLat.toFixed(4)}° N, {vesselLng.toFixed(4)}° E</span>. Ocean capillary wave suppression confirmed with {confidenceScore}% AI confidence index.
              </p>
              <div className="inline-flex gap-2">
                <button
                  onClick={() => setIsFullscreenModal(false)}
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs font-mono-code hover:bg-neutral-200 cursor-pointer shadow-lg"
                >
                  Return to Incident Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
