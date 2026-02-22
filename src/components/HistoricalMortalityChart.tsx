"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import type { HistoricalMortalityPoint } from "@/lib/historicalMortalityData";

const BLUE = "#3b82f6";
const RED = "#ef4444";

export interface HistoricalMortalityChartProps {
  /** Historical data (temperature °F vs min/max mortality). */
  data: HistoricalMortalityPoint[];
  /** Optional: current water temp from NOAA so chart shows a live reference line and updates when it changes. */
  currentTemperatureF?: number | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: HistoricalMortalityPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const tempLabel = p.tempLabel ?? `${p.temperatureF} °F`;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-left shadow-lg max-w-[320px]"
      style={{
        backgroundColor: "rgba(13, 33, 55, 0.95)",
        border: "1px solid rgba(45, 212, 191, 0.3)",
        color: "#f1f5f9",
        fontSize: 12,
      }}
    >
      <p className="font-medium text-ocean-cyan/90 mb-1">
        {tempLabel}
        {p.year != null && (
          <span className="text-ocean-muted ml-1">({p.year})</span>
        )}
      </p>
      <p className="text-slate-300 mb-1">
        Min mortality: <span style={{ color: BLUE }}>{p.deathsMin}</span>
        {" · "}
        Max mortality: <span style={{ color: RED }}>{p.deathsMax}</span>
      </p>
      {p.keyEvent && (
        <p className="mt-2 pt-2 border-t border-ocean-cyan/20 text-ocean-cyan/90">
          <span className="font-medium text-ocean-muted">Key Event:</span>{" "}
          {p.keyEvent}
        </p>
      )}
    </div>
  );
}

export default function HistoricalMortalityChart({
  data,
  currentTemperatureF,
}: HistoricalMortalityChartProps) {
  const chartData = useMemo(() => [...data], [data]);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm h-[360px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Bahama Dolphin Mortality — Historical (Water Temperature °F)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 24, left: 10, bottom: 24 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(45, 212, 191, 0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="temperatureF"
            type="number"
            domain={["dataMin", "dataMax"]}
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => {
              const point = chartData.find((p) => p.temperatureF === v);
              return point?.tempLabel ?? `${v}`;
            }}
            label={{
              value: "Water Temperature (°F)",
              position: "insideBottom",
              offset: -8,
              fill: "#94a3b8",
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, "auto"]}
            label={{
              value: "Bahama Dolphin Mortality",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 10,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "deathsMin"
                ? "Minimum Mortality"
                : value === "deathsMax"
                  ? "Maximum Mortality"
                  : value
            }
          />
          <Line
            type="monotone"
            dataKey="deathsMin"
            name="deathsMin"
            stroke={BLUE}
            strokeWidth={2}
            dot={{ r: 3, fill: BLUE }}
            activeDot={{ r: 5, fill: BLUE, stroke: "#1e40af" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="deathsMax"
            name="deathsMax"
            stroke={RED}
            strokeWidth={2}
            dot={{ r: 3, fill: RED }}
            activeDot={{ r: 5, fill: RED, stroke: "#b91c1c" }}
            connectNulls
          />
          {currentTemperatureF != null &&
            currentTemperatureF >= (chartData[0]?.temperatureF ?? 0) &&
            currentTemperatureF <= (chartData[chartData.length - 1]?.temperatureF ?? 0) && (
              <ReferenceLine
                x={currentTemperatureF}
                stroke="#22d3ee"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Current: ${currentTemperatureF} °F`,
                  position: "top",
                  fill: "#22d3ee",
                  fontSize: 10,
                }}
              />
            )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
