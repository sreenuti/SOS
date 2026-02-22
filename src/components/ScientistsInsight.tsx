"use client";

import type { MetricsAtTime } from "@/lib/mockData";
import { generateScientistsInsight } from "@/lib/scientistsInsight";

interface ScientistsInsightProps {
  metrics: MetricsAtTime;
}

export default function ScientistsInsight({ metrics }: ScientistsInsightProps) {
  const insight = generateScientistsInsight(metrics);

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm shadow-xl">
      <div className="flex items-start gap-3">
        <span
          className="text-ocean-cyan/90 w-8 h-8 flex-shrink-0 flex items-center justify-center"
          aria-hidden
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-ocean-cyan text-sm font-semibold uppercase tracking-wider mb-1.5">
            Scientist&apos;s Insight
          </h3>
          <p className="text-ocean-text text-sm md:text-base leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
