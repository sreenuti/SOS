"use client";

export type DashboardMode = "realtime" | "research";

interface ModeControllerProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

function LivePulseIcon() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
      <span
        className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-90"
        style={{ animation: "status-pulse 1.5s ease-in-out infinite" }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
    </span>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

export default function ModeController({ mode, onModeChange }: ModeControllerProps) {
  return (
    <div
      className="rounded-xl border border-ocean-border/60 bg-ocean-card/45 backdrop-blur-sm shadow-lg p-1.5 flex items-center gap-0"
      role="group"
      aria-label="Dashboard mode"
    >
      <button
        type="button"
        onClick={() => onModeChange("realtime")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          mode === "realtime"
            ? "bg-ocean-cyan/20 text-ocean-cyan border border-ocean-cyan/40 shadow-sm"
            : "text-ocean-muted hover:text-ocean-text hover:bg-ocean-surface/50 border border-transparent"
        }`}
        aria-pressed={mode === "realtime"}
        aria-label="Real-Time Monitoring"
      >
        <LivePulseIcon />
        <span>Real-Time</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("research")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          mode === "research"
            ? "bg-ocean-cyan/20 text-ocean-cyan border border-ocean-cyan/40 shadow-sm"
            : "text-ocean-muted hover:text-ocean-text hover:bg-ocean-surface/50 border border-transparent"
        }`}
        aria-pressed={mode === "research"}
        aria-label="Research History Mode"
      >
        <LibraryIcon className="w-5 h-5" />
        <span>Research</span>
      </button>
    </div>
  );
}
