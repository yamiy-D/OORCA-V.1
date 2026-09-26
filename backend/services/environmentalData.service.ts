/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherProvider } from '../providers/weather.provider';
import { OceanProvider } from '../providers/ocean.provider';
import { GeographicProvider } from '../providers/geographic.provider';
import { NormalizedEnvironmentalData } from '../models/environmentalData.model';

export class EnvironmentalDataService {
  /**
   * Imports, normalizes, and validates multi-source environmental and oceanographic data.
   */
  public static async getNormalizedEnvironment(
    latitude: number,
    longitude: number,
    timestamp?: string
  ): Promise<NormalizedEnvironmentalData> {
    // 1. Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(`Invalid geographic coordinates: (${latitude}, ${longitude})`);
    }

    const isoTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    // 2. Concurrently fetch weather and oceanographic data
    const [weatherResult, oceanResult] = await Promise.all([
      WeatherProvider.getWeatherData(latitude, longitude, isoTimestamp),
      OceanProvider.getOceanData(latitude, longitude, isoTimestamp),
    ]);

    // 3. Determine unified metadata status
    const isObserved =
      weatherResult.metadata.status === 'observed' && oceanResult.metadata.status === 'observed';
    const isCached =
      weatherResult.metadata.status === 'cached' || oceanResult.metadata.status === 'cached';
    
    const combinedStatus: 'observed' | 'estimated' | 'cached' = isObserved
      ? 'observed'
      : isCached
      ? 'cached'
      : 'estimated';

    const confidence: 'high' | 'medium' | 'low' =
      combinedStatus === 'observed'
        ? 'high'
        : combinedStatus === 'cached'
        ? 'high'
        : 'medium';

    const geoContext = GeographicProvider.getGeographicContext(latitude, longitude);

    // STEP 4: Construct normalized object in strict SI standard units with live weather features
    const normalizedData: NormalizedEnvironmentalData = {
      location: {
        latitude: Math.round(latitude * 10000) / 10000,
        longitude: Math.round(longitude * 10000) / 10000,
        locationName: geoContext.regionName,
      },
      timestamp: isoTimestamp,
      wind: {
        speed: weatherResult.wind.speed, // m/s
        direction: weatherResult.wind.direction, // degrees
        speedKts: weatherResult.wind.speedKts, // knots
        gusts: weatherResult.wind.gusts,
        gustsKts: weatherResult.wind.gustsKts,
      },
      oceanCurrent: {
        speed: oceanResult.oceanCurrent.speed, // m/s
        direction: oceanResult.oceanCurrent.direction, // degrees
        speedKts: oceanResult.oceanCurrent.speedKts, // knots
      },
      temperature: oceanResult.seaTemperature, // Celsius (water)
      airTemperature: weatherResult.airTemperature, // Celsius (air)
      pressureHpa: weatherResult.pressureHpa,
      humidityPct: weatherResult.humidityPct,
      weatherCondition: weatherResult.weatherCondition,
      weatherDescription: weatherResult.weatherDescription,
      weatherIcon: weatherResult.weatherIcon,
      waveHeight: oceanResult.waves.height, // meters
      waves: oceanResult.waves,
      timelineForecast: weatherResult.timelineForecast,
      weatherChanges: weatherResult.weatherChanges,
      metadata: {
        source: `${weatherResult.metadata.source} & ${oceanResult.metadata.source}`,
        status: combinedStatus,
        confidence,
        fetchedAt: new Date().toISOString(),
        notes: `Region: ${geoContext.regionName}. Nearest shoreline: ${geoContext.nearestFeature.name} (${geoContext.nearestCoastKm} km).`,
      },
    };

    return normalizedData;
  }
}
