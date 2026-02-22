/**
 * Debris density health thresholds (items/km²) for marine life risk.
 * Used for dashboard Health Status and 3D scene feedback.
 */
export const DEBRIS_HEALTH = {
  HEALTHY_MAX: 100,
  CAUTION_MAX: 300,
} as const;

export type DebrisHealthStatus = "healthy" | "caution" | "critical";

export function getDebrisHealthStatus(density: number): DebrisHealthStatus {
  if (density <= DEBRIS_HEALTH.HEALTHY_MAX) return "healthy";
  if (density <= DEBRIS_HEALTH.CAUTION_MAX) return "caution";
  return "critical";
}

export function getDebrisHealthLabel(status: DebrisHealthStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "caution":
      return "Caution";
    case "critical":
      return "Critical Danger to Marine Life";
  }
}
