# OORCA — Oil Spill Simulator & Marine Environmental Intelligence

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

---

## 1. PROJECT OVERVIEW

**OORCA** (*Ocean Observation & Risk Coastal Analysis / Oil Spill Response & Coastal Risk Analysis*) is a professional ocean intelligence, oil spill monitoring, and scientific hydrodynamic simulation platform.

The **Oil Spill Simulator** (`/simulation`) serves as the primary operational command center of the OORCA platform. It empowers maritime emergency response teams, coast guards, port authorities, and environmental scientists to:
- Model and inspect oil spill spreading dynamics across active sea lanes.
- Interactively project multi-tier hydrocarbon concentration contours from origin coordinates over 72-hour forward timelines.
- Quantify weathering mechanisms (evaporation rates, natural dispersion, and remaining surface oil).
- Assess acute risks to marine ecosystems, coastal flora/fauna, and human health.
- Forecast shoreline arrival times across vulnerable beaches, ports, and coastal communities.

---

## 2. FEATURES

- **Interactive Geospatial Map**:
  - High-resolution dark satellite ocean and maritime basemaps.
  - Interactive point-and-click coordinate selection directly from the ocean canvas.
  - Dynamic map layers (Satellite Ocean, Dark Maritime, Ocean Basemap).
  - Subtle metocean current streamlines with animated directional vectors.
  - Toggleable wind and wave overlay grids.
  - Integrated nautical compass and dynamic metric scale bar.
- **Organic Oil Concentration Contours**:
  - Multi-tier hydrodynamic plume visualization reflecting physical spreading.
  - Realistic color scale: Very Thick (near black) → Thick (deep red) → Medium (red-orange) → Thin (orange) → Very Thin (yellow sheen).
  - Directional elongation aligned with combined wind and surface current drift vectors.
- **Vessel Kinematics & Origin Pin**:
  - Prominent red location pin marker at the spill origin.
  - Vessel silhouette oriented dynamically to ship heading (0–360°).
  - Reconstructed vessel trajectory axis and wake dispersion line.
- **Simulation Timeline Controls**:
  - Play, pause, and interactive scrubber slider across 0 to 72 hours.
  - Configurable simulation steps (+12h, +24h, +36h, +48h, +60h, +72h).
  - Real-time timestamp calculation and progress counter.
- **Input Parameters Panel**:
  - Coordinate inputs (Latitude, Longitude) with geocoded location name.
  - Spill parameter configuration: Amount, Unit (Tonnes, Barrels, m³, Gallons), Oil Type (Crude, Diesel, Heavy Fuel, Marine Fuel, Refined), Start Time.
  - Vessel details: Name, Vessel Type, IMO Number, Length, Breadth, Draft, Heading.
  - One-click `▶ RUN SIMULATION` engine re-calculation.
- **Bottom Analytics & Risk Dashboard**:
  - **Spill Summary**: Total spilled, estimated slick area (km² via Fay's spreading equations), max shore arrival, weathering level, evaporation %, dispersion %, and surface remaining %.
  - **Danger Assessment**: Overall risk status badge (HIGH / MEDIUM / LOW), risk to environment, risk to shoreline, risk to human health, and clean-up difficulty.
  - **Ecological Inhabitants at Risk**: Structured ecological census (Mangroves, Coral Reefs, Seagrass Beds, Dolphins, Sea Turtles, Commercial Fish, Plankton) with presence and risk levels.
  - **Shoreline Impact (Est.)**: Coastal impact receptor table (Alibaug, Revdanda, Murud, Kihim, Dighi) with estimated arrival windows and click-to-pan camera focus.
- **Export & Session State**:
  - Save simulation configuration to local browser storage.
  - Export full scientific JSON simulation dossier.
  - One-click URL coordinate sharing.
  - Full modular separation ready for backend OpenDrift / NOAA / Copernicus API integration.

---

## 3. INTERACTIVE SIMULATION MAP (MAPLIBRE GL INTEGRATION)

The OORCA simulation engine features a high-performance **WebGL-powered interactive map** built with **MapLibre GL JS**, drawing architectural inspiration from modern ocean intelligence and situational command platforms (like OSIRIS):

### Why MapLibre GL JS?
- **Full WebGL Performance**: Renders high-density geographic data, multi-tier concentration plumes, and hydrodynamic flowlines smoothly at 60 FPS using hardware acceleration.
- **Dynamic GeoJSON Updates**: Sources (`oil-spill`, `spill-area`, `plume-contours`) are updated live via `source.setData()` without flickering or full canvas re-initialization.
- **Dark Maritime Basemap**: Uses the high-contrast Carto Dark Matter GL vector style (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`) by default, keeping focus firmly on the ocean and spill telemetry.
- **Smooth Camera Mechanics**: High-precision `map.flyTo()` transitions with easing, pitch, bearing, and zoom interpolation.
- **Open-Source Freedom**: BSD-3 licensed, free of restrictive commercial tokens or vendor lock-in.

### Component Architecture (`SimulationMap.tsx`)
```text
Map Initialization (MapLibre GL + Dark Matter Vector Basemap)
       ↓
Map Controls (Zoom In/Out, Pitch Visualization, Compass Reset)
       ↓
Interactive Location Selection (Click map → Capture lat/lng → FlyTo)
       ↓
Oil Spill Source Layer (oil-spill-glow + oil-spill-core circle layers)
       ↓
Oil Spill Affected Area Layer (spill-area-fill + spill-area-outline)
       ↓
Dynamic Plume Contours & Trajectory Axis (OpenDrift Physical Model)
       ↓
Smooth Camera Movement (Targeted pan/zoom on click or shoreline focus)
```

### Layer Hierarchy
```text
BASE MAP (Carto Dark Matter GL)
│
├── 🌊 Ocean Currents / Streamlines (`ocean-currents-lines`)
│
├── 🟠 Oil Spill Affected Area (`spill-area-fill` & `spill-area-outline`)
│
├── 🛢️ Multi-Tier Plume Contours (`plume-contours-fill` & `plume-contours-outline`)
│
├── 📍 Trajectory Axis Line (`trajectory-axis`)
│
├── 💨 Wind & Waves Vector Field (`env-vectors-points`)
│
├── 🛳️ Vessel Marker & Heading Alignment
│
└── 🔴 Oil Spill Source Marker (`oil-spill-glow` & `oil-spill-core`)
```

### Dynamic Polygon Generation
The map generates geodesic polygons around spill coordinates with 64 coordinate steps using great-circle trigonometry:
```ts
createCircle(lng, lat, affectedRadius, 64)
```

---

<!-- =========================================================================
     STEP 1: INSTALLATION & EXPORT REFERENCE
     ========================================================================= -->
> 📘 **Detailed Installation & Export Guide**: See [`INSTALLATION_GUIDE.md`](./INSTALLATION_GUIDE.md) for the complete export checklist, zip export commands, Docker guide, and comprehensive API key documentation.

---

## 4. PREREQUISITES

Before running the application, ensure the following software is installed on your workstation:
- **Node.js**: Version 18.x or higher (Node 20+ LTS recommended).
- **npm**: Version 9.x or higher (or `pnpm` / `bun`).
- Modern web browser with WebGL 2.0 and Canvas support (Google Chrome, Firefox, Safari, Edge).

---

<!-- =========================================================================
     STEP 2: INSTALLATION COMMANDS
     ========================================================================= -->
## 5. INSTALLATION

1. Open your terminal in the project directory:
   ```bash
   cd oorca
   ```

2. Install all required dependencies:
   ```bash
   npm install
   ```

<!-- Alternative package manager commands (commented out for easy update):
```bash
# pnpm install
# bun install
```
-->

---

<!-- =========================================================================
     STEP 3: ENVIRONMENT CONFIGURATION & API KEYS DIRECTORY
     ========================================================================= -->
## 6. ENVIRONMENT CONFIGURATION & API KEYS

1. Copy the template environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor and configure your environment variables:
   ```env
   # Server Runtime & Port
   PORT=3000
   NODE_ENV=development
   APP_URL=http://localhost:3000

   # Google Gemini AI Key (for environmental risk reports)
   GEMINI_API_KEY=

   # Live Weather Intelligence (OpenWeatherMap API)
   OPENWEATHER_API_KEY=

   # Global Fishing Watch (GFW) Maritime AIS Vessel Tracking
   GFW_API_TOKEN=

   # Hydrodynamic & Ocean Current Feeds (NOAA / Copernicus)
   NOAA_API_KEY=
   COPERNICUS_API_KEY=
   OCEAN_DATA_API_KEY=

   # Remote Sensing Satellite Radar Imagery (Sentinel Hub)
   VITE_SATELLITE_API_KEY=
   ```

> 💡 **Autonomous Fallback Note**:  
> All external API keys are optional. If keys are omitted or left blank, OORCA automatically activates calibrated hydrodynamic mathematical models (Fay spreading equations, multi-tier concentration plumes, synthetic tidal drift) so all features and simulations function out of the box.

---

<!-- =========================================================================
     STEP 4: RUNNING IN DEVELOPMENT & PRODUCTION
     ========================================================================= -->
## 7. HOW TO START THE APPLICATION

### Development Mode:
To launch the local full-stack server (Express backend + Vite HMR frontend):
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Production Build & Run:
```bash
# Build the production bundle
npm run build

# Start the production Node server
npm start
```

---

<!-- =========================================================================
     STEP 5: EXPORTING THE PROJECT (CLEAN ARCHIVE)
     ========================================================================= -->
## 8. HOW TO EXPORT THE APPLICATION

To export the project into a clean archive without bloated build caches or dependencies:

```bash
# Generate a clean timestamped ZIP archive
zip -r oorca-export-$(date +%Y%m%d).zip . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".DS_Store"
```

<!-- Alternative tar.gz export (commented out for easy update):
```bash
# tar --exclude='./node_modules' --exclude='./dist' --exclude='./.git' -czvf oorca-export.tar.gz .
```
-->


The terminal will display the local development URL (typically `http://localhost:3000`). Open this link in your browser to access the OORCA platform.

Navigate directly to the simulation interface:
- Via browser URL: `http://localhost:3000/simulation`
- Via the floating Command Navigation Wheel: Click the `Sim` icon.

To build the production bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 7. HOW TO STOP THE APPLICATION

To stop the development server running in your terminal:
1. Focus your terminal window where `npm run dev` is executing.
2. Press:
   ```
   Ctrl + C
   ```
   *(or `Cmd + C` on macOS)*
3. If prompted `Terminate batch job (Y/N)?`, type `Y` and press Enter.

This safely terminates the Node.js development server process.

---

## 8. HOW THE SIMULATION WORKS

The simulation pipeline follows a structured 11-step execution flow:

```
[1. Application Loads]
        ↓
[2. Default Simulation Parameters Initialize (100t Crude Oil, Arabian Sea, MV Oceanic Star)]
        ↓
[3. Map Canvas Initializes (Offshore Mumbai / Maharashtra Coast corridor)]
        ↓
[4. Metocean Conditions Ingested (Wind 14.5 kts, Current 1.2 kts, Water Temp 28.5°C)]
        ↓
[5. User Modifies Location / Coordinates / Spill Volume / Vessel Attributes]
        ↓
[6. User Clicks '▶ RUN SIMULATION' or Drags Timeline Scrubber]
        ↓
[7. Simulation Service Ingests Metocean Drift Vectors]
        ↓
[8. Hydrodynamic Contours Generated (5 Concentration Tiers: Very Thick to Very Thin Sheen)]
        ↓
[9. Weathering Rates Computed (Fay's Spreading, Evaporation %, Natural Dispersion %)]
        ↓
[10. Danger Assessment & Ecological Habitats Evaluated]
        ↓
[11. Coastal Arrival Windows Updated & Interactive Playback Enabled]
```

---

## 9. DEMO MODE VS LIVE DATA MODE

### DEMO MODE (Default)
- **Active when**: `VITE_ENVIRONMENT_MODE=demo` or when external API keys are empty.
- **Behavior**: Uses scientifically calibrated hydrodynamic dispersion algorithms based on real-world oceanographic baselines for the Arabian Sea / Maharashtra coastal waters.
- **Safety**: Runs 100% locally and reliably without external network dependencies, rate limits, or API billing costs.

### LIVE DATA MODE
- **Active when**: Valid API keys for NOAA, Copernicus CMEMS, or OpenDrift microservices are configured in `.env`.
- **Behavior**: Queries live meteorological and ocean current vector grids ($u, v$), assimilating real-time satellite radar passes and live AIS transponder broadcasts.

*Note: OORCA clearly distinguishes demo mode from live data feeds to ensure transparency.*

---

## 10. PROJECT ARCHITECTURE

The Simulation Page codebase is organized into clean, modular layers:

```
src/
├── pages/
│   ├── SimulationPage.tsx             # Main Simulation workspace page
│   ├── AlertCenterPage.tsx            # Alert Centre forensic investigation suite
│   └── HomePage.tsx                   # Platform homepage
│
├── components/
│   └── simulation/
│       ├── SimulationHeader.tsx       # Top branding bar, actions (New, Save, Export, Share)
│       ├── InputParametersPanel.tsx   # Left collapsible control panel (Location, Spill, Vessel)
│       ├── SimulationControls.tsx     # Floating playback HUD (Play/Pause, Slider, Timestamps)
│       ├── ConcentrationLegend.tsx    # Floating 5-tier concentration thickness gradient
│       ├── MapControls.tsx            # Layer switcher, Wind/Wave toggles, Zoom buttons
│       ├── CompassAndScale.tsx        # Nautical compass and metric scale bar overlays
│       ├── SimulationMap.tsx          # Leaflet interactive map with organic contour rendering
│       ├── SpillSummary.tsx           # Spill area, total volume, weathering breakdown
│       ├── DangerAssessment.tsx       # Overall risk status badge and categorical indicators
│       ├── EcologicalRiskTable.tsx    # Ecological species/habitats vulnerability table
│       └── ShorelineImpact.tsx        # Coastal landfall receptor table with arrival windows
│
├── services/
│   ├── simulationService.ts          # Core simulation execution engine
│   ├── riskAssessmentService.ts      # Multi-factor ecological and shoreline risk scoring
│   ├── environmentalDataService.ts   # Ocean current, wind, and temperature data provider
│   └── mapService.ts                 # Tile layer providers and coordinate utilities
│
├── types/
│   └── simulation.ts                 # Strict TypeScript interfaces and domain types
│
├── data/
│   ├── ecologicalData.ts             # Curated marine habitat vulnerability database
│   └── shorelineData.ts              # Coastal receptor coordinates and arrival baselines
│
└── utils/
    ├── simulationCalculations.ts     # Fay's spreading math, organic contour polygon generation
    └── riskCalculations.ts           # Danger assessment and arrival window formulas
```

---

## 11. SIMULATION BACKEND ENGINE & REST APIS

The **OORCA Simulation Backend** is a modular TypeScript/Express calculation engine that imports real-world open-source environmental data to model realistic oil spill movement, spreading geometry, and weathering kinetics.

### Architecture Overview

```text
Data Providers (Open-Meteo Weather & Marine, Climatology)
      ↓
Data Normalization Layer (Strict SI Units: m/s, °C, km)
      ↓
Environmental Data Engine (Caching, Validation, Regional Context)
      ↓
Simulation Calculation Engine (Fay 3-Phase Spreading + Mackay Weathering)
      ↓
Simulation Results API (REST Endpoints)
      ↓
Frontend Simulation Map & Timeline Scrubber
```

### Directory Structure

```text
backend/
├── api/
│   ├── simulation.routes.ts        # POST /start, GET /:id, GET /timeline, GET /measurements
│   └── environment.routes.ts       # GET /api/environment
├── controllers/
│   ├── simulation.controller.ts    # Request validation and response formatting
│   └── environment.controller.ts   # Lat/Lng query parameter validation
├── services/
│   ├── simulation.service.ts       # Time-stepped timeline & trajectory execution
│   ├── environmentalData.service.ts# Data ingestion, normalization, & metadata tagging
│   ├── oilSpillCalculation.service.ts # Hydrodynamic drift, Fay spreading, & weathering
│   └── geometry.service.ts         # Elliptical geometry & multi-tier Bonn contours
├── providers/
│   ├── weather.provider.ts         # Open-Meteo 10m wind, gusts, & air temp
│   ├── ocean.provider.ts           # Open-Meteo ocean currents, wave height, & SST
│   └── geographic.provider.ts      # Sensitive coastal features & proximity
├── models/
│   ├── simulation.model.ts         # Strict TypeScript types for simulation
│   └── environmentalData.model.ts  # Normalized environmental data structures
├── utils/
│   ├── vectorCalculation.ts        # Drift vectors with Coriolis deflection
│   ├── unitConversion.ts           # knots, m/s, tonnes, bbls, m³
│   └── geoCalculation.ts           # Haversine geodesics & destination coordinates
└── config/
    └── environment.ts              # Port, TTL caching, & physical constants
```

### Installation & Execution

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start the Backend Server
In development mode (starts Express with Vite SPA middleware on port 3000):
```bash
npm run dev
```

In production mode (compiles backend with esbuild and serves static build):
```bash
npm run build
npm start
```

#### 3. Stop the Backend Server
Press `Ctrl + C` in the terminal, or run:
```bash
pkill -f "tsx server.ts" || pkill -f "node dist/server.cjs"
```

### Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | External port for the server | `3000` |
| `WEATHER_API_KEY` | Optional API key for external weather services (Open-Meteo works without keys) | `""` |
| `OCEAN_DATA_API_KEY` | Optional API key for ocean current services | `""` |
| `NOAA_API_KEY` | Optional NOAA GFS API key | `""` |
| `COPERNICUS_API_KEY` | Optional Copernicus Marine API key | `""` |

### Open-Source Data Providers & Caching

- **Weather Provider (`weather.provider.ts`)**: Retrieves live 10m wind velocity and direction from Open-Meteo Global Weather Model (ECMWF/GFS). Results are cached in-memory for 30 minutes.
- **Ocean Provider (`ocean.provider.ts`)**: Retrieves surface current velocity and direction, significant wave height, and sea surface temperature from Open-Meteo Marine API. Results are cached in-memory for 60 minutes.
- **Fallback & Metadata Transparency**: When external APIs encounter network timeouts or rate limits, the system falls back to calibrated regional oceanographic climatology (e.g. Arabian Sea/INCOIS baselines) and explicitly tags `status: "cached"` or `status: "estimated"` with `confidence: "medium"`. Real observed data is strictly distinguished from estimated data.


##  FUTURE INTEGRATION POSSIBILITIES

The architecture is built ready for integration with external scientific systems:
1. **OpenDrift Ocean Modeling Suite**: Connection to an OpenDrift Python backend running the `OpenOil` sub-module for full multi-component Lagrangian particle tracking.
2. **Copernicus Marine Environment Monitoring Service (CMEMS)**: Direct ingestion of Global Ocean Physics Analysis and Forecast ($1/12^\circ$ resolution current vectors).
3. **NOAA Global Forecast System (GFS)**: Live $10\text{m}$ wind field vectors and sea surface temperature (SST) grids.
4. **EMODnet Seabed & Biology**: Real-time European and international marine habitat sensitivity mapping.
5. **Real-time AIS Telemetry**: Live transponder streaming via Spire Global or AISHub for automated vessel attribution.
6. **Gemini AI Environmental Analysis**: Automated risk narrative generation and regulatory impact briefs.

---

##  TROUBLESHOOTING

### Map Not Loading
- **Cause**: Network restriction or tile server timeout.
- **Solution**: Switch tile layers using the Map Layers tool in the top-right corner to *Dark Maritime* or *Ocean Basemap*.

### Port Already in Use (EADDRINUSE: 3000)
- **Cause**: Another process is occupying port 3000.
- **Solution**: Stop any previous dev server processes (`Ctrl + C`) or run:
  ```bash
  npx kill-port 3000
  ```
  Then restart with `npm run dev`.

### Missing Dependencies
- **Cause**: Incomplete `node_modules` installation.
- **Solution**: Run a clean install:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### TypeScript / Lint Warnings
- **Solution**: Validate the codebase with:
  ```bash
  npm run lint
  ```

---

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
