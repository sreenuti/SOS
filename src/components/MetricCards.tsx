"use client";

import type { MetricsAtTime } from "@/lib/mockData";
import MetricCard from "./MetricCard";
import DebrisHealthBadge from "./DebrisHealthBadge";

// Simple SVG icons for each metric (inline to avoid asset setup)
const BoatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-2m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5M16 9v6M8 9v6M5 9v6" />
  </svg>
);
const WaterTempIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);
const DebrisIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface MetricCardsProps {
  metrics: MetricsAtTime;
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Nearby Vessels (within 500m)"
        value={metrics.boatTraffic}
        unit="vessels"
        icon={<BoatIcon />}
      />
      <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/45 backdrop-blur-sm shadow-xl min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
            Water Quality & Temperature
          </span>
          <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
            <WaterTempIcon />
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-baseline gap-2">
            <span
              className="text-ocean-muted text-xs uppercase tracking-wider"
              title="Natural background levels range from 10–60 NTU in Texas estuaries."
            >
              Turbidity
            </span>
            <span
              className={`text-xl md:text-2xl font-semibold tabular-nums ${metrics.turbidity > 30 ? "text-amber-400" : "text-ocean-text"}`}
              title="Natural background levels range from 10–60 NTU in Texas estuaries."
            >
              {metrics.turbidity}
            </span>
            <span className="text-ocean-muted text-sm">NTU</span>
            {metrics.turbidity > 30 && (
              <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">Caution</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-ocean-muted text-xs uppercase tracking-wider">Temperature</span>
            <span className="text-xl md:text-2xl font-semibold text-ocean-text tabular-nums">
              {metrics.waterTemp}
            </span>
            <span className="text-ocean-muted text-sm">°F</span>
          </div>
        </div>
      </div>
      <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/45 backdrop-blur-sm shadow-xl min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
            Debris Density
          </span>
          <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
            <DebrisIcon />
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-semibold text-ocean-text tabular-nums">
            {metrics.marineDebris}
          </span>
          <span className="text-ocean-muted text-sm font-normal">items/km²</span>
          <DebrisHealthBadge density={metrics.marineDebris} />
        </div>
      </div>
    </div>
  );
}
