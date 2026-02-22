"use client";

interface RecordHighAlertProps {
  /** Current mortality risk % (e.g. from temperature-based model). */
  mortalityRiskPct: number;
  /** Threshold from 2026 projection (e.g. 5.90). */
  thresholdPct: number;
}

export default function RecordHighAlert({ mortalityRiskPct, thresholdPct }: RecordHighAlertProps) {
  if (mortalityRiskPct < thresholdPct) return null;

  return (
    <div
      className="rounded-xl border border-red-400/50 bg-red-500/15 backdrop-blur-sm px-4 py-3 flex items-center gap-3"
      role="alert"
    >
      <span className="flex h-3 w-3 rounded-full bg-red-400 animate-pulse" aria-hidden />
      <div>
        <p className="font-semibold text-red-200">Projected Record High</p>
        <p className="text-sm text-red-200/90">
          Live data exceeds the 2026 projected mortality threshold of {thresholdPct}% risk (current: {mortalityRiskPct.toFixed(2)}%).
        </p>
      </div>
    </div>
  );
}
