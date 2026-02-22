"use client";

const MARKER_2013 = {
  year: 2013,
  title: "The Exodus",
  description: "50% of dolphins relocated due to food scarcity.",
};

interface HistoricalMarkersProps {
  viewYear: number;
  onDismiss?: () => void;
}

export default function HistoricalMarkers({ viewYear }: HistoricalMarkersProps) {
  if (viewYear !== MARKER_2013.year) return null;

  return (
    <div
      className="glass-card border-ocean-cyan/40 bg-ocean-cyan/10 p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <p className="text-ocean-muted text-xs font-medium uppercase tracking-wider mb-1">
        Historical marker — {MARKER_2013.year}
      </p>
      <p className="text-ocean-cyan font-semibold">{MARKER_2013.title}</p>
      <p className="text-ocean-text text-sm mt-1">{MARKER_2013.description}</p>
    </div>
  );
}
