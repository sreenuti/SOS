"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DebrisMortalityPoint } from "@/lib/mockData";

const DEBRIS_HIGH = 300;
const MORTALITY_HIGH = 2;
const LIGHT_BLUE = "#7dd3fc";
const CORAL_RED = "#f08080";
const ROLLING_DAYS = 7;

function getCorrelationLabel(debris: number, mortality: number): string {
  if (debris > DEBRIS_HIGH && mortality > MORTALITY_HIGH) return "High";
  if (debris > DEBRIS_HIGH || mortality > MORTALITY_HIGH) return "Moderate";
  return "Low";
}

/** 7-day rolling average of dolphin mortality for smoother trend line. */
function applyRollingAverage(
  data: DebrisMortalityPoint[]
): (DebrisMortalityPoint & { mortality7dAvg: number })[] {
  return data.map((point, i) => {
    const start = Math.max(0, i - ROLLING_DAYS + 1);
    const slice = data.slice(start, i + 1);
    const sum = slice.reduce((a, p) => a + p.dolphinMortalityCount, 0);
    const mortality7dAvg = Math.round((sum / slice.length) * 10) / 10;
    return { ...point, mortality7dAvg };
  });
}

interface DebrisMortalityChartProps {
  data: DebrisMortalityPoint[];
}

export default function DebrisMortalityChart({ data }: DebrisMortalityChartProps) {
  const chartData = useMemo(() => applyRollingAverage(data), [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/30 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Marine Debris Density & Dolphin Mortality (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" />
          <XAxis
            dataKey="monthLabel"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            yAxisId="debris"
            orientation="left"
            stroke={LIGHT_BLUE}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
          />
          <YAxis
            yAxisId="mortality"
            orientation="right"
            stroke={CORAL_RED}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(13, 33, 55, 0.95)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const p = payload[0].payload as DebrisMortalityPoint & { mortality7dAvg?: number };
              const debris = p.marineDebrisDensity;
              const accumulation = p.debrisAccumulation ?? 0;
              const mortality = p.dolphinMortalityCount;
              const avg = p.mortality7dAvg ?? mortality;
              const correlation = getCorrelationLabel(debris, mortality);
              const showNote = debris > DEBRIS_HIGH && mortality > MORTALITY_HIGH;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-left shadow-lg"
                  style={{
                    backgroundColor: "rgba(13, 33, 55, 0.95)",
                    border: "1px solid rgba(45, 212, 191, 0.3)",
                    color: "#f1f5f9",
                    fontSize: 12,
                  }}
                >
                  <p className="font-medium text-ocean-cyan/90 mb-1">{label}</p>
                  <p>Marine Debris Density: {debris} items/km²</p>
                  <p>Debris Accumulation (projected): {accumulation} MT</p>
                  <p>Dolphin Mortality (follows accumulation): {mortality}</p>
                  <p>Dolphin Mortality (7-day avg): {avg}</p>
                  <p className="mt-1 text-amber-200/90">
                    Correlation Factor: {correlation}
                    {showNote && (
                      <span className="block mt-0.5 text-red-300/95">
                        High Correlation: Potential Pollution-Driven Event.
                      </span>
                    )}
                  </p>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "marineDebrisDensity"
                ? "Marine Debris Density (items/km²)"
                : "Dolphin Mortality (7-day avg, follows debris accumulation)"
            }
          />
          <Bar
            yAxisId="debris"
            dataKey="marineDebrisDensity"
            fill={LIGHT_BLUE}
            fillOpacity={0.3}
            name="marineDebrisDensity"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="mortality"
            type="monotone"
            dataKey="mortality7dAvg"
            stroke={CORAL_RED}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CORAL_RED }}
            name="dolphinMortalityCount"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
