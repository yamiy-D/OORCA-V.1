/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  SimulationResult, 
  SimulationParameters,
} from '../../types/simulation';
import { DEFAULT_CARTO_API_KEY, getCartoApiKey } from '../../services/mapService';
import { 
  generateNearHullSlick, 
  generateContainmentBoom 
} from '../../utils/simulationCalculations';
import {
  generateDynamicOceanSlick,
} from '../../utils/oceanSlickModel';
import { getVesselHeatmapSvgHtml } from '../../utils/vesselHeatmapGraphic';
// STEP 1: GFW Apparent Fishing Effort Service & Icons
import { 
  getGfwApparentFishingEffort, 
  GfwFishingEffortData, 
  GfwFishingEffortCell 
} from '../../services/api/gfwService';
import { 
  Fish, 
  AlertCircle, 
  X as CloseIcon,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
// STEP 1.1: Maritime Geographic Land Check (Avoid vessel to locate over land)
import { isLandLocation, snapToNearestWater } from '../../utils/geoValidation';

/**
 * Generates a smooth GeoJSON Polygon approximating a circle on Earth's curved surface.
 * @param lng - Longitude in degrees
 * @param lat - Latitude in degrees
 * @param radiusMeters - Radius in meters
 * @param points - Number of coordinate points (default 64 for smooth circle)
 */
export function createCircle(
  lng: number,
  lat: number,
  radiusMeters: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const km = radiusMeters / 1000;
  const distanceRadians = km / 6371.0088; // Earth's mean radius in km
  const centerLatRadians = (lat * Math.PI) / 180;
  const centerLngRadians = (lng * Math.PI) / 180;

  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const latPointRadians = Math.asin(
      Math.sin(centerLatRadians) * Math.cos(distanceRadians) +
      Math.cos(centerLatRadians) * Math.sin(distanceRadians) * Math.cos(angle)
    );
    const lngPointRadians = centerLngRadians + Math.atan2(
      Math.sin(angle) * Math.sin(distanceRadians) * Math.cos(centerLatRadians),
      Math.cos(distanceRadians) - Math.sin(centerLatRadians) * Math.sin(latPointRadians)
    );
    coords.push([
      (lngPointRadians * 180) / Math.PI,
      (latPointRadians * 180) / Math.PI,
    ]);
  }

  return {
    type: 'Feature',
    properties: {
      radiusMeters,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

/**
 * Pre-defined coastal settlements along the operational corridor.
 */
const COASTAL_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, isMajor: true },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, isMajor: false },
  { name: 'Alibaug', lat: 18.6584, lng: 72.8777, isMajor: false },
  { name: 'Murud', lat: 18.3300, lng: 72.9600, isMajor: false },
  { name: 'Roha', lat: 18.2300, lng: 73.1200, isMajor: false },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, isMajor: true },
];

/**
 * Ocean current flowlines (curved trajectories in Arabian Sea / coastal corridor).
 */
const CURRENT_STREAMLINES: [number, number][][] = [
  [[72.40, 18.50], [72.65, 18.58], [72.90, 18.68]],
  [[72.35, 18.65], [72.60, 18.75], [72.88, 18.86]],
  [[72.30, 18.80], [72.58, 18.90], [72.84, 19.00]],
  [[72.35, 18.95], [72.65, 19.05], [72.92, 19.15]],
  [[72.45, 18.35], [72.70, 18.45], [72.95, 18.56]],
  [[72.50, 18.20], [72.75, 18.30], [73.00, 18.40]],
];

/**
 * Self-contained MapLibre Style Specification.
 * Guarantees zero external network JSON/glyph blocking, instant WebGL initialization,
 * and reliable multi-basemap switching (Dark Maritime, Satellite Ocean, Ocean Basemap).
 */
const activeCartoKey = getCartoApiKey() || DEFAULT_CARTO_API_KEY;
const cartoKeyParam = `?key=${encodeURIComponent(activeCartoKey)}`;

const MAP_BASE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'dark-tiles': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${cartoKeyParam}`,
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    'voyager-tiles': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`,
        `https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`,
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri World Imagery',
    },
    'ocean-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri Ocean Basemap',
    },
  },
  layers: [
    {
      id: 'layer-dark',
      type: 'raster',
      source: 'dark-tiles',
      minzoom: 0,
      maxzoom: 20,
      layout: { visibility: 'visible' },
      paint: { 'raster-opacity': 1.0 },
    },
    {
      id: 'layer-voyager',
      type: 'raster',
      source: 'voyager-tiles',
      minzoom: 0,
      maxzoom: 20,
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 1.0 },
    },
    {
      id: 'layer-satellite',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 19,
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 1.0 },
    },
    {
      id: 'layer-ocean',
      type: 'raster',
      source: 'ocean-tiles',
      minzoom: 0,
      maxzoom: 14,
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 1.0 },
    },
  ],
};

export interface SimulationMapProps {
  // Core user requirements
  spillLocation?: {
    lat: number;
    lng: number;
  } | null;
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
  }) => void;
  simulationActive?: boolean;
  affectedRadius?: number;
  flyToLocation?: {
    lat: number;
    lng: number;
  } | null;

  // Extended OORCA platform props
  simulationResult?: SimulationResult | null;
  parameters?: SimulationParameters;
  onMapClickLocation?: (lat: number, lng: number) => void;
  currentLayerId?: string;
  showWind?: boolean;
  showWaves?: boolean;
  zoomAction?: number;
  zoomOutAction?: number;
  focusCoords?: [number, number] | null;
  onOpenParameters?: () => void;
  showBooms?: boolean;
  showLiveParticles?: boolean;

  // Dynamic Ocean-Surface Oil Slick & Seepage Props
  showOceanSlick?: boolean;
  onToggleOceanSlick?: (show: boolean) => void;
  showHighZone?: boolean;
  onToggleHighZone?: (show: boolean) => void;
  showMediumZone?: boolean;
  onToggleMediumZone?: (show: boolean) => void;
  showLowZone?: boolean;
  onToggleLowZone?: (show: boolean) => void;
  seepageRate?: number;
  onSeepageRateChange?: (rate: number) => void;
  currentHour?: number;
  isPlaying?: boolean;
  playbackSpeed?: number;

  // STEP 2: GFW Apparent Fishing Effort Overlay Props
  showFishingEffort?: boolean;
  onToggleFishingEffort?: (show: boolean) => void;

  // STEP 2.5: Interactive Maritime Map Pinpointing Props (Avoid vessel to locate over land)
  isPinpointMode?: boolean;
  onPinpointLocation?: (lat: number, lng: number) => void;
  onCancelPinpoint?: () => void;
}

export function SimulationMap({
  spillLocation,
  onLocationSelect,
  simulationActive = true,
  affectedRadius = 50000,
  flyToLocation,
  simulationResult,
  parameters,
  onMapClickLocation,
  currentLayerId = 'dark',
  showWind = false,
  showWaves = false,
  zoomAction = 0,
  zoomOutAction = 0,
  focusCoords,
  onOpenParameters,
  showBooms = true,
  showLiveParticles = true,
  showOceanSlick: showOceanSlickProp,
  onToggleOceanSlick,
  showHighZone: showHighZoneProp,
  onToggleHighZone,
  showMediumZone: showMediumZoneProp,
  onToggleMediumZone,
  showLowZone: showLowZoneProp,
  onToggleLowZone,
  seepageRate: seepageRateProp,
  onSeepageRateChange,
  currentHour,
  isPlaying = false,
  playbackSpeed = 1,
  showFishingEffort: showFishingEffortProp,
  onToggleFishingEffort,
  isPinpointMode = false,
  onPinpointLocation,
  onCancelPinpoint,
}: SimulationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [webGlError, setWebGlError] = useState<string | null>(null);

  // Dynamic Ocean-Surface Oil Slick & Seepage States
  const [isOceanSlickVisible, setIsOceanSlickVisible] = useState<boolean>(showOceanSlickProp ?? true);
  const [isHighZoneVisible, setIsHighZoneVisible] = useState<boolean>(showHighZoneProp ?? true);
  const [isMediumZoneVisible, setIsMediumZoneVisible] = useState<boolean>(showMediumZoneProp ?? true);
  const [isLowZoneVisible, setIsLowZoneVisible] = useState<boolean>(showLowZoneProp ?? true);
  const animPhaseRef = useRef<number>(0);
  const lastSlickUpdateRef = useRef<number>(0);
  const activeSeepageRate = seepageRateProp ?? parameters?.spillDetails.seepageRateTonnesPerHour ?? 0;

  // STEP 3: GFW Apparent Fishing Effort (AFE) Layer States
  const [isFishingEffortVisible, setIsFishingEffortVisible] = useState<boolean>(showFishingEffortProp ?? false);
  const [fishingEffortData, setFishingEffortData] = useState<GfwFishingEffortData | null>(null);
  const [selectedEffortCell, setSelectedEffortCell] = useState<GfwFishingEffortCell | null>(null);

  // STEP 3.1: Interactive Map Pinpoint States & Land Exclusion Feedback
  const [landWarningToast, setLandWarningToast] = useState<{ message: string; lat: number; lng: number } | null>(null);
  const [pinpointSuccessToast, setPinpointSuccessToast] = useState<string | null>(null);
  const [pinpointBeacon, setPinpointBeacon] = useState<{ lat: number; lng: number } | null>(null);

  // STEP 3.2: Map Pinpoint Mode Effect (Avoid vessel to locate over land)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (isPinpointMode) {
      map.getCanvas().style.cursor = 'crosshair';

      const handlePinpointClick = (e: maplibregl.MapMouseEvent) => {
        const { lat, lng } = e.lngLat;
        const roundedLat = Number(lat.toFixed(4));
        const roundedLng = Number(lng.toFixed(4));

        // CRITICAL CHECK: Verify if coordinates fall on land
        if (isLandLocation(roundedLat, roundedLng)) {
          // Check if snap to nearest water is available
          const nearestWater = snapToNearestWater(roundedLat, roundedLng, 0.4);

          setLandWarningToast({
            message: `Terrestrial landmass detected at ${roundedLat}°N, ${roundedLng}°E! Vessels cannot operate on land. Please click within maritime ocean or sea waters.${
              nearestWater.snapped
                ? ` (Nearest open ocean detected ~${nearestWater.distanceKm} km away at ${nearestWater.lat}°N, ${nearestWater.lng}°E)`
                : ''
            }`,
            lat: roundedLat,
            lng: roundedLng,
          });
          setTimeout(() => setLandWarningToast(null), 5000);
          return;
        }

        // Coordinates are verified maritime water
        setLandWarningToast(null);
        setPinpointBeacon({ lat: roundedLat, lng: roundedLng });
        setTimeout(() => setPinpointBeacon(null), 3000);

        setPinpointSuccessToast(`Location fed from map: ${roundedLat}°N, ${roundedLng}°E (Maritime Water Verified)`);
        setTimeout(() => setPinpointSuccessToast(null), 3000);

        if (onPinpointLocation) {
          onPinpointLocation(roundedLat, roundedLng);
        } else if (onMapClickLocation) {
          onMapClickLocation(roundedLat, roundedLng);
        }
      };

      map.on('click', handlePinpointClick);
      return () => {
        map.off('click', handlePinpointClick);
        if (map.getCanvas()) {
          map.getCanvas().style.cursor = '';
        }
      };
    } else {
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    }
  }, [mapLoaded, isPinpointMode, onPinpointLocation, onMapClickLocation]);

  // Synchronize internal fishing effort state with prop
  useEffect(() => {
    if (showFishingEffortProp !== undefined) {
      setIsFishingEffortVisible(showFishingEffortProp);
    }
  }, [showFishingEffortProp]);

  // Sync state if props change
  useEffect(() => {
    if (showOceanSlickProp !== undefined) setIsOceanSlickVisible(showOceanSlickProp);
  }, [showOceanSlickProp]);

  useEffect(() => {
    if (showHighZoneProp !== undefined) setIsHighZoneVisible(showHighZoneProp);
  }, [showHighZoneProp]);

  useEffect(() => {
    if (showMediumZoneProp !== undefined) setIsMediumZoneVisible(showMediumZoneProp);
  }, [showMediumZoneProp]);

  useEffect(() => {
    if (showLowZoneProp !== undefined) setIsLowZoneVisible(showLowZoneProp);
  }, [showLowZoneProp]);

  // Markers refs
  const vesselMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cityMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Lagrangian dynamic oil droplet particle animation refs
  const particleAnimRef = useRef<number | null>(null);
  const particlesStateRef = useRef<Array<{
    progress: number;
    speed: number;
    lateralFactor: number;
    baseSize: number;
  }>>([]);

  // Sync hidden reference video playback state with timeline isPlaying and playbackSpeed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.playbackRate = Math.max(0.25, Math.min(4, playbackSpeed));
      video.play().catch(() => {
        // Safe catch for environment background media autoplay constraints
      });
    } else {
      video.pause();
    }
  }, [isPlaying, playbackSpeed]);

  // Synchronize hidden reference video timeline scrub position (0-72h)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : 7.2;
    const progress = Math.max(0, Math.min(72, currentHour ?? 0)) / 72;
    const targetTime = progress * dur;

    if (Math.abs(video.currentTime - targetTime) > 0.08) {
      video.currentTime = targetTime;
    }
  }, [currentHour]);

  // Initialize random particle distribution
  useEffect(() => {
    if (particlesStateRef.current.length === 0) {
      const arr = [];
      for (let i = 0; i < 45; i++) {
        arr.push({
          progress: Math.random(),
          speed: 0.75 + Math.random() * 0.5,
          lateralFactor: (Math.random() - 0.5) * 1.6,
          baseSize: 3.5 + Math.random() * 2,
        });
      }
      particlesStateRef.current = arr;
    }
  }, []);

  // Active coordinates resolution
  const activeLat = spillLocation?.lat ?? parameters?.location.latitude ?? 18.9076;
  const activeLng = spillLocation?.lng ?? parameters?.location.longitude ?? 72.8777;

  // 1. Initialize MapLibre GL Map (Runs once on mount)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialLng = activeLng;
      const initialLat = activeLat;

      // Professional intelligence-platform configuration
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_BASE_STYLE,
        center: [initialLng, initialLat],
        zoom: 7.2,
        minZoom: 2,
        maxZoom: 18,
        pitch: 15,
        bearing: 0,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Error guard
      map.on('error', (e) => {
        // Tile 404s on deep zoom are expected on edge ocean areas
        if (e.error?.message?.includes('404')) return;
        console.warn('[MapLibre GL Notice]', e);
      });

      // Add navigation controls (Zoom, Compass, Pitch Visualization) to top-right
      const navControl = new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      });
      map.addControl(navControl, 'top-right');

      // Scale control at bottom-left
      const scaleControl = new maplibregl.ScaleControl({
        maxWidth: 140,
        unit: 'metric',
      });
      map.addControl(scaleControl, 'bottom-left');

      map.on('load', () => {
        setMapLoaded(true);
        // Force canvas geometry calculation
        map.resize();
      });

      // Capture cursor coordinates for tactical HUD
      map.on('mousemove', (e) => {
        setCursorCoords({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        });
      });

      // Immediate resize check
      const resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      }, 100);

      return () => {
        clearTimeout(resizeTimer);
        cityMarkersRef.current.forEach((m) => m.remove());
        cityMarkersRef.current = [];
        if (vesselMarkerRef.current) {
          vesselMarkerRef.current.remove();
          vesselMarkerRef.current = null;
        }
        map.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      };
    } catch (err: any) {
      console.error('[MapLibre Initialization Error]:', err);
      setWebGlError(err?.message || 'WebGL initialization error');
    }
  }, []);

  // 2. Container ResizeObserver for seamless adaptation to layout changes
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

  // 3. Register Core Dynamic GeoJSON Sources & Layers once map is loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Helper: Safely add GeoJSON source if it doesn't already exist
    const ensureSource = (id: string, initialData: GeoJSON.GeoJSON) => {
      if (!map.getSource(id)) {
        map.addSource(id, {
          type: 'geojson',
          data: initialData,
        });
      }
    };

    // Helper: Safely add layer if it doesn't already exist
    const ensureLayer = (layerDef: maplibregl.LayerSpecification) => {
      if (!map.getLayer(layerDef.id)) {
        map.addLayer(layerDef);
      }
    };

    // 1. Ocean Currents Source & Layer
    const currentsFeatureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: CURRENT_STREAMLINES.map((coords, i) => ({
        type: 'Feature',
        id: `current-${i}`,
        properties: { name: 'Coastal Current' },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      })),
    };
    ensureSource('ocean-currents', currentsFeatureCollection);
    ensureLayer({
      id: 'ocean-currents-lines',
      type: 'line',
      source: 'ocean-currents',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1.2,
        'line-opacity': 0.3,
        'line-dasharray': [4, 4],
      },
    });

    // 2. Dynamic Ocean-Surface Oil Slick Visualization (Smooth organic irregular shapes with 3 concentration zones)
    // 2a. Zone 3: Low Concentration Iridescent Sheen (Light, fragmented traces dispersing into ocean)
    ensureSource('ocean-slick-low', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'ocean-slick-low-glow',
      type: 'line',
      source: 'ocean-slick-low',
      paint: {
        'line-color': '#f97316',
        'line-width': 8.0,
        'line-blur': 5.0,
        'line-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.35 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-low-fill',
      type: 'fill',
      source: 'ocean-slick-low',
      paint: {
        'fill-color': '#fb923c',
        'fill-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.38 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-low-line',
      type: 'line',
      source: 'ocean-slick-low',
      paint: {
        'line-color': '#fdba74',
        'line-width': 1.2,
        'line-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.70 : 0,
      },
    });

    // 2b. Detached Fragmented Sheen Patches & Wisps (Light orange sheen broken off by wave action)
    ensureSource('ocean-slick-fragmented', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'ocean-slick-fragmented-glow',
      type: 'line',
      source: 'ocean-slick-fragmented',
      paint: {
        'line-color': '#f97316',
        'line-width': 4.0,
        'line-blur': 3.0,
        'line-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.35 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-fragmented-fill',
      type: 'fill',
      source: 'ocean-slick-fragmented',
      paint: {
        'fill-color': ['coalesce', ['get', 'colorHex'], '#fb923c'],
        'fill-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? ['coalesce', ['get', 'fillOpacity'], 0.36] : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-fragmented-line',
      type: 'line',
      source: 'ocean-slick-fragmented',
      paint: {
        'line-color': ['coalesce', ['get', 'edgeColorHex'], '#fdba74'],
        'line-width': 1.0,
        'line-opacity': isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.75 : 0,
      },
    });

    // 2c. Zone 2: Medium Concentration Emulsion (Vibrant Orange Mousse spreading outward)
    ensureSource('ocean-slick-medium', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'ocean-slick-medium-glow',
      type: 'line',
      source: 'ocean-slick-medium',
      paint: {
        'line-color': '#ea580c',
        'line-width': 6.0,
        'line-blur': 4.0,
        'line-opacity': isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.48 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-medium-fill',
      type: 'fill',
      source: 'ocean-slick-medium',
      paint: {
        'fill-color': '#ea580c',
        'fill-opacity': isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.72 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-medium-line',
      type: 'line',
      source: 'ocean-slick-medium',
      paint: {
        'line-color': '#f97316',
        'line-width': 1.8,
        'line-opacity': isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.85 : 0,
      },
    });

    // 2d. Zone 1: High Concentration Core (Concentrated Red, dense viscous crude directly at ship hull)
    ensureSource('ocean-slick-high', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'ocean-slick-high-glow',
      type: 'line',
      source: 'ocean-slick-high',
      paint: {
        'line-color': '#dc2626',
        'line-width': 5.0,
        'line-blur': 3.0,
        'line-opacity': isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.75 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-high-fill',
      type: 'fill',
      source: 'ocean-slick-high',
      paint: {
        'fill-color': '#dc2626',
        'fill-opacity': isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.94 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-high-sheen',
      type: 'line',
      source: 'ocean-slick-high',
      paint: {
        'line-color': '#f87171',
        'line-width': 2.2,
        'line-opacity': isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.90 : 0,
      },
    });

    // 2e. Breached Tank Rupture Continuous Emitter Stream (Concentrated Red Jet)
    ensureSource('ocean-slick-breach-jet', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'ocean-slick-breach-jet-fill',
      type: 'fill',
      source: 'ocean-slick-breach-jet',
      paint: {
        'fill-color': '#b91c1c',
        'fill-opacity': isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.96 : 0,
      },
    });
    ensureLayer({
      id: 'ocean-slick-breach-jet-line',
      type: 'line',
      source: 'ocean-slick-breach-jet',
      paint: {
        'line-color': '#f87171',
        'line-width': 1.6,
        'line-opacity': isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.95 : 0,
      },
    });

    // 2f. Containment Booms Protective Barrier Layer
    ensureSource('containment-booms', {
      type: 'FeatureCollection',
      features: [],
    });

    ensureLayer({
      id: 'containment-booms-glow',
      type: 'line',
      source: 'containment-booms',
      paint: {
        'line-color': '#ea580c',
        'line-width': 6.0,
        'line-opacity': 0.35,
      },
    });

    ensureLayer({
      id: 'containment-booms-line',
      type: 'line',
      source: 'containment-booms',
      paint: {
        'line-color': '#facc15',
        'line-width': 3.5,
        'line-dasharray': [3, 2],
        'line-opacity': 0.95,
      },
    });

    // 3. Multi-tier Plume Concentration Contours (OpenDrift Physical Model)
    ensureSource('plume-contours', {
      type: 'FeatureCollection',
      features: [],
    });

    ensureLayer({
      id: 'plume-contours-fill',
      type: 'fill',
      source: 'plume-contours',
      paint: {
        'fill-color': ['coalesce', ['get', 'colorHex'], '#ea580c'],
        'fill-opacity': 0, // Keep 0 to let the vibrant high/medium/low ocean-slick layers render with full clarity
      },
    });

    ensureLayer({
      id: 'plume-contours-outline',
      type: 'line',
      source: 'plume-contours',
      paint: {
        'line-color': ['coalesce', ['get', 'colorHex'], '#f97316'],
        'line-width': ['case', ['==', ['coalesce', ['get', 'level'], ''], 'Very Thick'], 2.0, 1.0],
        'line-opacity': 0.65,
        'line-dasharray': [4, 2],
      },
    });

    // 3b. Lagrangian Dynamic Oil Droplet Particles Layer
    ensureSource('oil-particles', {
      type: 'FeatureCollection',
      features: [],
    });

    ensureLayer({
      id: 'oil-particles-layer',
      type: 'circle',
      source: 'oil-particles',
      paint: {
        'circle-radius': ['coalesce', ['get', 'radius'], 4.0],
        'circle-color': ['coalesce', ['get', 'color'], '#180808'],
        'circle-opacity': ['coalesce', ['get', 'opacity'], 0.85],
        'circle-stroke-color': ['coalesce', ['get', 'strokeColor'], '#b45309'],
        'circle-stroke-width': 1.0,
      },
    });

    // 4. Trajectory Axis Line
    ensureSource('trajectory-line', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'trajectory-axis',
      type: 'line',
      source: 'trajectory-line',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1.8,
        'line-dasharray': [4, 4],
        'line-opacity': 0.85,
      },
    });

    // 5. Environmental Wind / Waves Grid Source & Layer
    ensureSource('env-vectors', {
      type: 'FeatureCollection',
      features: [],
    });
    ensureLayer({
      id: 'env-vectors-points',
      type: 'circle',
      source: 'env-vectors',
      paint: {
        'circle-radius': 3.5,
        'circle-color': ['coalesce', ['get', 'color'], '#67e8f9'],
        'circle-opacity': 0.65,
      },
    });

    // 6. Oil Spill Source Marker (Kept empty to keep vessel perimeter clear)
    const initialSpillPoint: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    ensureSource('oil-spill', initialSpillPoint);

    ensureLayer({
      id: 'oil-spill-glow',
      type: 'circle',
      source: 'oil-spill',
      paint: {
        'circle-radius': 0,
        'circle-opacity': 0,
      },
    });

    ensureLayer({
      id: 'oil-spill-core',
      type: 'circle',
      source: 'oil-spill',
      paint: {
        'circle-radius': 0,
        'circle-opacity': 0,
      },
    });

    // =========================================================================
    // STEP 4: GFW Apparent Fishing Effort (AFE) 4Wings Source & Layers
    // =========================================================================
    ensureSource('gfw-apparent-fishing-effort', {
      type: 'FeatureCollection',
      features: [],
    });

    ensureLayer({
      id: 'gfw-fishing-effort-fill',
      type: 'fill',
      source: 'gfw-apparent-fishing-effort',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'apparentFishingHours'], 0],
          0, 'rgba(56, 189, 248, 0.05)',
          4, 'rgba(34, 197, 94, 0.35)',
          10, 'rgba(234, 179, 8, 0.55)',
          18, 'rgba(249, 115, 22, 0.70)',
          30, 'rgba(225, 29, 72, 0.85)',
        ],
        'fill-opacity': isFishingEffortVisible ? 0.65 : 0,
      },
    });

    ensureLayer({
      id: 'gfw-fishing-effort-line',
      type: 'line',
      source: 'gfw-apparent-fishing-effort',
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.8,
        'line-opacity': isFishingEffortVisible ? 0.25 : 0,
      },
    });

    // Interactive Click & Hover on Fishing Effort Grid
    map.on('click', 'gfw-fishing-effort-fill', (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties as any;
        if (props) {
          setSelectedEffortCell({
            id: props.id || 'gfw-cell',
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            apparentFishingHours: props.apparentFishingHours || 12.5,
            vesselCount: props.vesselCount || 3,
            primaryGearType: props.primaryGearType || 'Trawler',
            intensityLevel: props.intensityLevel || 'moderate',
            effortPerKm2: props.effortPerKm2 || 0.41,
            bounds: [[e.lngLat.lat - 0.025, e.lngLat.lng - 0.025], [e.lngLat.lat + 0.025, e.lngLat.lng + 0.025]],
          });
        }
      }
    });

    map.on('mouseenter', 'gfw-fishing-effort-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'gfw-fishing-effort-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    // 7. Render Coastal City Markers (Clean HTML Markers with pulse dots)
    cityMarkersRef.current.forEach((m) => m.remove());
    cityMarkersRef.current = [];

    COASTAL_CITIES.forEach((city) => {
      const el = document.createElement('div');
      el.className = 'custom-maplibre-city';
      el.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px; pointer-events: none; user-select: none;">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 5px rgba(255,255,255,0.8);"></div>
          <span style="color: #f8fafc; font-size: ${city.isMajor ? '12px' : '10px'}; font-weight: ${city.isMajor ? '700' : '500'}; font-family: sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9); letter-spacing: 0.5px;">
            ${city.name}
          </span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
        .setLngLat([city.lng, city.lat])
        .addTo(map);

      cityMarkersRef.current.push(marker);
    });

  }, [mapLoaded]);

  // 4. Oil Spill Source Marker kept empty to keep vessel clear
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('oil-spill') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [mapLoaded]);

  // 5. Initialize & Sync Dynamic Ocean-Surface Oil Slick Sources
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const highSource = map.getSource('ocean-slick-high') as maplibregl.GeoJSONSource | undefined;
    const medSource = map.getSource('ocean-slick-medium') as maplibregl.GeoJSONSource | undefined;
    const lowSource = map.getSource('ocean-slick-low') as maplibregl.GeoJSONSource | undefined;
    const fragSource = map.getSource('ocean-slick-fragmented') as maplibregl.GeoJSONSource | undefined;
    const jetSource = map.getSource('ocean-slick-breach-jet') as maplibregl.GeoJSONSource | undefined;

    if (simulationResult && simulationActive && isOceanSlickVisible) {
      const vesselLat = simulationResult.vesselPosition[0];
      const vesselLng = simulationResult.vesselPosition[1];
      const heading = parameters?.vesselDetails.heading ?? 45;
      const activeHour = currentHour !== undefined ? currentHour : (simulationResult.currentHour ?? 48);

      const slick = generateDynamicOceanSlick({
        originLat: vesselLat,
        originLng: vesselLng,
        vesselHeadingDeg: heading,
        envConditions: simulationResult.environmentalConditions,
        elapsedHours: activeHour,
        seepageRateTonnesPerHour: activeSeepageRate,
        initialTonnes: parameters?.spillDetails.amount ?? 100,
        animPhase: animPhaseRef.current,
      });

      if (highSource) highSource.setData(slick.highConcentration);
      if (medSource) medSource.setData(slick.mediumConcentration);
      if (lowSource) lowSource.setData(slick.lowConcentration);
      if (fragSource) fragSource.setData(slick.fragmentedPatches);
      if (jetSource) jetSource.setData(slick.breachJet);
    } else {
      const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
      if (highSource) highSource.setData(emptyFC);
      if (medSource) medSource.setData(emptyFC);
      if (lowSource) lowSource.setData(emptyFC);
      if (fragSource) fragSource.setData(emptyFC);
      if (jetSource) jetSource.setData(emptyFC);
    }
  }, [simulationResult, simulationActive, isOceanSlickVisible, parameters, activeSeepageRate, mapLoaded, currentHour]);

  // 6. Update Multi-tier Contours, Near-Hull Slick, Containment Booms, & Vessel Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const plumeSource = map.getSource('plume-contours') as maplibregl.GeoJSONSource | undefined;
    const trajectorySource = map.getSource('trajectory-line') as maplibregl.GeoJSONSource | undefined;
    const nearHullSource = map.getSource('near-hull-slick') as maplibregl.GeoJSONSource | undefined;
    const boomSource = map.getSource('containment-booms') as maplibregl.GeoJSONSource | undefined;

    if (simulationResult && simulationActive) {
      const vesselLat = simulationResult.vesselPosition[0];
      const vesselLng = simulationResult.vesselPosition[1];
      const heading = parameters?.vesselDetails.heading ?? 45;
      const driftHeading = simulationResult.environmentalConditions?.currentDirectionDeg ?? 135;
      const driftSpeed = simulationResult.environmentalConditions?.currentSpeedKts ?? 2.8;

      // 1. Plume contours
      if (plumeSource) {
        const contourFeatures: GeoJSON.Feature[] = simulationResult.contours.map((contour, index) => {
          // GeoJSON coordinates are [lng, lat]
          const ring = contour.points.map(([lat, lng]) => [lng, lat]);
          // Close the polygon if not already closed
          if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
            ring.push([ring[0][0], ring[0][1]]);
          }

          return {
            type: 'Feature',
            id: index,
            properties: {
              level: contour.level,
              thicknessMicrons: contour.thicknessMicrons,
              colorHex: contour.colorHex,
              fillOpacity: contour.fillOpacity,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [ring],
            },
          };
        });

        plumeSource.setData({
          type: 'FeatureCollection',
          features: contourFeatures,
        });
      }

      // 2. Near-hull slick removed to keep vessel perimeter completely clear
      if (nearHullSource) {
        nearHullSource.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }

      // 3. Containment Booms Protective Barrier
      if (boomSource) {
        if (showBooms) {
          const boomPoints = generateContainmentBoom(vesselLat, vesselLng, driftHeading);
          const boomCoords = boomPoints.map(([lat, lng]) => [lng, lat]);
          boomSource.setData({
            type: 'Feature',
            properties: { type: 'Deflection Boom' },
            geometry: {
              type: 'LineString',
              coordinates: boomCoords,
            },
          });
        } else {
          boomSource.setData({ type: 'FeatureCollection', features: [] });
        }
      }

      // 4. Trajectory Axis Line
      if (trajectorySource) {
        const coords = (simulationResult.trajectoryCoordinates && simulationResult.trajectoryCoordinates.length > 1)
          ? simulationResult.trajectoryCoordinates
          : [
              [vesselLng, vesselLat],
              [simulationResult.spillOrigin[1], simulationResult.spillOrigin[0]],
              [simulationResult.slickCentroid[1], simulationResult.slickCentroid[0]],
            ];

        trajectorySource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        });
      }

      // 5. Rich Aframax Tanker Vessel Marker with Leak Emitter & Dynamic Heatmap
      const activeHour = currentHour !== undefined ? currentHour : (simulationResult.currentHour ?? 48);
      const progress = Math.max(0, Math.min(1, activeHour / 72));

      const vesselName = parameters?.vesselDetails.vesselName ?? 'MV Oceanic Star';
      const vesselType = parameters?.vesselDetails.vesselType ?? 'Aframax Crude Tanker';
      const imoNumber = parameters?.vesselDetails.imoNumber ?? '9732548';
      const amount = parameters?.spillDetails.amount ?? 100;
      const amountUnit = parameters?.spillDetails.amountUnit ?? 'Tonnes';

      const popupHtml = `
        <div style="min-width: 220px; font-family: sans-serif; font-size: 11px; color: #f8fafc; line-height: 1.5;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <span style="color: #ffffff; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">${vesselName}</span>
              <div style="color: rgba(255,255,255,0.6); font-size: 10px; font-family: monospace;">IMO ${imoNumber} • ${vesselType}</div>
            </div>
            <span style="background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700;">CASUALTY SOURCE</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-bottom: 8px; font-family: monospace;">
            <div style="background: rgba(255,255,255,0.04); padding: 4px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: rgba(255,255,255,0.5);">DISCHARGED:</span><br/>
              <strong style="color: #f59e0b;">${amount} ${amountUnit}</strong>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 4px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: rgba(255,255,255,0.5);">TIMELINE STAGE:</span><br/>
              <strong style="color: #ffffff;">+${Math.round(activeHour)}h (${(progress * 100).toFixed(0)}%)</strong>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 4px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: rgba(255,255,255,0.5);">HEADING:</span><br/>
              <strong style="color: #ffffff;">${heading}°</strong>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 4px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: rgba(255,255,255,0.5);">DRIFT VECTOR:</span><br/>
              <strong style="color: #34d399;">${driftHeading}° @ ${driftSpeed} kts</strong>
            </div>
          </div>

          <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 5px 8px; font-size: 10px; margin-bottom: 6px;">
            <span style="color: #fca5a5; font-weight: 600;">⚠️ Casualty Incident:</span>
            <div style="color: rgba(255,255,255,0.8); font-size: 9.5px;">Portside Cargo Tank #3 ruptured. Active continuous heavy crude release forming thermal dispersion heatmap.</div>
          </div>
        </div>
      `;

      if (vesselMarkerRef.current) {
        // Move vessel smoothly along simulation drift trajectory
        vesselMarkerRef.current.setLngLat([vesselLng, vesselLat]);
        const el = vesselMarkerRef.current.getElement();
        if (el) {
          el.innerHTML = getVesselHeatmapSvgHtml(heading, 220, 130, progress, animPhaseRef.current);
        }
        const popup = vesselMarkerRef.current.getPopup();
        if (popup) popup.setHTML(popupHtml);
      } else {
        const vesselEl = document.createElement('div');
        vesselEl.className = 'custom-maplibre-vessel-wrapper';
        vesselEl.innerHTML = getVesselHeatmapSvgHtml(heading, 220, 130, progress, animPhaseRef.current);

        const popup = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '290px' }).setHTML(popupHtml);

        vesselMarkerRef.current = new maplibregl.Marker({ element: vesselEl, anchor: 'center' })
          .setLngLat([vesselLng, vesselLat])
          .setPopup(popup)
          .addTo(map);
      }

    } else {
      // Clear contours if simulation not active
      if (plumeSource) {
        plumeSource.setData({ type: 'FeatureCollection', features: [] });
      }
      if (nearHullSource) {
        nearHullSource.setData({ type: 'FeatureCollection', features: [] });
      }
      if (boomSource) {
        boomSource.setData({ type: 'FeatureCollection', features: [] });
      }
      if (trajectorySource) {
        trajectorySource.setData({ type: 'FeatureCollection', features: [] });
      }
      if (vesselMarkerRef.current) {
        vesselMarkerRef.current.remove();
        vesselMarkerRef.current = null;
      }
    }
  }, [simulationResult, simulationActive, parameters, mapLoaded, showBooms, currentHour]);

  // 6d. Dynamically update Ocean Slick Zones visibility opacities
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Ocean Slick Zone 3: Low Concentration & Sheen Fragments (Light Orange)
    const lowOpacity = isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.38 : 0;
    const lowGlowOpacity = isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.35 : 0;
    const lowLineOpacity = isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.70 : 0;
    if (map.getLayer('ocean-slick-low-fill')) map.setPaintProperty('ocean-slick-low-fill', 'fill-opacity', lowOpacity);
    if (map.getLayer('ocean-slick-low-glow')) map.setPaintProperty('ocean-slick-low-glow', 'line-opacity', lowGlowOpacity);
    if (map.getLayer('ocean-slick-low-line')) map.setPaintProperty('ocean-slick-low-line', 'line-opacity', lowLineOpacity);

    const fragOpacity = isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.36 : 0;
    if (map.getLayer('ocean-slick-fragmented-fill')) map.setPaintProperty('ocean-slick-fragmented-fill', 'fill-opacity', fragOpacity);
    if (map.getLayer('ocean-slick-fragmented-glow')) map.setPaintProperty('ocean-slick-fragmented-glow', 'line-opacity', fragOpacity);
    if (map.getLayer('ocean-slick-fragmented-line')) map.setPaintProperty('ocean-slick-fragmented-line', 'line-opacity', isOceanSlickVisible && isLowZoneVisible && simulationActive ? 0.75 : 0);

    // Ocean Slick Zone 2: Medium Concentration Emulsion (Vibrant Orange)
    const medOpacity = isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.72 : 0;
    const medGlowOpacity = isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.48 : 0;
    const medLineOpacity = isOceanSlickVisible && isMediumZoneVisible && simulationActive ? 0.85 : 0;
    if (map.getLayer('ocean-slick-medium-fill')) map.setPaintProperty('ocean-slick-medium-fill', 'fill-opacity', medOpacity);
    if (map.getLayer('ocean-slick-medium-glow')) map.setPaintProperty('ocean-slick-medium-glow', 'line-opacity', medGlowOpacity);
    if (map.getLayer('ocean-slick-medium-line')) map.setPaintProperty('ocean-slick-medium-line', 'line-opacity', medLineOpacity);

    // Ocean Slick Zone 1: High Concentration Core & Breach Jet (Concentrated Red)
    const highOpacity = isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.94 : 0;
    const highGlowOpacity = isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.75 : 0;
    const highSheenOpacity = isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.90 : 0;
    if (map.getLayer('ocean-slick-high-fill')) map.setPaintProperty('ocean-slick-high-fill', 'fill-opacity', highOpacity);
    if (map.getLayer('ocean-slick-high-glow')) map.setPaintProperty('ocean-slick-high-glow', 'line-opacity', highGlowOpacity);
    if (map.getLayer('ocean-slick-high-sheen')) map.setPaintProperty('ocean-slick-high-sheen', 'line-opacity', highSheenOpacity);

    const jetOpacity = isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.96 : 0;
    if (map.getLayer('ocean-slick-breach-jet-fill')) map.setPaintProperty('ocean-slick-breach-jet-fill', 'fill-opacity', jetOpacity);
    if (map.getLayer('ocean-slick-breach-jet-line')) map.setPaintProperty('ocean-slick-breach-jet-line', 'line-opacity', isOceanSlickVisible && isHighZoneVisible && simulationActive ? 0.95 : 0);
  }, [
    isOceanSlickVisible, 
    isHighZoneVisible, 
    isMediumZoneVisible, 
    isLowZoneVisible, 
    simulationActive, 
    mapLoaded
  ]);

  // 6b. Dynamic Living Fluid Loop: Undulating Ocean Slick Waves & Lagrangian Droplets
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !simulationActive || !simulationResult) {
      if (particleAnimRef.current) {
        cancelAnimationFrame(particleAnimRef.current);
        particleAnimRef.current = null;
      }
      const pSource = map?.getSource('oil-particles') as maplibregl.GeoJSONSource | undefined;
      if (pSource) pSource.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const pSource = map.getSource('oil-particles') as maplibregl.GeoJSONSource | undefined;
    const highSource = map.getSource('ocean-slick-high') as maplibregl.GeoJSONSource | undefined;
    const medSource = map.getSource('ocean-slick-medium') as maplibregl.GeoJSONSource | undefined;
    const lowSource = map.getSource('ocean-slick-low') as maplibregl.GeoJSONSource | undefined;
    const fragSource = map.getSource('ocean-slick-fragmented') as maplibregl.GeoJSONSource | undefined;
    const jetSource = map.getSource('ocean-slick-breach-jet') as maplibregl.GeoJSONSource | undefined;

    const vesselLat = simulationResult.vesselPosition[0];
    const vesselLng = simulationResult.vesselPosition[1];
    const vesselHeading = parameters?.vesselDetails.heading ?? 45;
    const driftHeading = simulationResult.environmentalConditions?.currentDirectionDeg ?? 135;
    const driftSpeed = simulationResult.environmentalConditions?.currentSpeedKts ?? 2.8;
    const driftRad = (driftHeading * Math.PI) / 180;
    const sinD = Math.sin(driftRad);
    const cosD = Math.cos(driftRad);
    const kmPerDegLat = 111.0;
    const kmPerDegLng = 111.0 * Math.cos((vesselLat * Math.PI) / 180);
    const activeHour = currentHour !== undefined ? currentHour : (simulationResult.currentHour ?? 48);
    const maxDriftKm = Math.min(120.0, 1.8 * Math.max(1, activeHour) * driftSpeed);

    let lastTime = performance.now();

    const renderSimulationLoop = (now: number) => {
      // If paused, freeze simulation loop and stop animation immediately
      if (!isPlaying) {
        if (particleAnimRef.current) {
          cancelAnimationFrame(particleAnimRef.current);
          particleAnimRef.current = null;
        }
        return;
      }

      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Advance fluid wave & swell oscillation phase
      animPhaseRef.current += dt * 1.5;

      // 2. Dynamically recompute and undulate the 3-zone ocean-surface slick polygons at smooth ~25 FPS
      if (now - lastSlickUpdateRef.current > 40) {
        lastSlickUpdateRef.current = now;
        if (isOceanSlickVisible) {
          const slick = generateDynamicOceanSlick({
            originLat: vesselLat,
            originLng: vesselLng,
            vesselHeadingDeg: vesselHeading,
            envConditions: simulationResult.environmentalConditions,
            elapsedHours: activeHour,
            seepageRateTonnesPerHour: activeSeepageRate,
            initialTonnes: parameters?.spillDetails.amount ?? 100,
            animPhase: animPhaseRef.current,
          });

          if (highSource) highSource.setData(slick.highConcentration);
          if (medSource) medSource.setData(slick.mediumConcentration);
          if (lowSource) lowSource.setData(slick.lowConcentration);
          if (fragSource) fragSource.setData(slick.fragmentedPatches);
          if (jetSource) jetSource.setData(slick.breachJet);
        }
      }

      // 3. Subtle Lagrangian micro-droplet particle dispersion
      if (showLiveParticles && pSource) {
        const features: GeoJSON.Feature[] = [];

        particlesStateRef.current.forEach((p, idx) => {
          p.progress += dt * 0.07 * p.speed;
          if (p.progress >= 1.0) {
            p.progress = 0;
            p.lateralFactor = (Math.random() - 0.5) * 1.6;
          }

          // Distance downstream along plume axis (starting cleanly downstream from vessel)
          const distKm = 2.4 + p.progress * Math.max(6.0, maxDriftKm);
          // Lateral expansion increases downstream
          const latWidthKm = (0.06 + 0.35 * Math.pow(p.progress, 0.68)) * p.lateralFactor;

          // Geographical position
          const dEastKm = distKm * sinD + latWidthKm * cosD;
          const dNorthKm = distKm * cosD - latWidthKm * sinD;

          const pLat = vesselLat + dNorthKm / kmPerDegLat;
          const pLng = vesselLng + dEastKm / kmPerDegLng;

          // Visual weathering progression: dense region (near source) is concentrated red, turning orange outward
          let color = '#dc2626';
          let strokeColor = '#f87171';
          const opacity = 0.95 * (1 - p.progress * 0.60);
          const radius = p.baseSize * (1 + p.progress * 0.85);

          if (p.progress > 0.60) {
            // Low concentration / outer boundary: light orange
            color = '#fb923c';
            strokeColor = '#fdba74';
          } else if (p.progress > 0.25) {
            // Medium concentration: vibrant orange
            color = '#ea580c';
            strokeColor = '#f97316';
          } else {
            // High concentration core near breach: concentrated red
            color = '#dc2626';
            strokeColor = '#f87171';
          }

          features.push({
            type: 'Feature',
            id: idx,
            properties: {
              radius,
              color,
              strokeColor,
              opacity,
            },
            geometry: {
              type: 'Point',
              coordinates: [pLng, pLat],
            },
          });
        });

        pSource.setData({
          type: 'FeatureCollection',
          features,
        });
      }

      particleAnimRef.current = requestAnimationFrame(renderSimulationLoop);
    };

    particleAnimRef.current = requestAnimationFrame(renderSimulationLoop);

    return () => {
      if (particleAnimRef.current) {
        cancelAnimationFrame(particleAnimRef.current);
        particleAnimRef.current = null;
      }
    };
  }, [simulationActive, showLiveParticles, isOceanSlickVisible, mapLoaded, simulationResult, parameters, activeSeepageRate, currentHour, isPlaying]);

  // STEP 7: Update Environmental Wind / Wave Field Overlay (Driven by OpenWeather Telemetry)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const envSource = map.getSource('env-vectors') as maplibregl.GeoJSONSource | undefined;
    if (!envSource) return;

    if (!showWind && !showWaves) {
      envSource.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features: GeoJSON.Feature[] = [];
    const color = showWind ? '#34d399' : '#38bdf8';
    
    // Coordinates centered on active spill location
    const centerLat = parameters?.location.latitude ?? 16.5;
    const centerLng = parameters?.location.longitude ?? 83.25;

    // Metocean live conditions
    const windSpeed = simulationResult?.environmentalConditions?.windSpeedKts ?? 14.5;
    const windDirDeg = simulationResult?.environmentalConditions?.windDirectionDeg ?? 225;

    // Atmospheric grid around spill
    const stepDeg = 0.12;
    for (let dLat = -0.48; dLat <= 0.48; dLat += stepDeg) {
      for (let dLng = -0.48; dLng <= 0.48; dLng += stepDeg) {
        const lat = centerLat + dLat;
        const lng = centerLng + dLng;
        features.push({
          type: 'Feature',
          properties: { 
            color,
            windSpeed,
            windDirDeg,
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      }
    }

    envSource.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [showWind, showWaves, mapLoaded, parameters?.location.latitude, parameters?.location.longitude, simulationResult?.environmentalConditions]);

  // 8. Handle External Camera Controls (flyToLocation / focusCoords / coordinate changes)
  const prevVesselCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const target = flyToLocation ?? (focusCoords ? { lat: focusCoords[0], lng: focusCoords[1] } : null);
    if (target) {
      const isShip = simulationResult && (
        Math.abs(target.lat - simulationResult.vesselPosition[0]) < 0.005 &&
        Math.abs(target.lng - simulationResult.vesselPosition[1]) < 0.005
      );

      map.flyTo({
        center: [target.lng, target.lat],
        zoom: isShip ? 14.8 : 10.5,
        pitch: isShip ? 35 : 15,
        duration: 1600,
        essential: true,
      });
      prevVesselCoordsRef.current = { lat: target.lat, lng: target.lng };
    }
  }, [flyToLocation, focusCoords, simulationResult]);

  // Smoothly center and focus map viewport when vessel is relocated via parameters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const currentLat = parameters?.location.latitude;
    const currentLng = parameters?.location.longitude;
    if (currentLat === undefined || currentLng === undefined) return;

    if (!prevVesselCoordsRef.current) {
      prevVesselCoordsRef.current = { lat: currentLat, lng: currentLng };
      return;
    }

    const hasChanged =
      Math.abs(prevVesselCoordsRef.current.lat - currentLat) > 0.0001 ||
      Math.abs(prevVesselCoordsRef.current.lng - currentLng) > 0.0001;

    if (hasChanged) {
      prevVesselCoordsRef.current = { lat: currentLat, lng: currentLng };
      map.flyTo({
        center: [currentLng, currentLat],
        zoom: Math.max(map.getZoom(), 8.2),
        duration: 1600,
        essential: true,
      });
    }
  }, [parameters?.location.latitude, parameters?.location.longitude, mapLoaded]);

  // 9. Handle Zoom In / Zoom Out Action triggers
  useEffect(() => {
    if (zoomAction > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  }, [zoomAction]);

  useEffect(() => {
    if (zoomOutAction > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  }, [zoomOutAction]);

  // 10. Handle Instant Basemap Layer Switching (Dark Maritime, Satellite Ocean, Ocean Basemap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const basemapLayers = [
      { key: 'dark', id: 'layer-dark' },
      { key: 'voyager', id: 'layer-voyager' },
      { key: 'satellite', id: 'layer-satellite' },
      { key: 'ocean', id: 'layer-ocean' },
    ];

    basemapLayers.forEach(({ key, id }) => {
      if (map.getLayer(id)) {
        const isVisible = (currentLayerId === key) || (key === 'dark' && !['voyager', 'satellite', 'ocean'].includes(currentLayerId));
        map.setLayoutProperty(id, 'visibility', isVisible ? 'visible' : 'none');
      }
    });
  }, [currentLayerId, mapLoaded]);

  // =========================================================================
  // STEP 5: Fetch & Populate GFW Apparent Fishing Effort (AFE) Data
  // =========================================================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const lat = parameters?.location.latitude || spillLocation.lat || 18.92;
    const lng = parameters?.location.longitude || spillLocation.lng || 72.83;

    getGfwApparentFishingEffort(lat, lng, 60).then((data) => {
      setFishingEffortData(data);
      const source = map.getSource('gfw-apparent-fishing-effort') as maplibregl.GeoJSONSource | undefined;
      if (source && data.geoJson) {
        source.setData(data.geoJson);
      }
    });
  }, [mapLoaded, parameters?.location.latitude, parameters?.location.longitude, spillLocation.lat, spillLocation.lng]);

  // Handle GFW Apparent Fishing Effort Layer Visibility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('gfw-fishing-effort-fill')) {
      map.setPaintProperty('gfw-fishing-effort-fill', 'fill-opacity', isFishingEffortVisible ? 0.65 : 0);
    }
    if (map.getLayer('gfw-fishing-effort-line')) {
      map.setPaintProperty('gfw-fishing-effort-line', 'line-opacity', isFishingEffortVisible ? 0.25 : 0);
    }
  }, [isFishingEffortVisible, mapLoaded]);

  const handleToggleOceanSlick = () => {
    const next = !isOceanSlickVisible;
    setIsOceanSlickVisible(next);
    if (onToggleOceanSlick) onToggleOceanSlick(next);
  };

  const handleToggleHighZone = () => {
    const next = !isHighZoneVisible;
    setIsHighZoneVisible(next);
    if (onToggleHighZone) onToggleHighZone(next);
  };

  const handleToggleMediumZone = () => {
    const next = !isMediumZoneVisible;
    setIsMediumZoneVisible(next);
    if (onToggleMediumZone) onToggleMediumZone(next);
  };

  const handleToggleLowZone = () => {
    const next = !isLowZoneVisible;
    setIsLowZoneVisible(next);
    if (onToggleLowZone) onToggleLowZone(next);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black select-none">
      {/* MapLibre WebGL Canvas Container */}
      <div 
        id="simulation-maplibre-canvas"
        ref={mapContainerRef} 
        className="w-full h-full relative z-0"
      />

      {/* WebGL Error Fallback Card if graphics context fails */}
      {webGlError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="max-w-md p-6 rounded-xl bg-neutral-950 border border-red-500/30 text-center shadow-2xl">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-base font-semibold text-white mb-2">WebGL Renderer Warning</h3>
            <p className="text-xs text-white/60 mb-4 font-mono-code">
              {webGlError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-xs font-semibold text-black shadow-lg transition-all"
            >
              Reload Map Canvas
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 6: GFW APPARENT FISHING EFFORT (AFE) FLOATING LEGEND & INSPECTOR
          ========================================================================= */}
      {isFishingEffortVisible && (
        <div 
          id="gfw-fishing-effort-hud"
          className="absolute top-16 right-4 z-20 w-72 rounded-xl bg-black/90 border border-cyan-500/40 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white font-geist text-xs animate-in fade-in duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Fish className="w-4 h-4 text-cyan-400" />
              <span className="font-bold font-mono-code uppercase text-[11px] tracking-wide text-cyan-300">
                GFW Fishing Effort
              </span>
            </div>
            <button
              onClick={() => {
                if (onToggleFishingEffort) onToggleFishingEffort(false);
                else setIsFishingEffortVisible(false);
              }}
              className="text-white/40 hover:text-white p-0.5"
              title="Close Fishing Effort Layer"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 my-2.5 font-mono-code">
            <div className="p-2 rounded bg-white/[0.03] border border-white/5">
              <div className="text-[9px] text-white/40 uppercase">Total Effort</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {fishingEffortData ? `${fishingEffortData.totalFishingHours} hrs` : '428.5 hrs'}
              </div>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5">
              <div className="text-[9px] text-white/40 uppercase">Active Fleet</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {fishingEffortData ? `${fishingEffortData.activeVesselCount} vessels` : '84 vessels'}
              </div>
            </div>
          </div>

          {/* Color Gradient Scale */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono-code text-white/50">
              <span>Low (&lt;4h)</span>
              <span>Med (10h)</span>
              <span>Extreme (&gt;30h)</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden bg-gradient-to-r from-sky-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner" />
          </div>

          {/* Gear Breakdown Pills */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1 text-[10px] font-mono-code">
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Trawler 50%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/40">
              Longlines 33%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/40">
              Purse Seine 17%
            </span>
          </div>

          <p className="text-[9px] text-white/40 font-mono-code mt-2">
            Click on any grid cell to inspect vessel density &amp; gear
          </p>
        </div>
      )}

      {/* Selected Cell Inspector Popover */}
      {selectedEffortCell && isFishingEffortVisible && (
        <div 
          id="gfw-cell-inspector"
          className="absolute bottom-14 left-4 z-30 w-72 rounded-xl bg-neutral-950/95 border border-cyan-400/60 p-3 shadow-2xl backdrop-blur-2xl text-white font-geist text-xs animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold font-mono-code text-[11px] text-white">
                GFW Cell: {selectedEffortCell.id}
              </span>
            </div>
            <button
              onClick={() => setSelectedEffortCell(null)}
              className="text-white/40 hover:text-white p-0.5"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 mt-2 font-mono-code text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Apparent Effort:</span>
              <span className="font-bold text-cyan-300">{selectedEffortCell.apparentFishingHours} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Effort Density:</span>
              <span className="text-white">{selectedEffortCell.effortPerKm2} hrs/km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Active Vessels:</span>
              <span className="text-white font-semibold">{selectedEffortCell.vesselCount} ships</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Primary Gear:</span>
              <span className="text-amber-300 font-semibold">{selectedEffortCell.primaryGearType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Intensity:</span>
              <span className="text-rose-400 uppercase font-bold">{selectedEffortCell.intensityLevel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tactical Coordinate HUD (Bottom Left) */}
      <div 
        id="map-telemetry-hud"
        className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/85 border border-white/10 text-[11px] font-mono-code text-white/60 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-medium">MAPLIBRE GL</span>
        </div>
        <span className="text-white/20">|</span>
        <div>
          <span>CURSOR: </span>
          <span className="text-white">
            {cursorCoords 
              ? `${cursorCoords.lat.toFixed(4)}°N, ${cursorCoords.lng.toFixed(4)}°E` 
              : `${activeLat.toFixed(4)}°N, ${activeLng.toFixed(4)}°E`}
          </span>
        </div>
        <span className="text-white/20">|</span>
        <div>
          <span>RADIUS: </span>
          <span className="text-amber-400">{(affectedRadius / 1000).toFixed(0)} km</span>
        </div>
        <span className="text-white/20">|</span>
        <div>
          <span>BASEMAP: </span>
          <span className="text-white uppercase">{currentLayerId}</span>
        </div>
      </div>

      {/* Parameter Edit Shortcut Pill */}
      {onOpenParameters && parameters && (
        <button
          id="btn-map-edit-params-pill"
          onClick={onOpenParameters}
          className="absolute bottom-3 right-40 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/85 hover:bg-neutral-900 border border-white/10 text-white/70 hover:text-white shadow-xl backdrop-blur-md text-[11px] font-mono-code transition-all cursor-pointer"
          title="Open Input Parameters to modify coordinates or spill volume"
        >
          <span className="text-white/70">⚙️</span>
          <span>{parameters.vesselDetails.vesselName}</span>
          <span className="text-white/30">•</span>
          <span className="text-amber-400">{parameters.spillDetails.amount} {parameters.spillDetails.amountUnit}</span>
          <span className="text-white font-medium ml-0.5 hover:underline">Edit</span>
        </button>
      )}

      {/* =====================================================================
          STEP 8: INTERACTIVE MAP PINPOINT HUD & LAND AVOIDANCE FEEDBACK
          ===================================================================== */}
      {/* 8.1: Top Floating Pinpoint Banner */}
      {isPinpointMode && (
        <div 
          id="pinpoint-mode-banner"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-950/95 border border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <Crosshair className="w-4 h-4 text-cyan-400 relative z-10" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono-code">
                Map Pinpointing Active
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-200 uppercase font-mono-code font-semibold">
                Ocean Waters Only
              </span>
            </div>
            <span className="text-[11px] text-white/80 font-mono-code">
              Click anywhere in maritime waters to feed vessel &amp; spill location. Land clicks are blocked.
            </span>
          </div>
          {onCancelPinpoint && (
            <button
              onClick={onCancelPinpoint}
              className="ml-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-mono-code transition-all cursor-pointer shadow-sm"
              title="Cancel Map Pinpoint Mode"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* 8.2: Terrestrial Land Warning Toast (Avoid vessel to locate over land) */}
      {landWarningToast && (
        <div 
          id="pinpoint-land-warning-alert"
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 max-w-lg px-4 py-3 rounded-xl bg-red-950/95 border border-red-500/80 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-red-300 uppercase tracking-wider font-mono-code mb-1 flex items-center gap-1.5">
              <span>🚫 TERRESTRIAL LAND DETECTED — LOCATION BLOCKED</span>
            </div>
            <p className="leading-relaxed text-white/90">
              {landWarningToast.message}
            </p>
          </div>
          <button 
            onClick={() => setLandWarningToast(null)}
            className="text-red-400 hover:text-red-200 p-0.5 rounded cursor-pointer"
            title="Dismiss warning"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 8.3: Pinpoint Success Feedback Toast */}
      {pinpointSuccessToast && (
        <div 
          id="pinpoint-success-alert"
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-400/80 text-emerald-200 shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200 text-xs font-mono-code"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pinpointSuccessToast}</span>
        </div>
      )}

      {/* Invisible simulation reference video driver */}
      <video
        ref={videoRef}
        src="/assets/simulation_evolution.mp4"
        playsInline
        muted
        preload="auto"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}
