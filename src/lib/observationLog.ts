import type { MetricsAtTime } from "./mockData";
import { getDebrisHealthStatus } from "./debrisHealth";
import { HIGH_TRAFFIC_THRESHOLD } from "./vesselDensity";

import { getNoaaStationId } from "./noaaService";

/** Alert severity for styling (Red / Yellow) */
export type AlertSeverity = "red" | "yellow";

export interface ObservationLogEntry {
  id: string;
  time: Date;
  severity: AlertSeverity;
  message: string;
}

/** Vessel density: Yellow >= 10, Red >= 13 (within 2–15 range) */
const VESSEL_CAUTION = 10;
const VESSEL_CRITICAL = 13;

/** Turbidity (NTU): Yellow > 30, Red > 100 */
const TURBIDITY_CAUTION = 30;
const TURBIDITY_CRITICAL = 100;

/** Temperature (°F): Yellow >= 84, Red >= 86 */
const TEMP_CAUTION = 84;
const TEMP_CRITICAL = 86;

function getVesselLevel(boatTraffic: number): "green" | "yellow" | "red" {
  if (boatTraffic >= VESSEL_CRITICAL) return "red";
  if (boatTraffic >= VESSEL_CAUTION) return "yellow";
  return "green";
}

function getTurbidityLevel(turbidity: number): "green" | "yellow" | "red" {
  if (turbidity > TURBIDITY_CRITICAL) return "red";
  if (turbidity > TURBIDITY_CAUTION) return "yellow";
  return "green";
}

function getTempLevel(waterTemp: number): "green" | "yellow" | "red" {
  if (waterTemp >= TEMP_CRITICAL) return "red";
  if (waterTemp >= TEMP_CAUTION) return "yellow";
  return "green";
}

/** Format time as [HH:mm] for log display */
export function formatLogTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `[${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}]`;
}

/**
 * Compare current metrics to previous; return new log entries when a metric
 * transitions into Yellow or Red. One entry per metric that newly crossed threshold.
 * When isLive and vessel count exceeds HIGH_TRAFFIC_THRESHOLD (15), adds a High Traffic alert (2026 projection trends).
 */
export function getNewObservationEntries(
  current: MetricsAtTime,
  viewDate: Date,
  previous: MetricsAtTime | null,
  isLive?: boolean,
  stationId?: string
): ObservationLogEntry[] {
  const entries: ObservationLogEntry[] = [];
  const idBase = viewDate.getTime().toString(36);
  const station = stationId != null && String(stationId).trim() !== "" ? String(stationId).trim() : getNoaaStationId();

  const vesselNow = getVesselLevel(current.boatTraffic);
  const vesselPrev = previous ? getVesselLevel(previous.boatTraffic) : "green";
  if ((vesselNow === "red" || vesselNow === "yellow") && vesselPrev === "green") {
    entries.push({
      id: `${idBase}-vessel`,
      time: new Date(viewDate),
      severity: vesselNow === "red" ? "red" : "yellow",
      message: `Vessel Density exceeds safety threshold at Station ${station}.`,
    });
  }

  if (isLive && current.boatTraffic > HIGH_TRAFFIC_THRESHOLD) {
    const prevBelow = previous === null || previous.boatTraffic <= HIGH_TRAFFIC_THRESHOLD;
    if (prevBelow) {
      entries.push({
        id: `${idBase}-high-traffic`,
        time: new Date(viewDate),
        severity: "red",
        message: `High Traffic: ${current.boatTraffic} vessels within 500m exceeds 2026 projection trend threshold (${HIGH_TRAFFIC_THRESHOLD}) at Station ${station}.`,
      });
    }
  }

  const turbNow = getTurbidityLevel(current.turbidity);
  const turbPrev = previous ? getTurbidityLevel(previous.turbidity) : "green";
  if ((turbNow === "red" || turbNow === "yellow") && turbPrev === "green") {
    entries.push({
      id: `${idBase}-turbidity`,
      time: new Date(viewDate),
      severity: turbNow === "red" ? "red" : "yellow",
      message: `Turbidity ${turbNow === "red" ? "exceeds safe level" : "above environmental standard"} at Station ${station}.`,
    });
  }

  const debrisStatusNow = getDebrisHealthStatus(current.marineDebris);
  const debrisPrev = previous ? getDebrisHealthStatus(previous.marineDebris) : "healthy";
  const debrisAlertNow = debrisStatusNow === "caution" || debrisStatusNow === "critical";
  const debrisAlertPrev = debrisPrev === "caution" || debrisPrev === "critical";
  if (debrisAlertNow && !debrisAlertPrev) {
    entries.push({
      id: `${idBase}-debris`,
      time: new Date(viewDate),
      severity: debrisStatusNow === "critical" ? "red" : "yellow",
      message: `Marine debris density ${debrisStatusNow === "critical" ? "critical" : "in caution range"} at Station ${station}.`,
    });
  }

  const tempNow = getTempLevel(current.waterTemp);
  const tempPrev = previous ? getTempLevel(previous.waterTemp) : "green";
  if ((tempNow === "red" || tempNow === "yellow") && tempPrev === "green") {
    entries.push({
      id: `${idBase}-temp`,
      time: new Date(viewDate),
      severity: tempNow === "red" ? "red" : "yellow",
      message: `Water temperature ${tempNow === "red" ? "critical" : "elevated"} at Station ${station}.`,
    });
  }

  return entries;
}
