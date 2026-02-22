"use client";

import { useEffect, useRef } from "react";
import type { ObservationLogEntry } from "@/lib/observationLog";
import { formatLogTime } from "@/lib/observationLog";

interface LiveObservationLogProps {
  entries: ObservationLogEntry[];
}

export default function LiveObservationLog({ entries }: LiveObservationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="glass-card border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm shadow-xl flex flex-col h-full min-h-0">
      <h2 className="text-ocean-cyan text-sm font-semibold uppercase tracking-wider p-4 pb-2 flex-shrink-0 border-b border-ocean-border/40">
        Live Observation Log
      </h2>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2"
      >
        {entries.length === 0 ? (
          <p className="text-ocean-muted text-sm py-4">No alerts. Monitoring…</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`text-xs rounded-md px-3 py-2 border-l-4 ${
                entry.severity === "red"
                  ? "border-red-500 bg-red-500/10 text-red-200"
                  : "border-amber-500 bg-amber-500/10 text-amber-200"
              }`}
            >
              <span className="font-mono text-ocean-muted">
                {formatLogTime(entry.time)}{" "}
              </span>
              <span className="font-medium">
                {entry.severity === "red" ? "ALERT" : "CAUTION"}:{" "}
              </span>
              <span className="text-ocean-text/90">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
