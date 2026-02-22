"use client";

import type { MetricsAtTime } from "@/lib/mockData";
import { getSurvivalScore, THERMAL_STRESS_TEMP_THRESHOLD_F } from "@/lib/survivalScore";
import MetricCard from "./MetricCard";
import DebrisHealthBadge from "./DebrisHealthBadge";
import VesselDensity from "./VesselDensity";

// Simple SVG icons for each metric (inline to avoid asset setup)
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
const SurvivalScoreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

interface MetricCardsProps {
  metrics: MetricsAtTime;
  isLive?: boolean;
}

export default function MetricCards({ metrics, isLive = false }: MetricCardsProps) {
  const survivalScore = getSurvivalScore(metrics.waterTemp);
  const showThermalAlert = metrics.waterTemp >= THERMAL_STRESS_TEMP_THRESHOLD_F;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <VesselDensity count={metrics.boatTraffic} isLive={isLive} />
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
            Marine Debris
          </span>
          <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
            <DebrisIcon />
          </span>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-semibold text-ocean-text tabular-nums">
              {metrics.marineDebris}
            </span>
            <span className="text-ocean-muted text-sm font-normal">items/km²</span>
            <DebrisHealthBadge density={metrics.marineDebris} />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 pt-1 border-t border-ocean-border/40">
            <span className="text-ocean-muted text-xs uppercase tracking-wider">Entanglement Probability</span>
            <span className="text-lg font-semibold text-amber-200/95 tabular-nums" title="At ~687 MT projected debris, research shows 1 in 5 sightings show entanglement risk.">
              1 in 5 sightings
            </span>
            <span className="text-ocean-muted text-[10px]">(at ~687 MT projected)</span>
          </div>
        </div>
      </div>
      <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/45 backdrop-blur-sm shadow-xl min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
            Survival Score
          </span>
          <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
            <SurvivalScoreIcon />
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span
            className={`text-2xl md:text-3xl font-semibold tabular-nums ${
              survivalScore < 94 ? "text-amber-400" : "text-ocean-text"
            }`}
            title="SurvivalScore = 100 - ((CurrentTemp°F - 85) × 2)"
          >
            {survivalScore}
          </span>
          <span className="text-ocean-muted text-sm font-normal">%</span>
        </div>
        {showThermalAlert && (
          <p className="mt-3 text-amber-400 text-sm font-medium" role="alert">
            Thermal Stress Alert: Survival Score dropping below 94% based on 26-year historical trend.
          </p>
        )}
      </div>
      </div>
    </div>
  );
}
