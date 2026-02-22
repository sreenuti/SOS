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
import type { TimeSeriesPoint } from "@/lib/mockData";

const TEMP_COLOR = "#06b6d4";
const CORAL_RED = "#f08080";
const ROLLING_DAYS = 7;

function applyRollingAverage(data: TimeSeriesPoint[]): (TimeSeriesPoint & { dayLabel: string; mortality7dAvg: number })[] {
  return data.map((point, i) => {
    const start = Math.max(0, i - ROLLING_DAYS + 1);
    const slice = data.slice(start, i + 1);
    const sum = slice.reduce((a, p) => a + p.dolphinMortality, 0);
    const mortality7dAvg = Math.round((sum / slice.length) * 10) / 10;
    const dayLabel = new Date(point.time).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { ...point, dayLabel, mortality7dAvg };
  });
}

interface TemperatureMortalityChartProps {
  data: TimeSeriesPoint[];
}

export default function TemperatureMortalityChart({ data }: TemperatureMortalityChartProps) {
  const chartData = useMemo(() => applyRollingAverage(data), [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Water Temperature & Dolphin Mortality (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" />
          <XAxis
            dataKey="dayLabel"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval={2}
          />
          <YAxis
            yAxisId="temp"
            orientation="left"
            stroke={TEMP_COLOR}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
            label={{ value: "°F", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
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
              const p = payload[0].payload as TimeSeriesPoint & { mortality7dAvg?: number };
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
                  <p>Water Temperature: {p.temperature} °F</p>
                  <p>Dolphin Mortality (raw): {p.dolphinMortality}</p>
                  <p>Dolphin Mortality (7-day avg): {p.mortality7dAvg ?? p.dolphinMortality}</p>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "temperature" ? "Water Temperature (°F)" : "Dolphin Mortality (7-day avg)"
            }
          />
          <Bar
            yAxisId="temp"
            dataKey="temperature"
            fill={TEMP_COLOR}
            fillOpacity={0.3}
            name="temperature"
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
            name="dolphinMortality"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
