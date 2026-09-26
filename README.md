# OORCA — Oil Spill Simulator & Marine Environmental Intelligence

OORCA is a marine environmental intelligence platform designed to support **oil-spill monitoring, simulation, risk assessment, and coastal impact analysis**.

It combines geospatial visualization, environmental data, hydrodynamic modelling, and ecological risk analysis to help users understand how an oil spill may spread and which marine or coastal areas could be affected.

## What OORCA Does

- **Oil Spill Simulation** — Models the movement and spreading of an oil spill over time.
- **Geospatial Visualization** — Displays spill origin, affected areas, plume contours, vessel information, and environmental conditions on an interactive map.
- **Environmental Modelling** — Accounts for factors such as wind, ocean currents, spreading, evaporation, and natural dispersion.
- **Risk Assessment** — Estimates risks to marine ecosystems, shorelines, and human health.
- **Ecological Impact Analysis** — Identifies potentially vulnerable habitats and marine life in the affected region.
- **Shoreline Impact Forecasting** — Estimates when vulnerable coastal locations may be reached by the spill.
- **Simulation Timeline** — Allows users to inspect the projected development of a spill over a 72-hour period.
- **Data Transparency** — Distinguishes between live environmental data, cached data, and estimated/fallback results.

## How the Simulation Works

A user provides the spill location, volume, oil type, start time, and relevant vessel information. OORCA combines these inputs with environmental conditions and mathematical oil-spreading and weathering models to generate a time-based simulation.

The resulting analysis can include:

- Spill extent and concentration zones
- Estimated surface oil remaining
- Evaporation and natural dispersion
- Spill movement and trajectory
- Ecological risk
- Coastal impact and estimated arrival windows

The platform can operate using calibrated fallback models when external data services are unavailable, allowing the simulation to remain usable without requiring every external API.

## Data & Scientific Integration

OORCA is designed to work with external environmental and maritime data sources and can be extended with systems such as:

- **OpenDrift / OpenOil** for advanced oil-spill particle tracking
- **Copernicus Marine** for ocean and current data
- **NOAA** for meteorological and oceanographic data
- **AIS data sources** for vessel tracking and spill attribution
- **Satellite remote sensing** for oil-spill detection and monitoring
- **Marine habitat and sensitivity datasets** for ecological impact assessment

## Demo & Live Data

OORCA supports two operating approaches:

**Demo Mode**  
Uses calibrated mathematical and regional environmental models so the platform can be demonstrated without external data dependencies.

**Live Data Mode**  
Uses configured external environmental and maritime data services when available.

The application is designed to clearly distinguish estimated or fallback information from externally sourced data.

## Getting Started

### Requirements

- Node.js 18+
- npm 9+
- A modern browser with WebGL support

### Installation

```bash
npm install
```

Configure the required environment variables using the project's `.env.example` file, then start the application:

```bash
npm run dev
```

Open the local URL shown by the development server in your browser.

## Project Vision

OORCA aims to provide a unified environment for **detecting, simulating, understanding, and responding to marine oil-spill events** — connecting environmental intelligence with practical coastal risk analysis.

## License

Licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.
