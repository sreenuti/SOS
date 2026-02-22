"use client";

interface DashboardLoadingWidgetProps {
  /** Full-screen style when true (no cached data); compact "Updating…" when false */
  fullPage?: boolean;
  label?: string;
}

export default function DashboardLoadingWidget({
  fullPage = true,
  label = "Loading data…",
}: DashboardLoadingWidgetProps) {
  if (fullPage) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-lg border border-ocean-cyan/20 bg-ocean-card/20 backdrop-blur-sm min-h-[280px] w-full"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-ocean-cyan/30"
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-ocean-cyan animate-spin"
            aria-hidden
            style={{ animationDuration: "0.8s" }}
          />
        </div>
        <p className="text-ocean-muted text-sm font-medium">{label}</p>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-ocean-cyan/30 bg-ocean-cyan/10 text-ocean-cyan text-sm"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-ocean-cyan/50 border-t-ocean-cyan animate-spin"
        aria-hidden
        style={{ animationDuration: "0.8s" }}
      />
      {label}
    </div>
  );
}
