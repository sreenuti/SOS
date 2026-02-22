"use client";

import {
  BASELINE_GROWTH_RATE_YEARLY,
  HIGH_TRAFFIC_THRESHOLD,
} from "@/lib/vesselDensity";
import { BASELINE_VESSELS_ANNUAL_2000_2003 } from "@/lib/baselines";

const BoatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-2m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5M16 9v6M8 9v6M5 9v6" />
  </svg>
);

interface VesselDensityProps {
  count: number;
  isLive: boolean;
}

export default function VesselDensity({ count, isLive }: VesselDensityProps) {
  const showHighTrafficAlert = isLive && count > HIGH_TRAFFIC_THRESHOLD;
  const growthPercent = (BASELINE_GROWTH_RATE_YEARLY * 100).toFixed(1);

  return (
    <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm shadow-xl min-h-[120px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
          Nearby Vessels (within 500m)
        </span>
        <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
          <BoatIcon />
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-semibold text-ocean-text tabular-nums">
          {count}
        </span>
        <span className="text-ocean-muted text-sm font-normal">vessels</span>
        <span
          className="text-ocean-muted/80 hover:text-ocean-cyan/90 cursor-help ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-ocean-border/60 text-[10px] font-medium"
          title={`Baseline 2000–2003: ${(BASELINE_VESSELS_ANNUAL_2000_2003 / 1000).toFixed(0)}k vessels/yr. Growth: ${growthPercent}% per year (Research Mode).`}
          aria-label="More info: baseline and growth"
        >
          i
        </span>
      </div>
      <p className="text-ocean-muted/80 text-xs mt-1">
        Baseline 2000–2003: {(BASELINE_VESSELS_ANNUAL_2000_2003 / 1000).toFixed(0)}k vessels/yr
      </p>
      {showHighTrafficAlert && (
        <div
          className="mt-3 px-3 py-2 rounded-md border border-amber-400/50 bg-amber-400/10 text-amber-400 text-sm font-medium"
          role="alert"
        >
          High Traffic — exceeds {HIGH_TRAFFIC_THRESHOLD} vessels within 500m (2026 projection trends).
        </div>
      )}
    </div>
  );
}
