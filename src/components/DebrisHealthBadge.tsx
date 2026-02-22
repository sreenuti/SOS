"use client";

import { getDebrisHealthStatus, getDebrisHealthLabel, type DebrisHealthStatus } from "@/lib/debrisHealth";

const STATUS_STYLES: Record<
  DebrisHealthStatus,
  { bg: string; text: string; ring: string }
> = {
  healthy: { bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-500/50" },
  caution: { bg: "bg-amber-500/20", text: "text-amber-400", ring: "ring-amber-500/50" },
  critical: { bg: "bg-red-500/20", text: "text-red-400", ring: "ring-red-500/50" },
};

interface DebrisHealthBadgeProps {
  density: number;
}

export default function DebrisHealthBadge({ density }: DebrisHealthBadgeProps) {
  const status = getDebrisHealthStatus(density);
  const label = getDebrisHealthLabel(status);
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${style.bg} ${style.text} ${style.ring}`}
      title={`0–100: Healthy · 101–300: Caution · >300: Critical. Current: ${density} items/km²`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-80`} aria-hidden />
      {label}
    </span>
  );
}
