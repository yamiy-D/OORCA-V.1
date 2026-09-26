# OORCA Installation, Configuration & Run Guide

This document provides complete instructions for installing, configuring API keys, running in development or production, and preparing a clean export of the **OORCA (Ocean Observation & Risk Coastal Analysis)** platform.

---

<!-- =========================================================================
     STEP 1: SYSTEM PREREQUISITES & ENVIRONMENT REQUIREMENTS
     ========================================================================= -->
## 1. Prerequisites

Before installing OORCA, ensure the host machine meets the following runtime requirements:

- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` recommended LTS).
- **Package Manager**: `npm` (`v9.x` or higher), `pnpm`, or `bun`.
- **Operating System**: Linux, macOS, or Windows (WSL2 recommended on Windows).
- **Web Browser**: Chrome, Edge, Firefox, or Safari with WebGL 2.0 enabled.

Verify installed versions:
```bash
node -v   # Should output v18.0.0 or higher
npm -v    # Should output 9.0.0 or higher
```

<!-- Alternative package manager check (commented out for easy update):
```bash
# pnpm -v
# bun -v
# yarn -v
```
-->

---

<!-- =========================================================================
     STEP 2: INSTALLATION & DEPENDENCY RESOLUTION
     ========================================================================= -->
## 2. Installation

1. **Extract or Clone the Project**:
   ```bash
   cd oorca
   ```

2. **Install Node Dependencies**:
   Install all frontend and backend dependencies listed in `package.json`:
   ```bash
   npm install
   ```

   <!-- Alternative clean install command (commented out for easy update):
   ```bash
   # npm ci --prefer-offline
   # pnpm install
   # bun install
   ```
   -->

---

<!-- =========================================================================
     STEP 3: ENVIRONMENT VARIABLES & API KEYS CONFIGURATION
     ========================================================================= -->
## 3. Environment Variables & API Keys Setup

OORCA uses an environment file (`.env`) for configuring backend server parameters and external service credentials.

### Quick Setup:
If `.env` does not already exist, copy it from `.env.example`:
```bash
cp .env.example .env
```

### Complete API Keys Directory:

Open `.env` in any text editor and populate the variables:

| Variable Name | Required | Provider / Service | Description & Where to Obtain |
|---|---|---|---|
| `PORT` | Optional | Internal Server | Port for the backend and Vite dev server (Default: `3000`). |
| `NODE_ENV` | Optional | Internal Server | Environment mode: `development` or `production`. |
| `APP_URL` | Optional | Internal Server | Host origin URL (e.g. `http://localhost:3000`). |
| `GEMINI_API_KEY` | Optional | Google AI Studio | Powers automated environmental impact analysis and advisory reports. Obtain at [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `OPENWEATHER_API_KEY` | Optional | OpenWeatherMap | Real-time wind speed, wind direction, temperature, and atmospheric pressure. Obtain at [OpenWeatherMap](https://openweathermap.org/api). |
| `GFW_API_TOKEN` | Optional | Global Fishing Watch | Real-time maritime AIS vessel positions and global fleet tracking. Obtain at [Global Fishing Watch Portal](https://globalfishingwatch.org/our-apis/). |
| `OCEAN_DATA_API_KEY` | Optional | Ocean Data Provider | Metocean current vectors and bathymetry data feeds (e.g. Stormglass, CMEMS). |
| `NOAA_API_KEY` | Optional | NOAA National Centers | Tidal and hydrodynamic forecasts. Obtain at [NOAA CDO](https://www.ncdc.noaa.gov/cdo-web/token). |
| `COPERNICUS_API_KEY` | Optional | Copernicus Marine (CMEMS) | European ocean physics, sea surface temperature, and velocity grids. Register at [Copernicus Marine](https://marine.copernicus.eu/). |
| `VITE_SATELLITE_API_KEY` | Optional | Copernicus Data Space | Sentinel-1 SAR radar imagery for satellite oil slick detection. Register at [Copernicus Data Space](https://dataspace.copernicus.eu/). |
| `VITE_AIS_API_KEY` | Optional | Commercial AIS | Commercial vessel telemetry feeds (Spire Global, MarineTraffic, AISHub). |
| `VITE_CARTO_API_KEY` | Optional | CARTO / Mapbox | Custom basemap styles. (Default runs on public CARTO Dark Matter tiles). |
| `DATABASE_URL` | Optional | PostgreSQL / Cloud SQL | Database connection URI for archiving historical spill simulations. |

> **Autonomous Fallback Note**:  
> All external APIs are completely optional for offline or testing use. When API keys are omitted, OORCA automatically activates calibrated hydrodynamic mathematical models (Fay spreading equations, multi-tier concentration plumes, synthetic tidal drift) so all features and simulations function out of the box.

---

<!-- =========================================================================
     STEP 4: RUNNING IN DEVELOPMENT MODE
     ========================================================================= -->
## 4. Running the Application (Development Mode)

Start the combined full-stack Express backend and Vite hot-module-replacement (HMR) server:
```bash
npm run dev
```

The console will indicate when the server is ready:
```text
[OORCA] Simulation Engine server active at http://0.0.0.0:3000
```

Open your browser to:
**`http://localhost:3000`**

### Available URLs:
- **Home / Command Landing**: `http://localhost:3000/`
- **Oil Spill Simulation Engine**: `http://localhost:3000/simulation`
- **Backend Health Check**: `http://localhost:3000/api/health`
- **Weather API Proxy**: `http://localhost:3000/api/environment/weather?lat=18.92&lng=72.83`

---

<!-- =========================================================================
     STEP 5: BUILDING & RUNNING IN PRODUCTION MODE
     ========================================================================= -->
## 5. Building & Running in Production

To create an optimized, compiled production build:

1. **Build the Application**:
   Compiles client assets via Vite and bundles the backend server using esbuild:
   ```bash
   npm run build
   ```
   This generates:
   - `dist/` (client-side static HTML, CSS, JavaScript, and asset bundles)
   - `dist/server.cjs` (bundled Node.js production server)

2. **Start the Production Server**:
   ```bash
   npm start
   ```

<!-- Alternative production execution (commented out for easy update):
```bash
# NODE_ENV=production PORT=8080 node dist/server.cjs
# pm2 start dist/server.cjs --name "oorca-simulation"
```
-->

3. **Verify Production Status**:
   Visit `http://localhost:3000` to confirm everything renders seamlessly.

---

<!-- =========================================================================
     STEP 6: EXPORTING THE PROJECT (CLEAN ARCHIVE)
     ========================================================================= -->
## 6. How to Export the Project

When preparing to share, archive, or export the application:

### Method A: Automated Clean ZIP Export (Recommended)
Run the following command in terminal to create a clean zip excluding bulky caches:
```bash
# Create a timestamped, clean zip archive
zip -r oorca-export-$(date +%Y%m%d).zip . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".DS_Store"
```

<!-- Method B: Using tar.gz (commented out for easy update):
```bash
# tar --exclude='./node_modules' --exclude='./dist' --exclude='./.git' -czvf oorca-export.tar.gz .
```
-->

### Method B: Manual Copy / Export Checklist
If creating a zip or copying manually, include:
- `src/` (All React components, pages, hooks, services, styles)
- `backend/` (All Express routes, controllers, and config)
- `public/` (Static assets, logos, bathymetry GeoJSON)
- `server.ts` (Full-stack Express server entry point)
- `package.json` & `tsconfig.json` & `vite.config.ts`
- `index.html` & `metadata.json`
- `.env.example` & `.env`
- `README.md` & `INSTALLATION_GUIDE.md`

**Always exclude:**
- `node_modules/` (Re-generated by recipient via `npm install`)
- `dist/` (Re-generated by recipient via `npm run build`)
- `.git/` (Optional version history)

---

<!-- =========================================================================
     STEP 7: CODE INTEGRITY & LINT CHECK
     ========================================================================= -->
## 7. Verification & Quality Assurance

Before exporting or deploying, verify codebase integrity:

```bash
# 1. Check TypeScript compilation without errors
npm run lint

# 2. Verify complete production build
npm run build
```

---

<!-- =========================================================================
     STEP 8: TROUBLESHOOTING COMMON QUESTIONS
     ========================================================================= -->
## 8. Troubleshooting

### Port 3000 In Use (`EADDRINUSE`)
If port 3000 is occupied by another process:
```bash
# Change port temporarily via environment variable:
PORT=3001 npm run dev
```
Or kill the process occupying port 3000:
```bash
npx kill-port 3000
```

### Map Canvas Blank / WebGL Disabled
- Ensure hardware acceleration is enabled in your browser settings (`chrome://settings/system` -> *Use graphics acceleration when available*).
- Switch basemap layers via the floating layer selector if local firewalls restrict external tile CDNs.

---

<!-- =========================================================================
     STEP 9: CONTACT & MAINTAINER SUPPORT
     ========================================================================= -->
## 9. Support & License

- **License**: Apache License 2.0
- **Platform**: OORCA Marine Environmental Intelligence System
- **Engine**: Calibrated OpenDrift & Fay Hydrodynamic Dispersion Engine
