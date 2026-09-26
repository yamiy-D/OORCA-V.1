/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SATELLITE_API_KEY?: string;
  readonly VITE_AIS_API_KEY?: string;
  readonly VITE_OCEAN_DATA_API_KEY?: string;
  readonly VITE_WEATHER_API_KEY?: string;
  readonly VITE_CARTO_API_KEY?: string;
  readonly VITE_MAP_API_KEY?: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
