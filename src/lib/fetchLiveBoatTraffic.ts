/**
 * Live vessel count near a station (AIS-based). Optional: set env to enable.
 * Client calls our /api/boat-traffic route so the external AIS request runs
 * server-side and avoids CORS. When no API key or request fails, caller uses mock.
 */

function getAisConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_AIS_API_URL;
  const key = process.env.NEXT_PUBLIC_AIS_API_KEY;
  return !!(url && key && String(url).trim() !== "" && String(key).trim() !== "");
}

/**
 * Fetches current vessel count within 500 m of (lat, lon) via the server proxy.
 * Returns null if AIS is not configured or request fails (caller uses mock).
 */
export async function fetchLiveBoatTraffic(lat: number, lon: number): Promise<number | null> {
  if (!getAisConfig()) return null;

  try {
    const res = await fetch(
      `/api/boat-traffic?${new URLSearchParams({ lat: String(lat), lon: String(lon) })}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: number | null };
    if (typeof data?.count === "number" && Number.isFinite(data.count)) return Math.max(0, Math.round(data.count));
    return null;
  } catch {
    return null;
  }
}
