/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// STEP 1: Basic Ocean & Atmospheric Vector Data Interfaces
export interface WindData {
  speed: number;        // in meters per second (m/s)
  direction: number;    // meteorological origin direction in degrees (0 - 360)
  speedKts: number;     // in knots
  gusts?: number;       // in meters per second (m/s)
  gustsKts?: number;    // in knots
}

// STEP 2: Ocean Current Vectors
export interface OceanCurrentData {
  speed: number;        // in meters per second (m/s)
  direction: number;    // oceanographic flow heading in degrees (0 - 360)
  speedKts: number;     // in knots
}

// STEP 3: Wave Kinetics
export interface WaveData {
  height: number;       // significant wave height in meters
  direction?: number;   // mean wave direction in degrees
  period?: number;      // wave period in seconds
}

// STEP 4: Provider Metadata
export interface EnvironmentalMetadata {
  source: string;       // e.g. "OpenWeatherMap API & NOAA GFS"
  status: 'observed' | 'estimated' | 'cached';
  confidence: 'high' | 'medium' | 'low';
  fetchedAt: string;    // ISO timestamp
  notes?: string;
}

// STEP 5: Weather Timeline Hourly Forecast Step
export interface WeatherTimelineStep {
  hourOffset: number;        // e.g., 0, 3, 6, 12, 24, 48, 72
  timeUtc: string;           // ISO timestamp
  windSpeedKts: number;
  windDirectionDeg: number;
  gustsKts: number;
  temperatureC: number;
  pressureHpa: number;
  humidityPct: number;
  condition: string;         // 'Clouds', 'Rain', 'Clear', 'Thunderstorm', etc.
  description: string;       // 'overcast clouds', 'light rain', etc.
  icon: string;
  isSignificantShift?: boolean;
  shiftReason?: string;
}

// STEP 6: Detected Weather Change Alert
export interface WeatherChangeAlert {
  hour: number;
  type: 'WIND_SHIFT' | 'WIND_ACCELERATION' | 'STORM_ARRIVING' | 'CALM_SEAS' | 'PRESSURE_DROP';
  headline: string;
  description: string;
  dispersionImpact: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
}

// STEP 7: Comprehensive Normalized Environmental Data Schema
export interface NormalizedEnvironmentalData {
  location: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
  timestamp: string;          // ISO UTC timestamp
  wind: WindData;
  oceanCurrent: OceanCurrentData;
  temperature: number;        // Sea surface temperature in Celsius
  airTemperature: number;     // Air temperature in Celsius
  pressureHpa?: number;       // Atmospheric pressure in hPa
  humidityPct?: number;       // Atmospheric humidity in %
  weatherCondition?: string;  // e.g. "Clouds", "Rain"
  weatherDescription?: string;// e.g. "overcast clouds"
  weatherIcon?: string;
  waveHeight: number;         // in meters
  waves?: WaveData;
  timelineForecast?: WeatherTimelineStep[];
  weatherChanges?: WeatherChangeAlert[];
  metadata: EnvironmentalMetadata;
}
