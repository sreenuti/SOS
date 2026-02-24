/**
 * Server-side only: fetches vessel count from AIS API (MyShipTracking or generic).
 * Used by the /api/boat-traffic route to avoid CORS when the client requests data.
 */

const RADIUS_KM = 0.5;

function latLonDeltaFromRadiusKm(radiusKm: number, lat: number) {
  const degLat = radiusKm / 111;
  const degLon = radiusKm / (111 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
  return { degLat, degLon };
}

function getAisConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_AIS_API_URL;
  const key = process.env.NEXT_PUBLIC_AIS_API_KEY;
  if (!url || !key || String(url).trim() === "" || String(key).trim() === "") return null;
  return { url: String(url).trim(), key: String(key).trim() };
}

async function fetchMyShipTrackingZone(
  lat: number,
  lon: number,
  radiusKm: number,
  config: { url: string; key: string }
): Promise<number | null> {
  const base = config.url.replace(/\?.*$/, "").replace(/\/+$/, "");
  const zoneUrl = base.includes("/vessel/zone") ? base : `${base.replace(/\/vessel\/?$/, "")}/vessel/zone`;
  const { degLat, degLon } = latLonDeltaFromRadiusKm(radiusKm, lat);
  const params = new URLSearchParams({
    minlat: String(Math.max(-90, lat - degLat)),
    maxlat: String(Math.min(90, lat + degLat)),
    minlon: String(lon - degLon),
    maxlon: String(lon + degLon),
  });
  const res = await fetch(`${zoneUrl}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${config.key}`,
      "X-API-Key": config.key,
    },
  });
  if (!res.ok) return null;
  const envelope = (await res.json()) as { status?: string; data?: unknown[] };
  if (envelope?.status !== "success" || !Array.isArray(envelope.data)) return null;
  return Math.max(0, envelope.data.length);
}

/** Server-only: fetches vessel count from external AIS API. */
export async function fetchLiveBoatTrafficServer(lat: number, lon: number): Promise<number | null> {
  const config = getAisConfig();
  if (!config) return null;

  try {
    if (/myshiptracking\.com/i.test(config.url)) {
      return fetchMyShipTrackingZone(lat, lon, RADIUS_KM, config);
    }
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: String(RADIUS_KM),
    });
    const res = await fetch(`${config.url.replace(/\?.*$/, "")}?${params.toString()}`, {
      headers: { "X-API-Key": config.key },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: number; vessels?: unknown[]; total?: number };
    if (typeof data?.count === "number" && Number.isFinite(data.count)) return Math.max(0, Math.round(data.count));
    if (Array.isArray(data?.vessels)) return Math.max(0, data.vessels.length);
    if (typeof data?.total === "number" && Number.isFinite(data.total)) return Math.max(0, Math.round(data.total));
    return null;
  } catch {
    return null;
  }
}
