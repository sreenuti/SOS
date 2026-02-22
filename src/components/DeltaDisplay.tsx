"use client";

/**
 * Shows current value with delta vs a historical baseline (e.g. 2000–2003).
 * Used next to live temp and vessel metrics for deeper data comparison.
 */

export type DeltaKind = "temperature" | "vessels" | "neutral";

const DELTA_STYLES: Record<DeltaKind, { positive: string; negative: string; zero: string }> = {
  temperature: {
    positive: "text-amber-400",
    negative: "text-emerald-400",
    zero: "text-ocean-muted",
  },
  vessels: {
    positive: "text-amber-400",
    negative: "text-emerald-400",
    zero: "text-ocean-muted",
  },
  neutral: {
    positive: "text-ocean-cyan/90",
    negative: "text-ocean-cyan/90",
    zero: "text-ocean-muted",
  },
};

interface DeltaDisplayProps {
  /** Current live value */
  current: number;
  /** Baseline (e.g. 2000–2003 average) */
  baseline: number;
  /** Unit label, e.g. "°F", "vessels", "k/yr" */
  unit: string;
  /** How to interpret delta: higher temp = worse, higher vessels = worse */
  kind?: DeltaKind;
  /** Optional label for baseline, e.g. "2000–2003" */
  baselineLabel?: string;
  /** Format current value (default: number) */
  formatCurrent?: (n: number) => string;
  /** Format delta (default: +X / -X) */
  formatDelta?: (delta: number) => string;
  className?: string;
}

export default function DeltaDisplay({
  current,
  baseline,
  unit,
  kind = "neutral",
  baselineLabel = "2000–2003",
  formatCurrent = (n) => String(n),
  formatDelta = (d) => (d > 0 ? `+${d}` : String(d)),
  className = "",
}: DeltaDisplayProps) {
  const delta = Math.round((current - baseline) * 10) / 10;
  const styles = DELTA_STYLES[kind];
  const deltaClass =
    delta > 0 ? styles.positive : delta < 0 ? styles.negative : styles.zero;

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="tabular-nums">{formatCurrent(current)}</span>
      <span className="text-ocean-muted text-sm">{unit}</span>
      <span
        className={`text-xs tabular-nums ${deltaClass}`}
        title={`Baseline ${baselineLabel}: ${formatCurrent(baseline)} ${unit}`}
      >
        {delta !== 0 && (
          <>
            {formatDelta(delta)}
            {unit}
            <span className="text-ocean-muted font-normal"> vs {baselineLabel}</span>
          </>
        )}
      </span>
    </span>
  );
}
