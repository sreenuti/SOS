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

export default function DualAxisChart({ data, viewDate }: DualAxisChartProps) {
  const viewTs = viewDate.getTime();
  const chartData = data.map((p) => ({
    ...p,
    name: formatTime(p.time),
  }));

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/60 backdrop-blur-md h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Water Temperature & Dolphin Activity
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.15)" />
          <XAxis
            dataKey="time"
            tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            yAxisId="temp"
            orientation="left"
            stroke="#14b8a6"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}°`}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <YAxis
            yAxisId="dolphin"
            orientation="right"
            stroke="#2dd4bf"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, 100]}
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
              name === "temperature" ? `${value} °F` : value,
              name === "temperature" ? "Temperature" : "Dolphin Activity",
            ]}
          />
          <ReferenceLine
            yAxisId="temp"
            x={viewTs}
            stroke="#2dd4bf"
            strokeDasharray="4 4"
            strokeOpacity={0.8}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#14b8a6" }}
          />
          <Line
            yAxisId="dolphin"
            type="monotone"
            dataKey="dolphinActivity"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#2dd4bf" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
