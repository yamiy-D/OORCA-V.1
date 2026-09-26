/**
 * Vessel Oil Spill Heat Map Graphic Generator
 * 
 * Generates an organic, multi-tiered red-orange thermal dispersion heatmap
 * directly surrounding the casualty crude tanker hull:
 * - Inner Core (> 200 µm): Intense blood red / crimson directly hugging the vessel hull and breach
 * - Intermediate Zone (10 - 200 µm): Fiery vermilion / red-orange radiating outward
 * - Outer Sheen Zone (0.1 - 10 µm): Vibrant warm orange / golden amber with undulating organic ruffles
 * - Aframax Crude Tanker: Centered with stark white hull line, steel cargo tank bays, ruptured Tank #3, catwalk, wheelhouse, golden exhaust funnel & green bow light
 * 
 * Evolution is driven continuously by simulation progress (0.0 to 1.0, representing 0h to 72h)
 * matching the provided simulation video frames:
 * - 0h (0.0): Compact initial breach wrapping vessel hull
 * - 18h (0.25): Spreading outwards, lateral fissure tears developing on flanks
 * - 36h (0.50): Pronounced elongation along drift axis, multi-lobed thermal contours
 * - 54h (0.75): Broad dispersion field with multi-tiered fluid tendrils
 * - 72h (1.00): Maximum fully spread mature slick with expansive flame lobes
 */

export interface VesselHeatmapOptions {
  headingDeg?: number;
  width?: number;
  height?: number;
  progress?: number; // 0.0 (0h) to 1.0 (72h)
  animPhase?: number;
  showBreachIndicator?: boolean;
}

/**
 * Generate a closed, butter-smooth Catmull-Rom cubic Bezier organic contour
 */
function generateOrganicContourPath(
  cx: number,
  cy: number,
  rxBase: number,
  ryBase: number,
  harmonics: Array<{ freq: number; amp: number; phase: number }>,
  numPoints = 36,
  portBulge = 0,
  flankFissure = 0
): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    let wave = 1.0;
    for (const h of harmonics) {
      wave += h.amp * Math.sin(angle * h.freq + h.phase);
    }

    // Flank fissures: lateral notches that carve into port & starboard flanks
    if (flankFissure > 0) {
      const sinA = Math.sin(angle);
      const notch = Math.pow(Math.abs(sinA), 3.5) * flankFissure;
      wave -= notch;
    }

    // Additional expansion on the portside (y < cy, angle ~ -PI/2) near cargo tank #3
    if (portBulge > 0 && Math.sin(angle) < -0.2) {
      const portFactor = Math.abs(Math.sin(angle));
      wave += portBulge * portFactor * (1 + 0.3 * Math.cos(angle * 3));
    }

    const rX = rxBase * Math.max(0.35, wave);
    const rY = ryBase * Math.max(0.35, wave);
    const x = cx + rX * Math.cos(angle);
    const y = cy + rY * Math.sin(angle);
    pts.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  }

  // Convert points to smooth cubic Bezier spline
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  d += ' Z';
  return d;
}

// Center of casualty vessel hull
const cx = 50;
const cy = 16;

/**
 * Returns raw SVG markup string for embedding directly into MapLibre markers,
 * scaling and evolving dynamically based on simulation progress (0.0 to 1.0).
 */
export function getVesselHeatmapSvgHtml(
  headingDeg = 0,
  width = 220,
  height = 130,
  progress = 0.5,
  animPhase = 0
): string {
  // Clamped simulation progress (0.0 = 0h, 1.0 = 72h)
  const p = Math.max(0.0, Math.min(1.0, progress));
  
  // Dynamic scale dimensions matching the reference video frames:
  // At 0h: compact pool hugging hull (rx: ~55, ry: ~30)
  // At 72h: expansive multi-tier plume (rx: ~125, ry: ~64)
  const rxOuter = 55 + p * 70;
  const ryOuter = 30 + p * 34;
  const rxMid = 42 + p * 48;
  const ryMid = 22 + p * 24;
  const rxInner = 30 + p * 34;
  const ryInner = 14 + p * 16;

  // Lateral flank fissure intensity: develops from 0.05 at 0h to 0.28 at 72h
  const flankFissure = 0.06 + p * 0.22;
  const portBulge = 0.12 + p * 0.18;

  // Harmonic waves with slight dynamic undulation
  const pathOuter = generateOrganicContourPath(
    cx, cy, rxOuter, ryOuter,
    [
      { freq: 2, amp: 0.08 + p * 0.04, phase: 0.3 + animPhase * 0.5 },
      { freq: 4, amp: 0.12 + p * 0.06, phase: 0.9 - animPhase * 0.3 },
      { freq: 7, amp: 0.07 + p * 0.03, phase: 1.7 + animPhase * 0.4 },
      { freq: 11, amp: 0.04, phase: 0.4 },
    ],
    40,
    portBulge,
    flankFissure
  );

  const pathMid = generateOrganicContourPath(
    cx, cy, rxMid, ryMid,
    [
      { freq: 2, amp: 0.07 + p * 0.03, phase: 0.4 + animPhase * 0.4 },
      { freq: 4, amp: 0.10 + p * 0.05, phase: 0.8 - animPhase * 0.2 },
      { freq: 6, amp: 0.06, phase: 1.5 },
    ],
    36,
    portBulge * 0.8,
    flankFissure * 0.7
  );

  const pathInner = generateOrganicContourPath(
    cx, cy, rxInner, ryInner,
    [
      { freq: 3, amp: 0.08 + p * 0.02, phase: 0.5 + animPhase * 0.3 },
      { freq: 5, amp: 0.05, phase: 1.2 },
    ],
    32,
    portBulge * 0.6,
    flankFissure * 0.4
  );

  // Ruptured Tank #3 discharge jet: streams outwards as time evolves
  const jetRx = 10 + p * 12;
  const jetRy = 6 + p * 7;
  const pathBreachCore = generateOrganicContourPath(
    50, 8 - p * 3, jetRx, jetRy,
    [
      { freq: 3, amp: 0.12, phase: 0.2 + animPhase * 0.8 },
      { freq: 5, amp: 0.08, phase: 0.7 },
    ],
    20
  );

  // SVG viewBox expands slightly with progress so expanded lobes remain unclipped
  const vbMinX = -85 - p * 50;
  const vbMinY = -65 - p * 35;
  const vbWidth = 270 + p * 100;
  const vbHeight = 160 + p * 70;

  return `
    <div style="position: relative; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="transform: rotate(${headingDeg}deg); transform-origin: center center; position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 16px rgba(249,115,22,${0.35 + p * 0.35}));">
        <svg viewBox="${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}" width="${width}" height="${height}" fill="none" style="overflow: visible;">
          <defs>
            <!-- Radial Heatmap Core Gradient -->
            <radialGradient id="vesselHeatmapRadial" cx="50" cy="16" r="${rxOuter * 1.1}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#58111a" stop-opacity="0.99" />
              <stop offset="22%" stop-color="#991b1b" stop-opacity="0.98" />
              <stop offset="44%" stop-color="#c2410c" stop-opacity="0.95" />
              <stop offset="66%" stop-color="#ea580c" stop-opacity="0.92" />
              <stop offset="82%" stop-color="#f97316" stop-opacity="0.88" />
              <stop offset="94%" stop-color="#fb923c" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.25" />
            </radialGradient>

            <!-- Inner Deep Crimson Core Radial -->
            <radialGradient id="coreRedRadial" cx="50" cy="14" r="${rxInner * 1.1}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#450a0a" stop-opacity="0.99" />
              <stop offset="35%" stop-color="#7f1d1d" stop-opacity="0.98" />
              <stop offset="70%" stop-color="#991b1b" stop-opacity="0.96" />
              <stop offset="90%" stop-color="#b91c1c" stop-opacity="0.92" />
              <stop offset="100%" stop-color="#dc2626" stop-opacity="0.85" />
            </radialGradient>

            <!-- Warm Outer Heat Glow Filter -->
            <filter id="outerOrangeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.0" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- ========================================================= -->
          <!-- TIER 1: OUTER LOW-CONCENTRATION ORANGE SHEEN & CONTOUR   -->
          <!-- ========================================================= -->
          <path
            d="${pathOuter}"
            fill="url(#vesselHeatmapRadial)"
            filter="url(#outerOrangeGlow)"
            stroke="#f59e0b"
            stroke-width="${1.6 + p * 0.4}"
            stroke-opacity="0.9"
          />

          <!-- ========================================================= -->
          <!-- TIER 2: INTERMEDIATE RED-ORANGE CONTOUR (MEDIUM CONCENTRATION) -->
          <!-- ========================================================= -->
          <path
            d="${pathMid}"
            fill="#ea580c"
            fill-opacity="0.85"
            stroke="#f97316"
            stroke-width="1.6"
            stroke-opacity="0.92"
          />

          <!-- ========================================================= -->
          <!-- TIER 3: INNER HIGH-CONCENTRATION DEEP BLOOD RED CORE     -->
          <!-- ========================================================= -->
          <path
            d="${pathInner}"
            fill="url(#coreRedRadial)"
            stroke="#ef4444"
            stroke-width="1.5"
            stroke-opacity="0.9"
          />

          <!-- Ruptured Portside Cargo Tank Discharge Pool -->
          <path
            d="${pathBreachCore}"
            fill="#7f1d1d"
            fill-opacity="0.95"
            stroke="#f87171"
            stroke-width="1.2"
          />

          <!-- ========================================================= -->
          <!-- AFRAMAX CRUDE CARRIER HULL & RIGGING                      -->
          <!-- ========================================================= -->
          <g style="filter: drop-shadow(0 4px 14px rgba(0,0,0,0.95));">
            <!-- Steel Hull with Crisp White Edge Border -->
            <path d="M6 16 L18 5 L82 5 L94 16 L82 27 L18 27 Z" fill="#0f0f0f" stroke="#ffffff" stroke-width="1.8" />
            
            <!-- Internal Cargo Tank Bays -->
            <rect x="22" y="8" width="10" height="16" rx="1.5" fill="#1c1c1c" stroke="#525252" stroke-width="0.8" />
            <rect x="34" y="8" width="10" height="16" rx="1.5" fill="#1c1c1c" stroke="#525252" stroke-width="0.8" />
            
            <!-- Ruptured Cargo Tank #3 (Prominent Red Manifold Structure) -->
            <rect x="46" y="7" width="12" height="18" rx="2" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.6" />
            <rect x="49" y="10" width="6" height="12" rx="1" fill="#ef4444" opacity="0.92" />
            <line x1="52" y1="7" x2="52" y2="25" stroke="#ffffff" stroke-width="1" stroke-dasharray="1,1" />
            
            <!-- Cargo Tank Bay #4 -->
            <rect x="60" y="8" width="9" height="16" rx="1.5" fill="#1c1c1c" stroke="#525252" stroke-width="0.8" />
            
            <!-- Deck Catwalk Ladder Line -->
            <line x1="18" y1="16" x2="72" y2="16" stroke="#ffffff" stroke-width="1.4" stroke-dasharray="2.5,2.5" />
            
            <!-- Superstructure / Wheelhouse -->
            <rect x="71" y="7" width="12" height="18" rx="2" fill="#262626" stroke="#a3a3a3" stroke-width="1.2" />
            <rect x="74" y="10" width="6" height="12" fill="#404040" />
            <circle cx="77" cy="16" r="1.6" fill="#f8fafc" />
            
            <!-- Exhaust Funnel (Golden Amber) -->
            <circle cx="81" cy="16" r="2.4" fill="#f59e0b" stroke="#fbbf24" stroke-width="0.8" />
            
            <!-- Bow Navigation Light (Luminous Green) -->
            <circle cx="11" cy="16" r="2.2" fill="#22c55e" stroke="#86efac" stroke-width="0.8" />
          </g>
        </svg>
      </div>
    </div>
  `;
}
