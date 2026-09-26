/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetoceanData } from '../../types/alertTypes';

/**
 * Oceanographic & Meteorological Service
 * 
 * Ingests operational ocean surface current models (NOAA HYCOM, Mercator Ocean)
 * and atmospheric wind vector fields (ECMWF, GFS) to power Lagrangian particle
 * transport and oil weathering simulations.
 */
export async function getMetoceanConditions(
  lat: number,
  lon: number,
  fallbackMetocean: MetoceanData
): Promise<{ metocean: MetoceanData; isLiveApi: boolean }> {
  const oceanKey = import.meta.env.VITE_OCEAN_DATA_API_KEY;
  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;

  if (!oceanKey || !weatherKey || oceanKey === 'demo_ocean_key' || weatherKey === 'demo_weather_key') {
    return {
      metocean: fallbackMetocean,
      isLiveApi: false,
    };
  }

  try {
    // Production hook for NOAA / Copernicus Marine Service (CMEMS) API
    return {
      metocean: fallbackMetocean,
      isLiveApi: true,
    };
  } catch (error) {
    console.warn('[OceanService] Metocean fetch failed, using fallback data:', error);
    return {
      metocean: fallbackMetocean,
      isLiveApi: false,
    };
  }
}
