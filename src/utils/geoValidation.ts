/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Geometric Ray-Casting Point-in-Polygon Algorithm.
 * Determines if a geographical point [lng, lat] falls within a closed polygon.
 */
function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const x = point[0]; // lng
  const y = point[1]; // lat
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Major Continental and Regional Landmass Polygons.
 * Coordinates are represented as [lng, lat].
 */
const LAND_POLYGONS: [number, number][][] = [
  // 1. Indian Subcontinent & South Asia Mainland
  [
    [68.1, 23.8], // Kori Creek, Gujarat
    [68.9, 22.4], // Dwarka
    [69.6, 21.6], // Porbandar
    [70.4, 20.9], // Veraval
    [71.5, 20.7], // Diu
    [72.1, 21.7], // Bhavnagar
    [72.85, 21.2], // Surat
    [72.82, 20.4], // Daman
    [72.80, 19.3], // Vasai / North Mumbai
    [72.82, 18.9], // Mumbai Colaba / Harbour
    [72.86, 18.6], // Alibaug Coast
    [72.95, 18.3], // Murud Coast
    [73.18, 17.0], // Ratnagiri Coast
    [73.80, 15.5], // Goa Coast
    [74.30, 14.8], // Karwar
    [74.85, 13.3], // Mangalore Coast
    [75.35, 11.9], // Kannur
    [75.75, 11.2], // Kozhikode
    [76.25, 9.95], // Kochi
    [76.55, 8.85], // Kollam
    [77.55, 8.08], // Kanyakumari (Southern Tip)
    [77.75, 8.50], // Tirunelveli Coast
    [78.15, 8.80], // Tuticorin
    [79.10, 9.25], // Mandapam / Rameswaram
    [79.85, 10.35], // Point Calimere
    [79.85, 10.80], // Karaikal
    [79.85, 11.95], // Puducherry Coast
    [80.28, 13.08], // Chennai Coast
    [80.05, 13.70], // Pulicat Coast
    [80.05, 15.00], // Ongole Coast
    [80.85, 15.80], // Machilipatnam Coast
    [81.65, 16.30], // Godavari Delta South
    [82.25, 16.95], // Kakinada Coast
    [83.30, 17.70], // Visakhapatnam Coast
    [84.10, 18.30], // Srikakulam Coast
    [85.05, 19.30], // Gopalpur
    [85.80, 19.80], // Puri Coast
    [86.70, 20.30], // Paradip Coast
    [87.05, 20.80], // Dhamra
    [87.50, 21.50], // Digha
    [88.20, 21.65], // Sagar Island / Sundarbans
    [89.50, 21.90], // Bangladesh Sundarbans
    [91.80, 21.40], // Cox's Bazar
    [92.50, 20.10], // Sittwe, Myanmar
    [94.50, 16.00], // Irrawaddy Delta
    [96.30, 16.80], // Yangon Coast
    [98.20, 16.00], // Mawlamyine
    [98.50, 12.00], // Mergui / Tanintharyi
    [99.50, 8.00], // Thai-Malay border
    [103.5, 1.30], // Singapore / Johor tip
    [104.5, 2.50], // East Malay Coast
    [101.5, 6.00], // Narathiwat
    [100.5, 13.5], // Bangkok
    [102.5, 11.5], // Cambodia Coast
    [104.5, 10.0], // Mekong Delta
    [107.0, 10.5], // Vung Tau
    [109.2, 13.5], // Vietnam Coast
    [108.0, 16.0], // Da Nang
    [106.0, 20.5], // Gulf of Tonkin
    [110.0, 21.0], // South China Coast
    [121.5, 31.2], // Shanghai Coast
    [120.0, 39.0], // Bohai Sea
    [125.0, 40.0], // Korea Bay
    [130.0, 42.5], // Vladivostok
    [140.0, 55.0], // Okhotsk
    [170.0, 65.0], // Chukotka (NE Siberia)
    [60.0, 70.0], // Ural / Arctic Coast
    [30.0, 70.0], // Scandinavia North
    [10.0, 60.0], // Norway Coast
    [-5.0, 48.0], // France Coast
    [-9.5, 38.8], // Portugal (Cabo da Roca)
    [-5.5, 36.0], // Strait of Gibraltar (Europe side)
    [15.0, 38.0], // Italy South
    [25.0, 35.0], // Greece South
    [35.0, 36.5], // Turkey South
    [35.0, 32.0], // Levant
    [40.0, 30.0], // Northern Arabian Desert
    [48.0, 30.0], // Kuwait / Shatt al-Arab
    [50.0, 29.0], // Iran Bushehr Coast
    [56.5, 27.2], // Bandar Abbas / Hormuz
    [60.0, 25.3], // Chabahar Coast
    [62.5, 25.2], // Gwadar Coast, Pakistan
    [66.5, 24.8], // Karachi Coast
    [68.1, 23.8], // Close Indian Subcontinent
  ],

  // 2. Sri Lanka Island
  [
    [79.7, 9.8],
    [79.8, 8.0],
    [80.1, 6.5],
    [80.5, 5.9],
    [81.0, 6.0],
    [81.9, 6.8],
    [81.8, 8.5],
    [81.3, 9.0],
    [80.3, 9.8],
    [79.7, 9.8],
  ],

  // 3. Arabian Peninsula
  [
    [43.4, 12.6], // Bab-el-Mandeb
    [45.0, 12.8], // Aden
    [50.8, 15.0], // Mukalla
    [54.1, 17.0], // Salalah
    [59.8, 22.5], // Ras al Hadd
    [58.5, 23.6], // Muscat
    [56.4, 26.2], // Musandam
    [55.3, 25.3], // Dubai
    [51.5, 25.3], // Qatar
    [50.1, 26.4], // Dammam
    [48.0, 29.5], // Kuwait
    [38.0, 29.5], // Northern Saudi
    [35.0, 28.0], // Tabuk
    [37.3, 25.0], // Yanbu Coast
    [39.2, 21.5], // Jeddah Coast
    [41.5, 18.0], // Jizan Coast
    [43.0, 14.5], // Hodeidah
    [43.4, 12.6],
  ],

  // 4. African Continent
  [
    [-5.6, 35.9], // Gibraltar Africa
    [10.0, 37.0], // Tunisia North
    [25.0, 32.0], // Libya Coast
    [31.5, 31.3], // Nile Delta, Egypt
    [34.0, 27.5], // Red Sea Egypt
    [37.5, 22.5], // Sudan Coast
    [43.3, 12.6], // Bab-el-Mandeb Africa
    [51.2, 10.5], // Horn of Africa (Ras Hafun)
    [45.0, 2.0], // Somalia Coast
    [40.0, -4.0], // Kenya Mombasa
    [39.0, -8.0], // Tanzania Dar es Salaam
    [40.5, -15.0], // Mozambique Coast
    [32.6, -26.0], // Maputo
    [31.0, -30.0], // Durban
    [25.5, -34.0], // Port Elizabeth
    [18.5, -34.8], // Cape of Good Hope
    [15.0, -23.0], // Walvis Bay, Namibia
    [12.0, -12.0], // Angola Coast
    [9.5, 0.5], // Gabon
    [4.0, 4.5], // Niger Delta
    [-2.0, 5.0], // Ghana Coast
    [-13.0, 9.5], // Guinea
    [-17.5, 14.7], // Dakar, Senegal
    [-16.0, 21.0], // Mauritania Coast
    [-10.0, 29.0], // Morocco Coast
    [-5.6, 35.9],
  ],

  // 5. Australian Continent
  [
    [114.0, -21.8], // North West Cape
    [113.0, -26.0], // Steep Point
    [115.0, -32.0], // Perth Coast
    [118.0, -35.0], // Albany
    [136.0, -35.0], // Spencer Gulf
    [145.0, -38.5], // Melbourne Coast
    [150.0, -37.5], // Cape Howe
    [153.6, -28.2], // Byron Bay
    [153.0, -27.5], // Brisbane
    [150.0, -22.0], // Rockhampton
    [145.5, -16.0], // Cooktown
    [142.5, -10.7], // Cape York
    [136.5, -12.0], // Arnhem Land
    [130.8, -12.4], // Darwin
    [122.2, -18.0], // Broome
    [114.0, -21.8],
  ],

  // 6. North American Continent (Mainland)
  [
    [-168.0, 66.0], // Bering Strait Alaska
    [-140.0, 70.0], // Beaufort Sea
    [-95.0, 70.0], // Arctic Canada
    [-60.0, 50.0], // Labrador
    [-65.0, 44.0], // Nova Scotia
    [-71.0, 42.0], // Boston
    [-74.0, 40.5], // New York Coast
    [-76.0, 36.0], // Cape Hatteras
    [-80.0, 25.5], // Miami
    [-83.0, 29.0], // Florida Gulf
    [-90.0, 29.5], // Louisiana Delta
    [-97.0, 26.0], // Texas Brownsville
    [-97.0, 20.0], // Veracruz, Mexico
    [-90.0, 21.0], // Yucatan
    [-87.0, 16.0], // Honduras
    [-83.0, 8.5], // Panama
    [-85.0, 10.0], // Costa Rica Pacific
    [-93.0, 16.0], // Chiapas Coast
    [-105.0, 21.0], // Nayarit
    [-110.0, 23.0], // Baja tip
    [-117.0, 32.5], // San Diego
    [-122.5, 37.8], // San Francisco
    [-124.0, 47.0], // Washington Coast
    [-130.0, 55.0], // Alaska Panhandle
    [-165.0, 55.0], // Aleutian Base
    [-168.0, 66.0],
  ],

  // 7. South American Continent
  [
    [-77.0, 8.5], // Panama border
    [-75.0, 11.0], // Barranquilla
    [-64.0, 10.5], // Venezuela Coast
    [-52.0, 4.5], // French Guiana
    [-44.0, -2.5], // Sao Luis, Brazil
    [-35.0, -5.5], // Natal, Brazil (Easternmost tip)
    [-38.5, -13.0], // Salvador
    [-43.0, -23.0], // Rio de Janeiro
    [-48.5, -27.0], // Florianopolis
    [-52.0, -32.0], // Rio Grande
    [-56.0, -35.0], // Montevideo
    [-60.0, -38.5], // Mar del Plata
    [-66.0, -47.0], // Golfo San Jorge
    [-68.0, -54.0], // Tierra del Fuego
    [-74.0, -45.0], // Chile South
    [-71.5, -33.0], // Valparaiso
    [-70.5, -20.0], // Iquique
    [-77.0, -12.0], // Lima, Peru
    [-81.0, -5.0], // Punta Parinas (Westernmost tip)
    [-80.0, -1.0], // Guayaquil, Ecuador
    [-78.0, 2.5], // Colombia Pacific
    [-77.0, 8.5],
  ],
];

/**
 * Validates coordinate inputs for range, numeric integrity, and geographic land exclusion.
 */
export interface CoordinateValidationResult {
  isValid: boolean;
  lat?: number;
  lng?: number;
  error?: string;
  isLand?: boolean;
}

// =============================================================================
// STEP 4: Geographic Land Check & Nearest Water Snapping
// =============================================================================

/**
 * Checks whether the given coordinate pair falls on land.
 * Returns true if location is on land, false if in maritime/ocean waters.
 */
export function isLandLocation(lat: number, lng: number): boolean {
  // Antarctica ice sheet / polar landmass check (south of -65° latitude)
  if (lat < -65.0) {
    return true;
  }

  // Greenland check (lat 60 to 83.5, lng -73 to -12)
  if (lat >= 60.0 && lat <= 83.5 && lng >= -73.0 && lng <= -12.0) {
    // Exclude open ocean margins
    if (lat > 65.0 || lng < -30.0) {
      return true;
    }
  }

  // Test against major landmass polygons
  for (const polygon of LAND_POLYGONS) {
    if (isPointInPolygon([lng, lat], polygon)) {
      return true;
    }
  }

  return false;
}

/**
 * Searches in concentric outward radial steps (0.02° to 0.5°) to snap coordinates
 * falling on land to the nearest valid maritime ocean/sea water coordinate.
 */
export function snapToNearestWater(
  lat: number,
  lng: number,
  maxSearchDegrees: number = 0.5
): { lat: number; lng: number; snapped: boolean; distanceKm: number } {
  // If already in water, return immediately
  if (!isLandLocation(lat, lng)) {
    return { lat, lng, snapped: false, distanceKm: 0 };
  }

  // 16 directional radials
  const directions = [
    [0, 1], [0.38, 0.92], [0.71, 0.71], [0.92, 0.38],
    [1, 0], [0.92, -0.38], [0.71, -0.71], [0.38, -0.92],
    [0, -1], [-0.38, -0.92], [-0.71, -0.71], [-0.92, -0.38],
    [-1, 0], [-0.92, 0.38], [-0.71, 0.71], [-0.38, 0.92],
  ];

  // Outward step increments in degrees (~2.2 km to ~55 km)
  const stepDeltas = [0.03, 0.06, 0.1, 0.15, 0.22, 0.32, 0.45, 0.6];

  for (const delta of stepDeltas) {
    if (delta > maxSearchDegrees) break;
    for (const [dy, dx] of directions) {
      const candidateLat = Number((lat + dy * delta).toFixed(4));
      const candidateLng = Number((lng + dx * delta).toFixed(4));

      // Skip invalid polar/equatorial boundaries
      if (candidateLat < -85 || candidateLat > 85 || candidateLng < -180 || candidateLng > 180) {
        continue;
      }

      if (!isLandLocation(candidateLat, candidateLng)) {
        const distKm = Math.round(
          Math.sqrt(Math.pow((candidateLat - lat) * 111, 2) + Math.pow((candidateLng - lng) * 111 * Math.cos((lat * Math.PI) / 180), 2))
        );
        return {
          lat: candidateLat,
          lng: candidateLng,
          snapped: true,
          distanceKm: distKm,
        };
      }
    }
  }

  // Fallback: Return original if no ocean found within bounds
  return { lat, lng, snapped: false, distanceKm: 0 };
}

/**
 * Validates raw latitude and longitude input strings.
 */
export function validateCoordinates(
  latInput: string,
  lngInput: string
): CoordinateValidationResult {
  const trimmedLat = latInput.trim();
  const trimmedLng = lngInput.trim();

  // 1. Non-empty check
  if (!trimmedLat || !trimmedLng) {
    return {
      isValid: false,
      error: 'Please enter both latitude and longitude values.',
    };
  }

  // 2. Strict numeric check
  const latNum = Number(trimmedLat);
  const lngNum = Number(trimmedLng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum) || !/^-?\d+(\.\d+)?$/.test(trimmedLat) || !/^-?\d+(\.\d+)?$/.test(trimmedLng)) {
    return {
      isValid: false,
      error: 'Rejecting non-numeric coordinates. Please enter valid decimal degrees.',
    };
  }

  // 3. Mathematical range checks
  if (latNum < -90 || latNum > 90) {
    return {
      isValid: false,
      lat: latNum,
      lng: lngNum,
      error: 'Invalid latitude — must be between -90.0000° and 90.0000°.',
    };
  }

  if (lngNum < -180 || lngNum > 180) {
    return {
      isValid: false,
      lat: latNum,
      lng: lngNum,
      error: 'Invalid longitude — must be between -180.0000° and 180.0000°.',
    };
  }

  // 4. Geographic Land Check
  const onLand = isLandLocation(latNum, lngNum);
  if (onLand) {
    return {
      isValid: false,
      lat: latNum,
      lng: lngNum,
      isLand: true,
      error: 'Invalid vessel location — coordinates fall on land. Please enter a valid maritime location.',
    };
  }

  // Valid maritime coordinates
  return {
    isValid: true,
    lat: latNum,
    lng: lngNum,
    isLand: false,
  };
}

/**
 * Returns a descriptive maritime sector name based on oceanographic basin coordinates.
 */
export function getMaritimeRegionName(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const coordTag = `(${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir})`;

  // Bay of Bengal & Andaman Sea
  if (lat >= 5 && lat <= 23 && lng >= 80 && lng <= 98) {
    if (lng >= 92 && lat <= 15) {
      return `Andaman Sea Operational Sector ${coordTag}`;
    }
    if (lat >= 16 && lat <= 21 && lng >= 82 && lng <= 88) {
      return `Bay of Bengal Central Trench ${coordTag}`;
    }
    return `Bay of Bengal Maritime Sector ${coordTag}`;
  }

  // Arabian Sea & Gulf of Oman
  if (lat >= 8 && lat <= 26 && lng >= 55 && lng <= 78) {
    if (lat >= 22 && lng <= 61) {
      return `Gulf of Oman Strategic Corridor ${coordTag}`;
    }
    if (lat >= 17 && lat <= 21 && lng >= 70 && lng <= 73) {
      return `Arabian Sea Offshore Mumbai Sector ${coordTag}`;
    }
    return `Arabian Sea Maritime Corridor ${coordTag}`;
  }

  // Persian Gulf / Strait of Hormuz
  if (lat >= 24 && lat <= 30 && lng >= 48 && lng <= 57) {
    return `Persian Gulf / Hormuz Corridor ${coordTag}`;
  }

  // Red Sea
  if (lat >= 12 && lat <= 28 && lng >= 32 && lng <= 44) {
    return `Red Sea Maritime Route ${coordTag}`;
  }

  // Strait of Malacca / South China Sea
  if (lat >= -5 && lat <= 25 && lng >= 99 && lng <= 125) {
    if (lat >= 1 && lat <= 6 && lng >= 100 && lng <= 105) {
      return `Strait of Malacca Transit Route ${coordTag}`;
    }
    return `South China Sea Maritime Basin ${coordTag}`;
  }

  // Indian Ocean
  if (lat >= -40 && lat <= 10 && lng >= 40 && lng <= 110) {
    return `Equatorial Indian Ocean Maritime Sector ${coordTag}`;
  }

  // Atlantic Ocean
  if (lng >= -70 && lng <= 20) {
    return lat >= 0 ? `North Atlantic Ocean Basin ${coordTag}` : `South Atlantic Ocean Basin ${coordTag}`;
  }

  // Pacific Ocean
  if (lng >= 120 || lng <= -80) {
    return lat >= 0 ? `North Pacific Ocean Basin ${coordTag}` : `South Pacific Ocean Basin ${coordTag}`;
  }

  return `International Maritime Sector ${coordTag}`;
}
