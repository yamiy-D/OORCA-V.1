# 🐋 OORCA

### Oceanic Oil Reconnaissance, Correlation & Attribution

> A marine intelligence platform for oil-spill detection, drift reconstruction, AIS correlation, vessel attribution, and environmental impact analysis.

[![SIH PS 26143](https://img.shields.io/badge/Smart%20India%20Hackathon-PS%2026143-0B7285?style=for-the-badge)](#-smart-india-hackathon)
[![Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=111)](https://react.dev/)

OORCA brings satellite observations, oceanographic conditions, vessel movement, and environmental data into one investigation workflow.

The basic question is simple:

> **An oil slick was observed. Where did it come from, how could it have moved, and which vessels were relevant during that window?**

OORCA is designed around **Smart India Hackathon Problem Statement 26143**, associated with the **National Technical Research Organisation (NTRO)**.

---

# 🚀 LIVE DEMO

> ## 🌊 OORCA is live on the web
>
> **Explore the OORCA investigation workspace:**
>
> 👉 **[Launch OORCA Live Demo](https://oorca-v1-foemtitw9-yamiyprivate-6825.vercel.app/)**
>
> The live deployment is provided as an **interactive feature demonstration** of OORCA's investigation workflow and interface. It showcases selected capabilities including spill visualisation, drift simulation, AIS correlation, trajectory analysis and environmental layers.
>
> **Important:** The public demo is a limited deployment intended for feature exploration and demonstration. It does **not** represent the complete operational OORCA system and does not contain the full real-time data pipeline, continuous data ingestion or complete AI/ML capabilities.
>
> The full OORCA architecture is designed to work with live satellite observations, AIS feeds, environmental data and production-grade processing services. Availability of these capabilities depends on the deployment environment, external data providers and required API services.
>
> **The live demo lets you explore what OORCA looks and feels like, while the full system represents the complete investigation platform.**
>
> 🟢 **Public Demo:** Available  
> 🛰️ **Full Real-Time Data Pipeline:** Deployment dependent  
> 🧠 **Complete AI/ML Pipeline:** Development / production integration  
> 🌐 **Purpose:** Feature demonstration & investigation workflow

---

# ✦ What OORCA does

| Capability | Purpose |
|---|---|
| 🛰️ **Oil-Spill Detection** | Work with SAR / EO imagery to identify and characterise potential slicks |
| 🌊 **Drift Simulation** | Model spill movement using wind, currents, and marine conditions |
| ⏪ **Hindcasting** | Work backwards from an observed slick to estimate a possible origin and time window |
| ⏩ **Forecasting** | Project possible future spill movement |
| 🚢 **AIS Correlation** | Reconstruct vessel traffic around the estimated source window |
| 🎯 **Vessel Attribution** | Filter and score relevant candidate vessels |
| 🌱 **Impact Analysis** | Examine potential exposure of marine and coastal resources |
| 🗺️ **Geospatial Workspace** | Explore the complete investigation on an interactive map |

---

# 🔬 Investigation Workflow

```mermaid
flowchart LR
    A["🛰️ Satellite Imagery"] --> B["Oil Spill Detection"]
    B --> C["Slick Characterisation"]

    C --> D["🌬️ Wind + 🌊 Ocean Currents"]
    D --> E["Hindcast"]

    E --> F["Estimated Origin<br/>+ Time Window"]
    E --> G["Forecast"]

    F --> H["🚢 Historical AIS"]
    H --> I["Traffic Filtering"]

    I --> J["Spatio-Temporal Correlation"]
    J --> K["Candidate Vessel Scoring"]

    G --> L["🌱 Environmental Impact"]
    K --> L

    L --> M["Investigation Workspace"]
