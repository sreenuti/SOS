/**
 * Live ocean water temperature from NOAA CO-OPS API.
 * Uses NEXT_PUBLIC_NOAA_STATION_ID and NEXT_PUBLIC_NOAA_API_URL from env (see noaaService).
 * @see https://api.tidesandcurrents.noaa.gov/api/prod/
 */

import { getNoaaStationId, getNoaaApiUrl } from "./noaaService";

const BASELINE_TEMP_F = 78.5; // 2026 projection baseline when API fails

export interface ChartData {
  timestamp: string;
  temperature: number;
}

interface NoaaDataPoint {
  t: string;
  v: string;
  f?: string;
}

interface NoaaResponse {
  data?: NoaaDataPoint[];
  error?: { message?: string };
}

function formatDateYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Fetches water temperature from NOAA CO-OPS for the last 30 days and maps to ChartData.
 * On failure returns lastKnown or a single baseline point at 78.5°F.
 * @param stationId - NOAA station ID (e.g. 8771450). If omitted, uses env/default.
 */
export async function fetchLiveOceanData(
  lastKnown?: ChartData[],
  stationId?: string
): Promise<ChartData[]> {
  const sid = stationId != null && String(stationId).trim() !== "" ? String(stationId).trim() : getNoaaStationId();
  const apiBase = getNoaaApiUrl();
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    station: sid,
    product: "water_temperature",
    datum: "mllw",
    units: "english",
    time_zone: "lst_ldt",
    begin_date: formatDateYyyyMmDd(start),
    end_date: formatDateYyyyMmDd(end),
    format: "json",
  });

  try {
    const res = await fetch(`${apiBase}?${params.toString()}`);
    const json = (await res.json()) as NoaaResponse;

    if (!res.ok) {
      throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
    }

    if (json.error?.message) {
      throw new Error(json.error.message);
    }

    const data = json.data;
    if (!Array.isArray(data) || data.length === 0) {
      return lastKnown?.length
        ? lastKnown
        : [{ timestamp: new Date().toISOString(), temperature: BASELINE_TEMP_F }];
    }

    const mapped: ChartData[] = data.map((point) => {
      const temp = parseFloat(point.v);
      return {
        timestamp: point.t,
        temperature: Number.isFinite(temp) ? Math.round(temp * 10) / 10 : BASELINE_TEMP_F,
      };
    });

    return mapped;
  } catch (_) {
    if (lastKnown?.length) {
      return lastKnown;
    }
    return [{ timestamp: new Date().toISOString(), temperature: BASELINE_TEMP_F }];
  }
}

/** Parse NOAA time string (e.g. "2024-02-22 14:36" or ISO) to ms. */
export function chartDataTimeMs(c: ChartData): number {
  const parsed = Date.parse(c.timestamp.replace(" ", "T"));
  return Number.isFinite(parsed) ? parsed : 0;
}
