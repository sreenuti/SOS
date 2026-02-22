import { getStationById } from "./noaaStations";

const DEFAULT_BASELINE_F = 85.2;

/** Historical baseline temp °F for Health Tax: (currentTemp - baseline) * 2. Uses station's regional baseline when stationId provided (cooler north); else env or 85.2. */
export function getHistoricalBaselineTempF(stationId?: string): number {
  if (stationId != null && String(stationId).trim() !== "") {
    const station = getStationById(String(stationId).trim());
    if (station?.baselineTempF != null) return station.baselineTempF;
  }
  const v = process.env.NEXT_PUBLIC_HISTORICAL_BASELINE_TEMP;
  if (v == null || String(v).trim() === "") return DEFAULT_BASELINE_F;
  const n = parseFloat(String(v).trim());
  return Number.isFinite(n) ? n : DEFAULT_BASELINE_F;
}

/**
 * Survival Score: 100 - ((CurrentTemp°F - baseline) * 2).
 * Baseline from station (regional) or env (default 85.2).
 */
export function getSurvivalScore(currentTempF: number, stationId?: string): number {
  const baseline = getHistoricalBaselineTempF(stationId);
  const raw = 100 - (currentTempF - baseline) * 2;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export const THERMAL_STRESS_TEMP_THRESHOLD_F = 88;
export const THERMAL_STRESS_SURVIVAL_THRESHOLD = 94;

/** Health Tax: every 1°F above baseline reduces survival strength by 2%. Returns the reduction % for tooltips. */
export function getHealthTaxReductionPct(tempF: number, stationId?: string): number {
  const baseline = getHistoricalBaselineTempF(stationId);
  if (tempF < baseline) return 0;
  return Math.round(2 * (tempF - baseline) * 10) / 10;
}
