"use client";

interface StatusIndicatorProps {
  isLive: boolean;
  viewDate: Date;
}

function formatHistoricalDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StatusIndicator({ isLive, viewDate }: StatusIndicatorProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg border min-w-0"
      style={{
        backgroundColor: isLive ? "rgba(34, 197, 94, 0.12)" : "rgba(234, 179, 8, 0.12)",
        borderColor: isLive ? "rgba(34, 197, 94, 0.4)" : "rgba(234, 179, 8, 0.4)",
      }}
    >
      <span
        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: isLive ? "#22c55e" : "#eab308",
          boxShadow: isLive ? "0 0 8px rgba(34, 197, 94, 0.6)" : "0 0 8px rgba(234, 179, 8, 0.6)",
          animation: isLive ? "status-pulse 2s ease-in-out infinite" : "none",
        }}
      />
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-w-0">
        <span
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: isLive ? "#4ade80" : "#facc15" }}
        >
          {isLive ? "LIVE" : "HISTORICAL"}
        </span>
        {!isLive && (
          <span className="text-ocean-muted text-sm truncate">
            Viewing Data from: {formatHistoricalDate(viewDate)}
          </span>
        )}
        {isLive && (
          <span className="text-ocean-muted text-sm">Data pulsing and updating</span>
        )}
      </div>
    </div>
  );
}
