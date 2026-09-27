# OORCA

### Oceanic Oil Reconnaissance, Correlation & Attribution

> A marine intelligence platform for oil-spill detection, drift
> reconstruction, AIS correlation, vessel attribution, and environmental
> impact analysis.

[![SIH PS
26143](https://img.shields.io/badge/Smart%20India%20Hackathon-PS%2026143-0B7285?style=for-the-badge)](#-smart-india-hackathon)
[![Apache
2.0](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=111)](https://react.dev/)

OORCA brings satellite observations, oceanographic conditions, vessel
movement, and environmental data into one investigation workflow.

The basic question is simple:

> An oil slick was observed. Where did it come from, how could it have
> moved, and which vessels were relevant during that window?

OORCA is designed around Smart India Hackathon Problem Statement 26143,
associated with the National Technical Research Organisation (NTRO).

------------------------------------------------------------------------

# LIVE DEMO

## OORCA is live on the web

Explore the OORCA investigation workspace:

**[Launch OORCA Live
Demo](https://oorca-v1-foemtitw9-yamiyprivate-6825.vercel.app/)**

The live deployment is provided as an interactive feature demonstration
of OORCA's investigation workflow and interface. It showcases selected
capabilities including spill visualisation, drift simulation, AIS
correlation, trajectory analysis and environmental layers.

**Important:** The public demo is a limited deployment intended for
feature exploration and demonstration. It does not represent the
complete operational OORCA system and does not contain the full
real-time data pipeline, continuous data ingestion or complete AI/ML
capabilities.

The full OORCA architecture is designed to work with live satellite
observations, AIS feeds, environmental data and production-grade
processing services. Availability of these capabilities depends on the
deployment environment, external data providers and required API
services.

The live demo lets you explore what OORCA looks and feels like, while
the full system represents the complete investigation platform.

**Public Demo:** Available\
**Full Real-Time Data Pipeline:** Deployment dependent\
**Complete AI/ML Pipeline:** Development / production integration\
**Purpose:** Feature demonstration and investigation workflow

------------------------------------------------------------------------

# What OORCA does

  -----------------------------------------------------------------------
  Capability                          Purpose
  ----------------------------------- -----------------------------------
  Oil-Spill Detection                 Identify and characterise potential
                                      oil slicks from SAR / EO imagery

  Drift Simulation                    Model spill movement using wind,
                                      currents and marine conditions

  Hindcasting                         Estimate a possible spill origin
                                      and time window

  Forecasting                         Project possible future movement of
                                      the spill

  AIS Correlation                     Reconstruct vessel traffic around
                                      the estimated source window

  Vessel Attribution                  Filter and score relevant candidate
                                      vessels

  Impact Analysis                     Examine potential exposure of
                                      marine and coastal resources

  Geospatial Workspace                Explore the investigation through
                                      an interactive map
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Investigation Workflow

``` mermaid
flowchart LR
    A["Satellite Imagery"] --> B["Oil Spill Detection"]
    B --> C["Slick Characterisation"]

    C --> D["Wind + Ocean Currents"]
    D --> E["Hindcast"]

    E --> F["Estimated Origin + Time Window"]
    E --> G["Forecast"]

    F --> H["Historical AIS"]
    H --> I["Traffic Filtering"]

    I --> J["Spatio-Temporal Correlation"]
    J --> K["Candidate Vessel Scoring"]

    G --> L["Environmental Impact"]
    K --> L

    L --> M["Investigation Workspace"]
```

### The short version

``` text
Satellite
   ↓
Spill Detection
   ↓
Spill Characterisation
   ↓
Hindcasting
   ↓
Origin + Time Window
   ├──→ Forecast
   │
   └──→ Historical AIS
             ↓
        Traffic Filtering
             ↓
    Spatio-Temporal Correlation
             ↓
       Candidate Vessels
             ↓
       Impact Assessment
```

------------------------------------------------------------------------

# 01 --- Oil-Spill Detection

OORCA is designed around Synthetic Aperture Radar (SAR) and other Earth
Observation imagery.

A detected slick can be represented using:

-   Geographic location
-   Estimated extent
-   Geometry
-   Concentration zones
-   Estimated spill age where the available data supports it

## Key data source

Sentinel-1 SAR is a central part of the project's satellite-data
workflow.

The project can also work with demonstration datasets such as the
Sentinel-1 SAR Oil Spill Dataset.

------------------------------------------------------------------------

# 02 --- Drift Reconstruction

A satellite image gives you a snapshot.

It doesn't tell you where the oil came from.

OORCA uses environmental conditions to model possible spill movement.

## Hindcasting

The simulation runs backwards from the observed spill to estimate:

-   Possible source region
-   Relevant time window
-   Potential movement path

## Forecasting

The simulation can also run forward to estimate:

-   Future plume movement
-   Potential affected areas
-   Possible shoreline arrival windows

The current interface supports a 72-hour simulation timeline.

> Modelled movement is not the same thing as observed movement.

That distinction is intentionally preserved in the application.

------------------------------------------------------------------------

# 03 --- AIS Correlation

Once a possible origin and time window are available, OORCA can examine
vessel traffic around that region.

The system can consider:

-   Distance from the estimated source
-   Vessel position
-   Time overlap
-   Trajectory overlap
-   Spatial proximity
-   Movement patterns
-   Behavioural indicators

The objective is to reduce a large amount of vessel traffic into a
smaller set of investigation candidates.

It does not automatically establish legal responsibility.

------------------------------------------------------------------------

# 04 --- Environmental Impact

The spill trajectory can be compared with environmental and coastal
information to understand what could potentially be exposed.

Possible analysis includes:

-   Marine habitats
-   Ecological resources
-   Coastal areas
-   Shoreline exposure
-   Estimated coastal arrival
-   Environmental risk
-   Human-health risk

This adds another question to the investigation:

> If the spill continues along this path, what could it reach?

------------------------------------------------------------------------

# Interactive Investigation Workspace

OORCA is built around an interactive map and simulation workspace.

Depending on the available data, the interface can display:

-   Spill source
-   Spill extent
-   Plume contours
-   Simulated trajectory
-   Vessel positions
-   Vessel tracks
-   Environmental overlays
-   Ecological resources
-   Simulation timeline

The application also provides analytical information such as:

-   Spill statistics
-   Weathering estimates
-   Ecological risk
-   Estimated shoreline impact

The map is the workspace. The analysis sits around it.

------------------------------------------------------------------------

# Data Architecture

OORCA combines several data categories rather than relying on one
dataset.

## Satellite

-   Sentinel-1 SAR
-   Earth Observation imagery
-   Sentinel-1 SAR Oil Spill Dataset

## AIS

-   Historical vessel tracks
-   MarineCadastre AIS sample data
-   Real AIS feeds where available
-   Synthetic AIS for demonstrations

## Environmental

-   Ocean currents
-   Wind
-   Weather
-   Sea-state / marine conditions

## Impact

-   Coastal locations
-   Marine habitats
-   Ecological resources
-   Shoreline information

------------------------------------------------------------------------

# Simulation & Production Path

The current simulation combines environmental drift with oil-spreading
and weathering calculations.

For a production-oriented implementation, the modelling layer can be
extended with specialised systems such as:

-   OpenDrift
-   OpenOil
-   Copernicus Marine
-   NOAA environmental datasets
-   Live AIS providers
-   Automated Sentinel-1 processing pipelines

The important distinction:

``` text
Observed Data
     ≠
Modelled Data
     ≠
Synthetic / Demo Data
```

OORCA's fallback workflow is intended to keep the application
demonstrable when external services or live datasets are unavailable,
while keeping estimated results distinguishable from real observations.

------------------------------------------------------------------------

# Smart India Hackathon

## Problem Statement 26143

OORCA is structured around SIH Problem Statement 26143 from the National
Technical Research Organisation (NTRO).

The problem requires a pipeline that can:

  -----------------------------------------------------------------------
  Requirement                         OORCA
  ----------------------------------- -----------------------------------
  Detect oil spills from satellite    SAR / EO workflow
  imagery                             

  Characterise the spill              Slick characterisation

  Estimate the origin                 Hindcasting

  Use oceanographic and               Environmental drift model
  meteorological data                 

  Predict future movement             Forecasting

  Reconstruct historic AIS traffic    AIS correlation

  Remove irrelevant traffic           Traffic filtering

  Analyse vessel proximity and        Spatio-temporal analysis
  trajectories                        

  Score potential vessels             Candidate scoring

  Present results visually            Interactive investigation workspace
  -----------------------------------------------------------------------

## SIH-aligned pipeline

``` text
SAR / EO
   ↓
Spill Detection
   ↓
Spill Characterisation
   ↓
Hindcasting
   ↓
Origin + Time Estimation
   ↓
Forecasting
   ↓
AIS Reconstruction
   ↓
Traffic Filtering
   ↓
Spatio-Temporal Correlation
   ↓
Vessel Attribution
   ↓
Environmental Impact
```

------------------------------------------------------------------------

# Technology

OORCA uses a web-based geospatial architecture with scientific and
data-processing components.

## Frontend

-   React
-   TypeScript
-   Vite
-   Interactive mapping
-   WebGL

## Data & Backend

-   Python-based processing
-   Geospatial analysis
-   PostgreSQL / PostGIS
-   REST APIs
-   Environment-based configuration

## Scientific / Geospatial

-   Sentinel-1 SAR
-   AIS trajectory data
-   Oceanographic datasets
-   Wind and weather data
-   OpenDrift / OpenOil integration path
-   Spatial and temporal correlation

> The exact services enabled depend on the deployment and available API
> credentials.

## Deployment note

The public demo is intentionally lightweight and focuses on
demonstrating the OORCA investigation experience. Production deployments
can connect additional live data sources, processing services and AI/ML
pipelines depending on available infrastructure and API access.

------------------------------------------------------------------------

# Getting Started

## Requirements

-   Node.js 18+
-   npm 9+
-   Modern browser with WebGL support

## Installation

``` bash
git clone https://github.com/yamiy-D/OORCA-V.1.git
cd OORCA-V.1
npm install
```

Create your environment file:

``` bash
cp .env.example .env
```

On Windows, create `.env` from `.env.example` manually if needed.

Add the API credentials required by the services enabled in your local
build.

Start the development server:

``` bash
npm run dev
```

Open the local address printed by Vite.

------------------------------------------------------------------------

# Environment Configuration

Keep secrets inside `.env`.

Never commit API keys, tokens, or private credentials.

The repository's `.env.example` should be treated as the source of truth
for the variables required by the current build.

Example structure:

``` env
VITE_MAP_API_KEY=
VITE_WEATHER_API_KEY=
VITE_AIS_API_KEY=
```

Do not copy these names blindly if your current `.env.example` uses
different variables.

------------------------------------------------------------------------

# Demo / Fallback Mode

OORCA is designed to remain demonstrable even when live external
services aren't available.

Fallback operation can use:

-   Calibrated mathematical models
-   Synthetic AIS
-   Local datasets
-   Estimated environmental conditions

The application should make the data state clear:

``` text
LIVE
SIMULATED
FALLBACK
MODELLED
```

A realistic-looking map is not evidence by itself.

------------------------------------------------------------------------

# Limitations

OORCA is an investigation and decision-support platform.

It is not a legal attribution engine.

Results can be affected by:

-   SAR image quality
-   Satellite acquisition timing
-   Weather uncertainty
-   Ocean-current uncertainty
-   AIS coverage
-   AIS reporting gaps
-   Incomplete vessel histories
-   Simplified oil-spreading assumptions
-   External API availability
-   Ecological dataset coverage

A candidate vessel should therefore be treated as a lead for
investigation, not automatic proof of responsibility.

------------------------------------------------------------------------

# Roadmap

## Current direction

-   [x] Interactive spill simulation
-   [x] 72-hour simulation timeline
-   [x] Spill characterisation workflow
-   [x] Hindcast / forecast workflow
-   [x] AIS correlation workflow
-   [x] Environmental impact layer
-   [x] Demo / fallback mode

## Planned

-   [ ] Automated Sentinel-1 ingestion
-   [ ] ML-based slick segmentation
-   [ ] OpenDrift / OpenOil production integration
-   [ ] Live AIS ingestion
-   [ ] Advanced vessel behaviour analysis
-   [ ] PostGIS trajectory analytics
-   [ ] Automated investigation reports
-   [ ] Large-scale historical AIS processing
-   [ ] Operational alerting

------------------------------------------------------------------------

# Contributing

Contributions are welcome.

Useful areas include:

-   SAR image processing
-   Oil-spill segmentation
-   Computer vision / ML
-   Ocean drift modelling
-   AIS processing
-   Vessel trajectory analysis
-   PostGIS
-   Remote sensing
-   Environmental datasets
-   Geospatial visualisation
-   Frontend engineering

For major changes, open an issue first so the approach can be discussed
before implementation.

------------------------------------------------------------------------

# License

OORCA is released under the Apache License 2.0.

See [`LICENSE`](LICENSE) for the full license text.

------------------------------------------------------------------------

# SEO / Project Topics

Oil Spill Detection · Oil Spill Monitoring · Oil Spill Tracking ·
Sentinel-1 SAR · SAR Imagery · Satellite Oil Spill Detection · Marine
Environmental Intelligence · AIS Vessel Tracking · Vessel Attribution ·
Vessel Trajectory Analysis · Oil Spill Drift Simulation · Oil Spill
Hindcasting · Oil Spill Forecasting · OpenDrift · OpenOil · Marine
Pollution Monitoring · Remote Sensing · GIS · Geospatial Intelligence ·
PostGIS · Oceanographic Modelling · Smart India Hackathon · SIH 26143 ·
NTRO

------------------------------------------------------------------------

::: {align="center"}
### OORCA

Observe · Reconstruct · Correlate · Investigate

Built around Smart India Hackathon Problem Statement 26143
:::
