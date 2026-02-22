"use client";

/**
 * Debris composition breakdown for biologists: what the debris is.
 * Percentages reflect typical coastal marine debris composition.
 */
const COMPOSITION = [
  { label: "Single-use Plastics (Bottles, straws)", percent: 60, color: "bg-amber-500/80" },
  { label: "Fishing Gear (Nets, lines—deadly for dolphins)", percent: 25, color: "bg-rose-500/90" },
  { label: "Microplastics / Other", percent: 15, color: "bg-sky-600/80" },
] as const;

export default function DebrisComposition() {
  return (
    <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
          Debris Composition
        </span>
      </div>
      <p className="text-ocean-muted text-xs mb-3">
        Typical breakdown of marine debris (helps target cleanup & policy).
      </p>
      <div className="space-y-3">
        {COMPOSITION.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ocean-text">{item.label}</span>
              <span className="text-ocean-muted tabular-nums font-medium">{item.percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-ocean-border/40 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
