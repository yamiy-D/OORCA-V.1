-- =============================================================================
-- STEP 1: PostgreSQL / PostGIS Maritime Vessel Database Schema
-- =============================================================================
-- Purpose: Persistent, immutable vessel identity and dynamic AIS position tracking.
-- Rule 1: NEVER use vessel name as a primary key.
-- Rule 2: IMO is the primary hull identifier; MMSI is dynamic AIS radio station.
-- Rule 3: Separate static/registry identity from time-series position telemetry.
-- =============================================================================

-- Enable PostGIS geospatial extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- STEP 2: Vessels Table (Persistent Hulls & Registry Identity)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imo VARCHAR(10) UNIQUE,                          -- 7-digit IMO number (Persistent Hull Key)
    mmsi VARCHAR(9),                                 -- 9-digit MMSI station (Subject to flag transfer)
    call_sign VARCHAR(12),                           -- Radio Call Sign
    name VARCHAR(255) NOT NULL,                      -- Vessel Name (Non-unique identifier)
    flag VARCHAR(3),                                 -- ISO 3166-1 alpha-2 / alpha-3 flag code
    vessel_type VARCHAR(100) NOT NULL,               -- e.g. Crude Oil Tanker, Container Vessel
    length_meters NUMERIC(6, 2),                     -- Overall Length (LOA) in meters
    beam_meters NUMERIC(5, 2),                       -- Breadth/Beam in meters
    draft_meters NUMERIC(4, 2),                      -- Maximum summer draft in meters
    gross_tonnage INTEGER,                           -- Gross Registered Tonnage (GRT)
    owner_operator VARCHAR(255),                     -- Commercial Operator / Registered Owner
    registry_port VARCHAR(100),                      -- Home Port of Registry
    source VARCHAR(50) NOT NULL DEFAULT 'REGISTRY',  -- 'GFW_API' | 'AIS_FEED' | 'REGISTRY' | 'SIMULATED_DEMO'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B-Tree Indexes on Identity Hierarchy Keys
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels (imo);
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON vessels (mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_call_sign ON vessels (call_sign);
CREATE INDEX IF NOT EXISTS idx_vessels_name ON vessels (name);

-- =============================================================================
-- STEP 3: AIS Positions Table (Dynamic Time-Series Telemetry)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ais_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    mmsi VARCHAR(9) NOT NULL,                        -- Transmitter MMSI
    imo VARCHAR(10),                                 -- Associated Hull IMO
    latitude NUMERIC(9, 6) NOT NULL,                 -- WGS-84 Decimal Latitude (-90 to +90)
    longitude NUMERIC(9, 6) NOT NULL,                -- WGS-84 Decimal Longitude (-180 to +180)
    course NUMERIC(5, 1),                            -- Course Over Ground (COG) in degrees (0-360)
    speed NUMERIC(4, 1),                             -- Speed Over Ground (SOG) in knots
    navigation_status VARCHAR(50),                   -- Underway, Moored, At Anchor, Fishing
    destination VARCHAR(100),                        -- Reported AIS destination port
    draught NUMERIC(4, 2),                           -- Current dynamic draught in meters
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,     -- Transmission timestamp (UTC)
    source VARCHAR(50) NOT NULL DEFAULT 'AIS_FEED',  -- Provenance source
    geom GEOMETRY(Point, 4326),                      -- PostGIS Spatial Point (SRID 4326)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geospatial GiST Index for Fast Incident Proximity Lookups
CREATE INDEX IF NOT EXISTS idx_ais_positions_geom ON ais_positions USING GIST (geom);

-- Temporal and Station Indexes for Historical Track Retrieval
CREATE INDEX IF NOT EXISTS idx_ais_positions_timestamp ON ais_positions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ais_positions_mmsi_timestamp ON ais_positions (mmsi, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ais_positions_imo_timestamp ON ais_positions (imo, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ais_positions_vessel_id ON ais_positions (vessel_id);

-- =============================================================================
-- STEP 4: Automatic PostGIS Point Sync Trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION sync_ais_position_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ais_position_geom ON ais_positions;
CREATE TRIGGER trg_ais_position_geom
BEFORE INSERT OR UPDATE ON ais_positions
FOR EACH ROW EXECUTE FUNCTION sync_ais_position_geom();
