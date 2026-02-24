/**
 * Live turbidity from USGS NWIS Instantaneous Values (parameter 63680).
 * Uses optional station -> USGS site mapping; falls back to mock when no mapping or API failure.
 */

const USGS_IV_BASE = "https://waterservices.usgs.gov/nwis/iv";
const TURBIDITY_PARAM = "63680"; // Turbidity, FNU
const BASELINE_NTU = 5; // fallback when no data
/** Match window: use live turbidity if within this many ms of a series point (same as temp). */
export const LIVE_TURBIDITY_MATCH_MS = 15 * 60 * 1000;

/** NOAA station ID -> USGS monitoring site ID (sites with turbidity). No entry = use mock. */
export const STATION_TO_USGS_TURBIDITY_SITE: Record<string, string> = {
  "8771450": "08067710", // Galveston area – Buffalo Bayou
  "8665530": "02172000", // Charleston area – Cooper River
  "8447930": "01105865", // Woods Hole area – MA
  "9410840": "11087050", // Santa Monica area – CA
  "8724580": "02290827", // Key West area – FL
};

export interface TurbidityPoint {
  timestamp: string;
  turbidity: number;
}

interface UsgsValuePoint {
  dateTime: string;
  value: string;
}

interface UsgsTimeSeries {
  values?: Array<{ value?: UsgsValuePoint[] }>;
}

/** Legacy USGS IV JSON: root may be { value: { timeSeries } } or direct { timeSeries }. */
interface UsgsResponse {
  value?: { timeSeries?: UsgsTimeSeries[] };
  timeSeries?: UsgsTimeSeries[];
}

/**
 * Fetches recent turbidity from USGS IV for the given NOAA station.
 * Returns empty array if station has no mapping or request fails (caller uses mock).
 */
export async function fetchLiveTurbidity(
  stationId: string,
  lastKnown?: TurbidityPoint[]
): Promise<TurbidityPoint[]> {
  const siteId = STATION_TO_USGS_TURBIDITY_SITE[stationId];
  if (!siteId) return lastKnown ?? [];

  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    sites: siteId,
    parameterCd: TURBIDITY_PARAM,
    format: "json",
    startDT: start.toISOString().slice(0, 19),
    endDT: end.toISOString().slice(0, 19),
  });

  try {
    const res = await fetch(`${USGS_IV_BASE}/?${params.toString()}`);
    const json = (await res.json()) as UsgsResponse;

    const timeSeries = json?.value?.timeSeries ?? json?.timeSeries;
    const series = Array.isArray(timeSeries) ? timeSeries[0] : undefined;
    const valuesBag = series?.values?.find((v) => Array.isArray(v.value) && v.value.length > 0);
    const values = valuesBag?.value ?? [];
    if (values.length === 0) return lastKnown ?? [];

    const mapped: TurbidityPoint[] = values.map((v) => {
      const n = parseFloat(v.value);
      return {
        timestamp: v.dateTime,
        turbidity: Number.isFinite(n) ? Math.round(n * 10) / 10 : BASELINE_NTU,
      };
    });

    return mapped;
  } catch {
    return lastKnown ?? [];
  }
}

export function turbidityTimeMs(p: TurbidityPoint): number {
  const parsed = Date.parse(p.timestamp.replace(" ", "T"));
  return Number.isFinite(parsed) ? parsed : 0;
}
