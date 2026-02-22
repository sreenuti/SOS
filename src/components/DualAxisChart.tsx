"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/mockData";

interface DualAxisChartProps {
  data: TimeSeriesPoint[];
  viewDate: Date;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MAX_X_TICKS = 10;

/** Day-level ticks for X-axis; capped and evenly spaced to avoid overlapping labels. */
function getDayTicks(data: TimeSeriesPoint[]): number[] {
  if (!data.length) return [];
  const ticks: number[] = [];
  let lastDateKey = "";
  for (const p of data) {
    const d = new Date(p.time);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dateKey !== lastDateKey) {
      lastDateKey = dateKey;
      ticks.push(p.time);
    }
  }
  if (ticks.length <= MAX_X_TICKS) return ticks;
  const result: number[] = [];
  const step = (ticks.length - 1) / (MAX_X_TICKS - 1);
  for (let i = 0; i < MAX_X_TICKS; i++) {
    result.push(ticks[Math.min(Math.round(i * step), ticks.length - 1)]);
  }
  return result;
}

export default function DualAxisChart({ data, viewDate }: DualAxisChartProps) {
  const viewTs = viewDate.getTime();
  const chartData = data.map((p) => ({
    ...p,
    name: formatTime(p.time),
  }));
  const xAxisTicks = getDayTicks(data);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Water Temperature & Dolphin Mortality
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={xAxisTicks}
            interval={0}
            tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            yAxisId="temp"
            orientation="left"
            stroke="#06b6d4"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}°`}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <YAxis
            yAxisId="mortality"
            orientation="right"
            stroke="#ef4444"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(13, 33, 55, 0.95)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            labelFormatter={(ts) => formatTime(Number(ts))}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const temp = payload.find((p) => p.dataKey === "temperature");
              const mort = payload.find((p) => p.dataKey === "dolphinMortality");
              return (
                <div
                  className="rounded-lg border px-3 py-2 shadow-lg"
                  style={{
                    backgroundColor: "rgba(13, 33, 55, 0.95)",
                    border: "1px solid rgba(45, 212, 191, 0.3)",
                    color: "#f1f5f9",
                    fontSize: 12,
                  }}
                >
                  <p className="font-medium text-cyan-200/90 mb-1">{typeof label === "number" ? formatTime(label) : label}</p>
                  {temp != null && <p>Temperature: {temp.value} °F</p>}
                  {mort != null && <p>Dolphin Mortality: {mort.value}</p>}
                </div>
              );
            }}
          />
          <ReferenceLine
            yAxisId="temp"
            x={viewTs}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            fill="#06b6d4"
            fillOpacity={0.2}
            stroke="none"
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#06b6d4" }}
          />
          <Line
            yAxisId="mortality"
            type="monotone"
            dataKey="dolphinMortality"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#ef4444" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
