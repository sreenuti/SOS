/**
 * National SOS Marine Network — NOAA CO-OPS stations (U.S. coasts).
 * Used for station selector map and region-specific Health Tax baselines.
 * Gulf/Florida: 85.2°F; Southeast: 84°F; Northeast & West Coast: 68°F.
 */

export interface NoaaStation {
  id: string;
  name: string;
  /** Latitude for map pin */
  lat: number;
  /** Longitude for map pin */
  lon: number;
  /** Zone label for Scientific Summary */
  zone: string;
  /** Historical baseline °F for Health Tax in this region (Gulf/Florida warm, Northeast/West cooler). */
  baselineTempF: number;
}

export const NOAA_STATIONS: NoaaStation[] = [
  {
    id: "9410840",
    name: "Santa Monica",
    lat: 34.0083,
    lon: -118.4917,
    zone: "West Coast",
    baselineTempF: 68,
  },
  {
    id: "8771450",
    name: "Galveston",
    lat: 29.2867,
    lon: -94.7933,
    zone: "Gulf Coast",
    baselineTempF: 85.2,
  },
  {
    id: "8724580",
    name: "Key West",
    lat: 24.5508,
    lon: -81.8081,
    zone: "Florida",
    baselineTempF: 85.2,
  },
  {
    id: "8665530",
    name: "Charleston",
    lat: 32.7817,
    lon: -79.925,
    zone: "Southeast",
    baselineTempF: 84,
  },
  {
    id: "8447930",
    name: "Woods Hole",
    lat: 41.5233,
    lon: -70.6717,
    zone: "Northeast",
    baselineTempF: 68,
  },
];

export function getStationById(id: string): NoaaStation | undefined {
  return NOAA_STATIONS.find((s) => s.id === id);
}

/** Default station (e.g. from env or first in list). */
export function getDefaultStationId(envDefault?: string): string {
  const id = envDefault != null && String(envDefault).trim() !== "" ? String(envDefault).trim() : "";
  if (id && getStationById(id)) return id;
  return NOAA_STATIONS[0].id;
}
