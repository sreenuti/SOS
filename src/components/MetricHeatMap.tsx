"use client";

import { useMemo, useState } from "react";
import type { TimeSeriesPoint } from "@/lib/mockData";

export interface HeatMapMetricConfig {
  dataKey: keyof TimeSeriesPoint;
  label: string;
  unit?: string;
  /** CSS color for lowest value */
  lowColor: string;
  /** CSS color for highest value */
  highColor: string;
  min?: number;
  max?: number;
}

function interpolateColor(low: string, high: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  const hex = (c: string) => {
    const n = parseInt(c, 16);
    return isNaN(n) ? 0 : n;
  };
  const parse = (s: string): [number, number, number] => {
    const h = s.replace(/^#/, "");
    if (h.length === 6)
      return [hex(h.slice(0, 2)), hex(h.slice(2, 4)), hex(h.slice(4, 6))];
    if (s.startsWith("rgb")) {
      const m = s.match(/\d+/g);
      return m ? (m.map(Number) as [number, number, number]) : [0, 0, 0];
    }
    return [128, 128, 128];
  };
  const a = parse(low);
  const b = parse(high);
  const r = Math.round(a[0] + (b[0] - a[0]) * clamp);
  const g = Math.round(a[1] + (b[1] - a[1]) * clamp);
  const bl = Math.round(a[2] + (b[2] - a[2]) * clamp);
  return `rgb(${r},${g},${bl})`;
}

interface MetricHeatMapProps {
  data: TimeSeriesPoint[];
  title: string;
  rowA: HeatMapMetricConfig;
  rowB: HeatMapMetricConfig;
  /** Max number of day columns to show labels for (avoid overlap) */
  maxDateLabels?: number;
}

export default function MetricHeatMap({
  data,
  title,
  rowA,
  rowB,
  maxDateLabels = 8,
}: MetricHeatMapProps) {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const { scaleA, scaleB, dateLabels } = useMemo(() => {
    if (!data.length) {
      return { scaleA: { min: 0, max: 1 }, scaleB: { min: 0, max: 1 }, dateLabels: [] };
    }
    const valsA = data.map((d) => Number(d[rowA.dataKey]));
    const valsB = data.map((d) => Number(d[rowB.dataKey]));
    const minA = rowA.min ?? Math.min(...valsA);
    const maxA = rowA.max ?? Math.max(...valsA);
    const minB = rowB.min ?? Math.min(...valsB);
    const maxB = rowB.max ?? Math.max(...valsB);
    const rangeA = maxA - minA || 1;
    const rangeB = maxB - minB || 1;
    const dateLabels = data.map((d) =>
      new Date(d.time).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
    return {
      scaleA: { min: minA, max: maxA, range: rangeA },
      scaleB: { min: minB, max: maxB, range: rangeB },
      dateLabels,
    };
  }, [data, rowA.dataKey, rowA.min, rowA.max, rowB.dataKey, rowB.min, rowB.max]);

  const showLabelIndexes = useMemo(() => {
    const n = data.length;
    if (n <= maxDateLabels) return data.map((_, i) => i);
    const step = (n - 1) / (maxDateLabels - 1);
    const out: number[] = [];
    for (let i = 0; i < maxDateLabels; i++) {
      out.push(Math.min(Math.round(i * step), n - 1));
    }
    return out;
  }, [data.length, maxDateLabels]);

  if (!data.length) {
    return (
      <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm h-[220px] w-full">
        <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">{title}</h3>
        <p className="text-ocean-muted text-sm">No data</p>
      </div>
    );
  }

  const n = data.length;
  const rangeA = scaleA.range ?? 1;
  const rangeB = scaleB.range ?? 1;
  const getColorA = (v: number) =>
    interpolateColor(rowA.lowColor, rowA.highColor, (v - scaleA.min) / rangeA);
  const getColorB = (v: number) =>
    interpolateColor(rowB.lowColor, rowB.highColor, (v - scaleB.min) / rangeB);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/35 backdrop-blur-sm w-full">
      <h3 className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Row labels + grid */}
          <div className="grid gap-px" style={{ gridTemplateColumns: `100px repeat(${n}, minmax(0, 1fr))` }}>
            {/* Header row: dates */}
            <div className="rounded-l bg-ocean-card/50 flex items-end pb-1 pr-2 text-right text-ocean-muted text-[10px] font-medium">
              Day
            </div>
            {data.map((d, i) => (
              <div
                key={d.time}
                className="text-center text-ocean-muted text-[10px] pb-1 pt-0.5 truncate"
                title={dateLabels[i]}
              >
                {showLabelIndexes.includes(i) ? dateLabels[i] : ""}
              </div>
            ))}
            {/* Row A */}
            <div className="rounded-l bg-ocean-card/50 flex items-center pr-2 text-right text-ocean-muted text-xs font-medium">
              {rowA.label}
              {rowA.unit && <span className="ml-0.5 opacity-80">({rowA.unit})</span>}
            </div>
            {data.map((d, i) => {
              const v = Number(d[rowA.dataKey]);
              const isHover = hovered?.row === 0 && hovered?.col === i;
              return (
                <div
                  key={`a-${d.time}`}
                  className="h-10 rounded-sm transition-all border border-transparent"
                  style={{
                    backgroundColor: getColorA(v),
                    borderColor: isHover ? "rgba(45, 212, 191, 0.8)" : "transparent",
                    borderWidth: isHover ? 2 : 0,
                  }}
                  title={`${dateLabels[i]}: ${v}${rowA.unit ?? ""}`}
                  onMouseEnter={() => setHovered({ row: 0, col: i })}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHover && (
                    <span className="text-[10px] font-medium text-white drop-shadow-md flex items-center justify-center h-full">
                      {v}
                      {rowA.unit ?? ""}
                    </span>
                  )}
                </div>
              );
            })}
            {/* Row B */}
            <div className="rounded-l bg-ocean-card/50 flex items-center pr-2 text-right text-ocean-muted text-xs font-medium">
              {rowB.label}
              {rowB.unit && <span className="ml-0.5 opacity-80">({rowB.unit})</span>}
            </div>
            {data.map((d, i) => {
              const v = Number(d[rowB.dataKey]);
              const isHover = hovered?.row === 1 && hovered?.col === i;
              return (
                <div
                  key={`b-${d.time}`}
                  className="h-10 rounded-sm transition-all border border-transparent"
                  style={{
                    backgroundColor: getColorB(v),
                    borderColor: isHover ? "rgba(45, 212, 191, 0.8)" : "transparent",
                    borderWidth: isHover ? 2 : 0,
                  }}
                  title={`${dateLabels[i]}: ${v}${rowB.unit ?? ""}`}
                  onMouseEnter={() => setHovered({ row: 1, col: i })}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHover && (
                    <span className="text-[10px] font-medium text-white drop-shadow-md flex items-center justify-center h-full">
                      {v}
                      {rowB.unit ?? ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend: scale for each row */}
          <div className="flex gap-6 mt-3 text-[10px] text-ocean-muted">
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: rowA.lowColor }}
              />
              {rowA.label} low
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: rowA.highColor }}
              />
              {rowA.label} high
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: rowB.lowColor }}
              />
              {rowB.label} low
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: rowB.highColor }}
              />
              {rowB.label} high
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
