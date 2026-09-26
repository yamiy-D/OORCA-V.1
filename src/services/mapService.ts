/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TileLayerOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const DEFAULT_CARTO_API_KEY = 'cb1_2y7c_1_f8b5c3b41500e6eca4a394fa';

export const getCartoApiKey = (): string => {
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_CARTO_API_KEY || import.meta.env?.VITE_MAP_API_KEY)) ||
    DEFAULT_CARTO_API_KEY
  ).trim();
};

const cartoKey = getCartoApiKey();
const cartoKeyParam = cartoKey ? `?key=${encodeURIComponent(cartoKey)}` : '';

export const TILE_LAYERS: Record<string, TileLayerOption> = {
  dark: {
    id: 'dark',
    name: 'Dark Maritime (CARTO)',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  voyager: {
    id: 'voyager',
    name: 'Voyager Coastal (CARTO)',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoKeyParam}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Ocean',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, GEBCO, NOAA, National Geographic, DeLorme, HERE, Geonames.org, and other contributors',
    maxZoom: 13,
  },
};

export function formatLatitude(lat: number): string {
  const dir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(4)} °${dir}`;
}

export function formatLongitude(lng: number): string {
  const dir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lng).toFixed(4)} °${dir}`;
}
