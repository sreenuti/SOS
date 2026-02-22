/**
 * NOAA CO-OPS API configuration from environment variables.
 * Safe getters prevent crashes when env vars are missing (e.g. local dev without .env).
 */

const DEFAULT_STATION_ID = "8771450";
const DEFAULT_NOAA_API_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

/**
 * NOAA station ID (e.g. 8771450 Galveston). Uses NEXT_PUBLIC_NOAA_STATION_ID when set.
 */
export function getNoaaStationId(): string {
  const id = process.env.NEXT_PUBLIC_NOAA_STATION_ID;
  if (id == null || String(id).trim() === "") {
    return DEFAULT_STATION_ID;
  }
  return String(id).trim();
}

/**
 * Base URL for NOAA CO-OPS datagetter API. Uses NEXT_PUBLIC_NOAA_API_URL when set.
 */
export function getNoaaApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_NOAA_API_URL;
  if (url == null || String(url).trim() === "") {
    return DEFAULT_NOAA_API_URL;
  }
  return String(url).trim().replace(/\?.*$/, ""); // strip query if present
}

/**
 * True if NOAA is configured via env (station and URL both non-default or explicitly set).
 * Use to show "Live NOAA" vs "Default station" in UI if desired.
 */
export function isNoaaConfigured(): boolean {
  const hasStation = process.env.NEXT_PUBLIC_NOAA_STATION_ID != null && String(process.env.NEXT_PUBLIC_NOAA_STATION_ID).trim() !== "";
  const hasUrl = process.env.NEXT_PUBLIC_NOAA_API_URL != null && String(process.env.NEXT_PUBLIC_NOAA_API_URL).trim() !== "";
  return hasStation || hasUrl;
}
