import type { MetricsAtTime } from "./mockData";

/** Thresholds for "high" / "elevated" conditions (Galveston / Texas coast context) */
const HIGH_BOAT_THRESHOLD = 8;       // vessels within 500m (range 2–15)
const HIGH_TURBIDITY_NTU = 30;       // above state/environmental caution
const ELEVATED_TEMP_F = 84;          // thermal stress / algal bloom risk
const HIGH_DEBRIS = 300;             // items/km² critical zone

/**
 * Rule-based "AI" logic: generates a single Scientist's Insight sentence from current metrics.
 * Priority: combined high boat + high turbidity > high turbidity alone > high temp > high debris > favorable > default.
 */
export function generateScientistsInsight(metrics: MetricsAtTime): string {
  const { boatTraffic, turbidity, waterTemp, marineDebris } = metrics;
  const highBoat = boatTraffic >= HIGH_BOAT_THRESHOLD;
  const highTurbidity = turbidity > HIGH_TURBIDITY_NTU;
  const elevatedTemp = waterTemp >= ELEVATED_TEMP_F;
  const highDebris = marineDebris > HIGH_DEBRIS;

  // Highest priority: boat + turbidity combination (calf separation risk)
  if (highBoat && highTurbidity) {
    return `Notice: High boat traffic (current: ${boatTraffic}) is coinciding with high turbidity (current: ${turbidity} NTU). This combination significantly increases the risk of calf separation in the Galveston area.`;
  }

  if (highTurbidity) {
    return `Notice: Elevated turbidity (current: ${turbidity} NTU) may reduce acoustic visibility for mother-calf pairs in the Galveston Ship Channel. Consider reduced survey effort in low-visibility conditions.`;
  }

  if (highBoat) {
    return `Notice: High vessel presence (current: ${boatTraffic} within 500 m) in the channel. Dolphin foraging and socializing behavior can be disrupted; monitor for avoidance or stress indicators.`;
  }

  if (elevatedTemp) {
    return `Notice: Water temperature (current: ${waterTemp}°F) is approaching levels that favor harmful algal blooms and lower dissolved oxygen. This can reduce prey availability for dolphins in the Galveston area.`;
  }

  if (highDebris) {
    return `Notice: Marine debris density (current: ${marineDebris} items/km²) is in the critical range. Habitat quality and entanglement risk for marine mammals may be elevated in the survey area.`;
  }

  // Favorable or moderate conditions
  if (boatTraffic <= 5 && turbidity <= 20) {
    return `Conditions are relatively favorable: low vessel presence (${boatTraffic} within 500 m) and moderate turbidity (${turbidity} NTU). Good window for acoustic and visual monitoring in the Galveston area.`;
  }

  return `Current conditions: ${boatTraffic} vessels within 500 m, ${turbidity} NTU turbidity, ${waterTemp}°F. No single factor is at a critical threshold; continue routine monitoring.`;
}
