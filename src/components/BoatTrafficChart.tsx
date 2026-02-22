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

/** One tick per day (use first data point of each day) so labels are within axis domain and show once per day */
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
  return ticks;
}

export default function BoatTrafficChart({ data, viewDate }: BoatTrafficChartProps) {
  const viewTs = viewDate.getTime();
  const chartData = data.map((p) => ({
    ...p,
    name: formatTime(p.time),
  }));
  const xAxisTicks = getDayTicks(data);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm h-[320px] w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">
        Boat Traffic & Dolphin Mortality
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.15)" />
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
            stroke="#f59e0b"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
            domain={[0, "dataMax + 5"]}
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
              name === "boatTraffic" ? "Boat Traffic" : "Dolphin Mortality",
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
            type="natural"
            dataKey="boatTraffic"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
          <Line
            yAxisId="mortality"
            type="natural"
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
