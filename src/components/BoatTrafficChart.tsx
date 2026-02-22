"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/mockData";

interface BoatTrafficChartProps {
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

export default function BoatTrafficChart({ data, viewDate }: BoatTrafficChartProps) {
  const viewTs = viewDate.getTime();
  const chartData = data.map((p) => ({
    ...p,
    name: formatTime(p.time),
  }));
  const xAxisTicks = getDayTicks(data);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/30 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Nearby Vessels (within 500m) & Dolphin Mortality
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
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
            tickFormatter={(ts) =>
              new Date(ts).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            yAxisId="boats"
            orientation="left"
            stroke="#3b82f6"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
            domain={[2, 15]}
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
            formatter={(value: number, name: string) => [
              name === "boatTraffic" ? `${value} vessels` : value,
              name === "boatTraffic" ? "Nearby Vessels (within 500m)" : "Dolphin Mortality",
            ]}
          />
          <ReferenceLine
            yAxisId="boats"
            x={viewTs}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
          <Line
            yAxisId="boats"
            type="monotone"
            dataKey="boatTraffic"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
