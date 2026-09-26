/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentalConditions, WeatherTimelineStep, WeatherChangeAlert } from '../types/simulation';

/**
 * STEP 1: Metocean & Weather Intelligence Service
 * Ingests live OpenWeatherMap atmospheric data and hydrodynamic conditions from /api/environment.
 */
export class EnvironmentalDataService {
  private static instance: EnvironmentalDataService;

  // STEP 2: Cache for Coordinates Metocean Data
  private cache = new Map<string, EnvironmentalConditions>();

  private constructor() {}

  public static getInstance(): EnvironmentalDataService {
    if (!EnvironmentalDataService.instance) {
      EnvironmentalDataService.instance = new EnvironmentalDataService();
    }
    return EnvironmentalDataService.instance;
  }

  /**
   * STEP 3: Fetch Live Environmental & OpenWeather Conditions
   */
  public async getConditionsForLocation(
    lat: number, 
    lng: number, 
    targetHour: number = 0
  ): Promise<EnvironmentalConditions> {
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    let conditions = this.cache.get(cacheKey);

    if (!conditions) {
      try {
        const response = await fetch(`/api/environment?latitude=${lat}&longitude=${lng}`);
        if (response.ok) {
          const data = await response.json();
          conditions = {
            windSpeedKts: data.wind?.speedKts || 14.5,
            windDirectionDeg: data.wind?.direction || 245,
            currentSpeedKts: data.oceanCurrent?.speedKts || 1.2,
            currentDirectionDeg: data.oceanCurrent?.direction || 68,
            waveHeightMeters: data.waveHeight || 1.6,
            waterTemperatureC: data.temperature || 28.5,
            airTemperatureC: data.airTemperature || 31.0,
            pressureHpa: data.pressureHpa || 1012,
            humidityPct: data.humidityPct || 76,
            weatherCondition: data.weatherCondition || 'Clouds',
            weatherDescription: data.weatherDescription || 'scattered clouds',
            weatherIcon: data.weatherIcon || '03d',
            timelineForecast: data.timelineForecast || [],
            weatherChanges: data.weatherChanges || [],
          };
          this.cache.set(cacheKey, conditions);
        }
      } catch (err) {
        console.warn('[EnvironmentalDataService] Failed to query backend /api/environment, using fallback values:', err);
      }
    }

    // STEP 4: Regional Calibrated Fallback if fetch was unsuccessful
    if (!conditions) {
      const isBayOfBengal = lng >= 79.5;
      conditions = {
        windSpeedKts: isBayOfBengal ? 15.2 : 14.5,
        windDirectionDeg: isBayOfBengal ? 215 : 245,
        currentSpeedKts: isBayOfBengal ? 1.4 : 1.2,
        currentDirectionDeg: isBayOfBengal ? 52 : 68,
        waveHeightMeters: 1.5,
        waterTemperatureC: isBayOfBengal ? 29.2 : 28.5,
        airTemperatureC: isBayOfBengal ? 31.8 : 31.0,
        pressureHpa: 1010,
        humidityPct: 78,
        weatherCondition: 'Clouds',
        weatherDescription: 'overcast clouds',
        weatherIcon: '04d',
        timelineForecast: this.generateCalibratedTimeline(isBayOfBengal ? 215 : 245, isBayOfBengal ? 15.2 : 14.5),
        weatherChanges: [
          {
            hour: 18,
            type: 'WIND_SHIFT',
            headline: 'Wind Veering Shift (22°)',
            description: 'Wind shifting towards NE heading, driving surface sheen faster towards coast.',
            dispersionImpact: 'Alters plume axis by +16°.',
            severity: 'moderate',
          },
          {
            hour: 36,
            type: 'WIND_ACCELERATION',
            headline: 'Wind Surge (+4.5 kts)',
            description: 'Wind velocity increasing due to offshore thermal gradient.',
            dispersionImpact: 'Enhances wave breaking and vertical mixing.',
            severity: 'high',
          }
        ],
      };
      this.cache.set(cacheKey, conditions);
    }

    // STEP 5: Interpolate Weather for Current Simulation Hour
    return this.adjustConditionsForSimulationHour(conditions, targetHour);
  }

  /**
   * STEP 6: Adjust Metocean Conditions for Specific Simulation Hour
   * Matches or interpolates between 3-hour forecast steps to reflect real-world weather evolution.
   */
  public adjustConditionsForSimulationHour(
    base: EnvironmentalConditions, 
    hour: number
  ): EnvironmentalConditions {
    if (!base.timelineForecast || base.timelineForecast.length === 0) {
      return base;
    }

    // Find nearest or bounding forecast steps
    const forecast = base.timelineForecast;
    let selectedStep = forecast[0];

    for (let i = 0; i < forecast.length; i++) {
      if (forecast[i].hourOffset <= hour) {
        selectedStep = forecast[i];
      } else {
        break;
      }
    }

    // Check if an alert matches around this hour (within +/- 3 hours)
    const matchingAlert = base.weatherChanges?.find(
      (a) => Math.abs(a.hour - hour) <= 2
    ) || null;

    return {
      ...base,
      windSpeedKts: selectedStep.windSpeedKts,
      windDirectionDeg: selectedStep.windDirectionDeg,
      airTemperatureC: selectedStep.temperatureC,
      pressureHpa: selectedStep.pressureHpa,
      humidityPct: selectedStep.humidityPct,
      weatherCondition: selectedStep.condition,
      weatherDescription: selectedStep.description,
      weatherIcon: selectedStep.icon,
      currentWeatherAlert: matchingAlert,
      weatherShiftDetected: Boolean(matchingAlert),
      weatherShiftNotice: matchingAlert ? `${matchingAlert.headline}: ${matchingAlert.dispersionImpact}` : undefined,
    };
  }

  /**
   * STEP 7: Calibrated Timeline Generator (Used when offline/fallback)
   */
  private generateCalibratedTimeline(baseDir: number, baseSpeed: number): WeatherTimelineStep[] {
    const hours = [0, 3, 6, 9, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];
    return hours.map((hr) => {
      const shiftDeg = hr >= 36 ? 24 : hr >= 18 ? 12 : 0;
      const speedSurge = hr >= 36 ? 4.2 : hr >= 24 ? 2.1 : 0;
      return {
        hourOffset: hr,
        timeUtc: new Date(Date.now() + hr * 3600000).toISOString(),
        windSpeedKts: Math.round((baseSpeed + speedSurge) * 10) / 10,
        windDirectionDeg: (baseDir + shiftDeg) % 360,
        gustsKts: Math.round((baseSpeed + speedSurge) * 1.35 * 10) / 10,
        temperatureC: 28.5 + (hr % 24 > 6 && hr % 24 < 18 ? 2.5 : -1.5),
        pressureHpa: 1012 - (hr >= 36 ? 4 : 1),
        humidityPct: 76 + (hr >= 36 ? 6 : 0),
        condition: hr >= 36 ? 'Rain' : hr >= 18 ? 'Clouds' : 'Clear',
        description: hr >= 36 ? 'scattered rain front' : hr >= 18 ? 'overcast clouds' : 'clear maritime sky',
        icon: hr >= 36 ? '10d' : hr >= 18 ? '04d' : '01d',
      };
    });
  }
}

export const environmentalDataService = EnvironmentalDataService.getInstance();
