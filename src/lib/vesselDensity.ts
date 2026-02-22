/**
 * Vessel density (within 500m) constants from historical research and 2026 projection trends.
 */

/** Baseline growth rate per year from historical research (1.2% per year). */
export const BASELINE_GROWTH_RATE_YEARLY = 0.012;

/**
 * High Traffic threshold for 2026 projection trends: when Live vessel count
 * exceeds this (vessels within 500m), trigger a High Traffic alert.
 */
export const HIGH_TRAFFIC_THRESHOLD = 15;

/** Projected vessel count for a target year given a baseline count and baseline year (using 1.2% growth). */
export function projectedVesselCount(
  currentCount: number,
  baselineYear: number,
  targetYear: number
): number {
  const years = targetYear - baselineYear;
  if (years <= 0) return currentCount;
  const factor = Math.pow(1 + BASELINE_GROWTH_RATE_YEARLY, years);
  return Math.round(currentCount * factor * 10) / 10;
}
