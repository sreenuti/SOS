"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import type { ResearchYearPoint } from "@/lib/researchModeData";

const GLASS_STYLE = {
  backgroundColor: "rgba(13, 33, 55, 0.95)",
  border: "1px solid rgba(45, 212, 191, 0.3)",
  borderRadius: "8px",
  color: "#f1f5f9",
};
const TEMP_COLOR = "#06b6d4";
const MORTALITY_COLOR = "#f08080";
const SURVIVAL_COLOR = "#34d399";
const ENTANGLEMENT_COLOR = "#a78bfa";

/** Health Tax: Survival strength % (every 1°F above 85°F reduces by 2%) + Temperature. X-axis: years 2000–2026. */
export function ResearchHealthTaxChart({ data }: { data: ResearchYearPoint[] }) {
  const chartData = useMemo(() => [...data], [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/30 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Health Tax — Survival Strength vs Temperature (2000–2026)
      </h3>
      <p className="text-ocean-muted/90 text-xs mb-2">
        Every 1°F above 85°F reduces survival strength by 2%.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval={2}
          />
          <YAxis
            yAxisId="survival"
            orientation="left"
            stroke={SURVIVAL_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Survival %", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            stroke={TEMP_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[84, 92]}
            tickFormatter={(v) => `${v}°F`}
          />
          <Tooltip
            contentStyle={GLASS_STYLE}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || label == null) return null;
              const p = payload[0].payload as ResearchYearPoint;
              return (
                <div className="rounded-lg border px-3 py-2 text-left shadow-lg" style={GLASS_STYLE}>
                  <p className="font-medium text-ocean-cyan/90 mb-1">Year {p.year}</p>
                  <p>Survival strength: {p.survivalStrengthPct}%</p>
                  <p>Temperature: {p.temperatureF} °F</p>
                  {p.keyEvent && <p className="mt-2 pt-2 border-t border-ocean-cyan/20 text-ocean-cyan/90 text-xs">{p.keyEvent}</p>}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine yAxisId="survival" y={94} stroke="#94a3b8" strokeDasharray="2 2" />
          <Line
            yAxisId="survival"
            type="monotone"
            dataKey="survivalStrengthPct"
            name="Survival strength %"
            stroke={SURVIVAL_COLOR}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Bar
            yAxisId="temp"
            dataKey="temperatureF"
            name="Water temp °F"
            fill={TEMP_COLOR}
            fillOpacity={0.35}
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Entanglement Risk: 1 in 50 (2000) → 1 in 5 (2026). Dual axis with mortality risk %. */
export function ResearchEntanglementMortalityChart({ data }: { data: ResearchYearPoint[] }) {
  const chartData = useMemo(() => data.map((p) => ({ ...p, riskLabel: `1 in ${p.entanglementDenominator}` })), [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/30 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Entanglement Risk & Mortality (2000–2026)
      </h3>
      <p className="text-ocean-muted/90 text-xs mb-2">
        Entanglement risk climbs from 1 in 50 to 1 in 5.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval={2}
          />
          <YAxis
            yAxisId="entanglement"
            orientation="left"
            stroke={ENTANGLEMENT_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, 25]}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Entanglement risk %", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
          />
          <YAxis
            yAxisId="mortality"
            orientation="right"
            stroke={MORTALITY_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, "auto"]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={GLASS_STYLE}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || label == null) return null;
              const p = payload[0].payload as ResearchYearPoint & { riskLabel?: string };
              return (
                <div className="rounded-lg border px-3 py-2 text-left shadow-lg" style={GLASS_STYLE}>
                  <p className="font-medium text-ocean-cyan/90 mb-1">Year {p.year}</p>
                  <p>Entanglement: 1 in {p.entanglementDenominator} ({p.entanglementRiskPct}%)</p>
                  <p>Mortality risk: {p.mortalityRiskPct}%</p>
                  {p.keyEvent && <p className="mt-2 pt-2 border-t border-ocean-cyan/20 text-ocean-cyan/90 text-xs">{p.keyEvent}</p>}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            yAxisId="entanglement"
            type="monotone"
            dataKey="entanglementRiskPct"
            name="Entanglement risk %"
            stroke={ENTANGLEMENT_COLOR}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="mortality"
            type="monotone"
            dataKey="mortalityRiskPct"
            name="Mortality risk %"
            stroke={MORTALITY_COLOR}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Temperature vs Mortality (deaths min/max) by year. Dual axis. */
export function ResearchTemperatureMortalityChart({ data }: { data: ResearchYearPoint[] }) {
  const chartData = useMemo(() => [...data], [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/30 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Temperature vs Dolphin Mortality (2000–2026)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval={2}
          />
          <YAxis
            yAxisId="temp"
            orientation="left"
            stroke={TEMP_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}°F`}
            label={{ value: "Water temp °F", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
          />
          <YAxis
            yAxisId="mortality"
            orientation="right"
            stroke={MORTALITY_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={GLASS_STYLE}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || label == null) return null;
              const p = payload[0].payload as ResearchYearPoint;
              return (
                <div className="rounded-lg border px-3 py-2 text-left shadow-lg" style={GLASS_STYLE}>
                  <p className="font-medium text-ocean-cyan/90 mb-1">Year {p.year}</p>
                  <p>Temperature: {p.temperatureF} °F</p>
                  <p>Mortality (min–max): {p.deathsMin} – {p.deathsMax}</p>
                  {p.keyEvent && <p className="mt-2 pt-2 border-t border-ocean-cyan/20 text-ocean-cyan/90 text-xs">{p.keyEvent}</p>}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperatureF"
            name="Water temp °F"
            stroke={TEMP_COLOR}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="mortality"
            type="monotone"
            dataKey="deathsMin"
            name="Mortality (min)"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={{ r: 1 }}
            activeDot={{ r: 3 }}
          />
          <Line
            yAxisId="mortality"
            type="monotone"
            dataKey="deathsMax"
            name="Mortality (max)"
            stroke={MORTALITY_COLOR}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
