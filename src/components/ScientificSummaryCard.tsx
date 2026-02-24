"use client";

import { getNoaaApiUrl, isNoaaConfigured } from "@/lib/noaaService";
import { getHistoricalBaselineTempF } from "@/lib/survivalScore";
import { useStation } from "@/context/StationContext";
import InfoIcon from "./InfoIcon";

/**
 * Summary card that displays NOAA config, current zone, and Health Tax baseline.
 * Zone and baseline update when user selects a station on the coast map.
 */
export default function ScientificSummaryCard() {
  const { selectedStationId, selectedStation } = useStation();
  const apiUrl = getNoaaApiUrl();
  const baselineTempF = getHistoricalBaselineTempF(selectedStationId);
  const configured = isNoaaConfigured();

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-ocean-cyan text-sm font-semibold uppercase tracking-wider">
          Scientific summary
        </h3>
        <InfoIcon
          ariaLabel="About scientific summary"
          content="Current zone and NOAA station for the selected map pin. Health Tax baseline is the regional historical temperature used in the survival formula (currentTemp − baseline) × 2. The NOAA API URL is where live water and tide data are fetched."
        />
      </div>
      <dl className="space-y-2 text-sm">
        {selectedStation && (
          <div>
            <dt className="text-ocean-muted font-medium">Current zone</dt>
            <dd className="text-ocean-text mt-0.5 font-medium">
              {selectedStation.zone}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-ocean-muted font-medium">NOAA station</dt>
          <dd className="text-ocean-text mt-0.5 font-mono">
            {selectedStation ? `${selectedStation.name} (${selectedStationId})` : selectedStationId || "—"}
            {!configured && !selectedStation && (
              <span className="text-ocean-muted font-normal ml-1">(default)</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ocean-muted font-medium">NOAA API</dt>
          <dd className="text-ocean-text mt-0.5 font-mono truncate" title={apiUrl || undefined}>
            {apiUrl ? (() => {
              try {
                return `${new URL(apiUrl).origin}…`;
              } catch {
                return apiUrl.slice(0, 40) + (apiUrl.length > 40 ? "…" : "");
              }
            })() : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ocean-muted font-medium">Health Tax baseline (regional)</dt>
          <dd className="text-ocean-text mt-0.5">
            {baselineTempF}°F <span className="text-ocean-muted">(currentTemp − baseline) × 2</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
