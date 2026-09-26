# OORCA

### Oceanic Oil Reconnaissance, Correlation & Attribution

Satellite-based oil-spill detection, drift reconstruction, AIS correlation, and vessel attribution.

OORCA is built around **SIH Problem Statement 26143** from the **National Technical Research Organisation (NTRO)**. The problem is straightforward to describe but not so straightforward to solve: find an oil slick, work out where it came from, and use vessel movement data to narrow down which vessel could have caused it.

The project brings those pieces into one place instead of treating satellite imagery, ocean conditions, and AIS traffic as separate datasets.

## What OORCA actually does

### 🛰️ Find the spill

The detection side is intended for **SAR and EO satellite imagery**, with a focus on identifying and characterising an oil slick.

From a detected slick, the system can work with:

- Location and extent
- Geometric properties
- Concentration zones
- Estimated spill age, when the available data supports it

### 🌊 Work backwards and forwards

A satellite image gives you a snapshot. It does not, by itself, tell you how the slick got there.

OORCA uses **wind, ocean currents, and other environmental conditions** to simulate the movement of the spill. This gives two useful views:

- **Hindcasting** — move the slick backwards to estimate its origin and the relevant time window.
- **Forecasting** — project the possible movement of the slick after the observation.

The current simulation interface supports a **72-hour timeline** for examining this movement.

### 🚢 Compare the result with AIS traffic

Once an approximate origin and time window are available, historic **AIS data** can be used to reconstruct vessel traffic around the area.

Instead of treating every nearby vessel as equally relevant, OORCA looks at factors such as:

- Distance from the estimated origin
- Vessel trajectory
- Time of passage
- Spatial and temporal overlap
- Movement patterns / behavioural anomalies

These factors are used to produce a set of candidate vessels for further investigation.

This is the **correlation and attribution** part of OORCA.

### 🌱 See what could be affected

The simulation can also be compared with coastal and ecological information to estimate:

- Marine habitat exposure
- Affected species or ecological resources
- Shoreline impact
- Estimated coastal arrival windows
- Environmental and human-health risk

It is meant to give the investigator more context than just an oil-plume polygon on a map.

## The basic idea

```text
Satellite imagery
       ↓
Oil-spill detection
       ↓
Slick characterisation
       ↓
Wind + ocean-current data
       ↓
Hindcast ───────→ Estimated origin / time
       │
       └─────────→ Forecast future movement
                         ↓
                  Historic AIS traffic
                         ↓
                 Filter relevant vessels
                         ↓
              Spatio-temporal correlation
                         ↓
              Candidate vessel scoring
                         ↓
              Environmental impact view


What is currently in the application
The main interface is centred around an interactive map and simulation workspace. A user can provide a spill location, oil quantity, oil type, start time, and vessel details, then run the simulation and inspect the result over time.
The map can show the spill source, affected area, plume contours, trajectory, vessel information, and environmental overlays.
The analysis also includes spill statistics, weathering estimates, ecological risk, and estimated shoreline impact.
There is a demo/fallback mode as well. If live external data is unavailable, the application can use calibrated mathematical models so the simulation can still be demonstrated. Results based on estimated or fallback data are intended to remain distinguishable from externally sourced data.
Data
The project is designed around a few different data types rather than one single source.
Satellite
- Sentinel-1 SAR and other EO imagery for oil-spill observation
AIS
- Historic vessel tracks for traffic reconstruction and attribution
- Real AIS can be used where available
- Synthetic AIS can also be used for demonstrations
Environment
- Ocean currents
- Wind and weather
- Sea-state / marine conditions
Impact data
- Coastal locations
- Marine habitats and ecological resources
The SIH problem statement specifically points to AIS sample data from MarineCadastre and the Sentinel-1 SAR Oil Spill Dataset on Zenodo as possible sources for demonstration.
A note on the simulation
The current model combines environmental drift with oil-spreading and weathering calculations. It is useful for demonstrating the workflow and for producing a time-based estimate of spill movement.
For a production-grade operational system, the model can be connected to more detailed sources such as OpenDrift/OpenOil, Copernicus Marine, NOAA data, live AIS feeds, and satellite-processing pipelines.
That distinction matters: a simulated trajectory should not be presented as an observed trajectory.
Running it
You need:
- Node.js 18+
- npm 9+
- A modern browser with WebGL support
Install the dependencies:
npm install

Create .env from .env.example and add the services you intend to use.
Then run:
npm run dev

Open the local address printed by the development server.
That's enough to get the application running. The external data services are optional for the demo/fallback workflow.
A couple of things to know
- Map not loading: This can happen when a tile provider is unreachable. The application has alternative map layers that can be selected from the map controls.
- Port 3000 already in use: Stop the other development server or free the port before starting OORCA.
- Missing dependencies: If the install is in a broken state, removing node_modules and running npm install again usually gives you a clean start.
- Live data is not the same as simulated data: Check the data status before treating a result as an observation.
These are small things, but they tend to be more useful than a long generic troubleshooting section.
Where this fits in SIH PS 26143
The problem statement asks for an automated pipeline that can:
1. Detect and characterise an oil spill from satellite imagery.
2. Estimate its origin by using oceanographic and meteorological data.
3. Predict its future drift.
4. Reconstruct historic AIS traffic around the origin window.
5. Remove irrelevant traffic.
6. Score potential vessels using proximity, trajectory, and behavioural indicators.
7. Present the result through a suitable visual interface.
OORCA is structured around that same flow:
SAR / EO → Spill characterisation → Hindcasting → Forecasting → AIS reconstruction → Traffic filtering → Spatio-temporal correlation → Vessel attribution → Impact assessment
That is the core of the project. The rest of the application exists to make those steps usable together.
Project name
OORCA — Oceanic Oil Reconnaissance, Correlation & Attribution
The name reflects the three main parts of the system:
- Reconnaissance — Finding and characterising the spill
- Correlation — Connecting the spill with environmental and AIS data
- Attribution — Narrowing the traffic down to potential responsible vessels
License
Apache License 2.0. See LICENSE.
```
