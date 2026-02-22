/**
 * Survival Score: 100 - ((CurrentTemp°F - 85) * 2).
 * At 85°F score = 100%; at 88°F score = 94%; above 88°F score drops below 94%.
 */
export function getSurvivalScore(currentTempF: number): number {
  const raw = 100 - (currentTempF - 85) * 2;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export const THERMAL_STRESS_TEMP_THRESHOLD_F = 88;
export const THERMAL_STRESS_SURVIVAL_THRESHOLD = 94;

/** Health Tax: every 1°F above 85°F reduces survival strength by 2%. Returns the reduction % for tooltips. */
export function getHealthTaxReductionPct(tempF: number): number {
  if (tempF < 85) return 0;
  return Math.round(2 * (tempF - 85) * 10) / 10;
}
