import { NextResponse } from "next/server";
import { fetchLiveBoatTrafficServer } from "@/lib/fetchLiveBoatTrafficServer";

export const dynamic = "force-dynamic";

/** Proxies AIS vessel count server-side to avoid CORS. Query: lat, lon (numbers). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ count: null }, { status: 400 });
  }
  const count = await fetchLiveBoatTrafficServer(lat, lon);
  return NextResponse.json({ count });
}
