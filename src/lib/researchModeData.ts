/**
 * Research History Mode data (Dolphin Research Charts Data Analysis).
 * X-axis: years 2000–2026.
 * - Health Tax: Every 1°F above baseline reduces survival strength by 2% (baseline from env, default 85.2).
 * - Entanglement Risk: climbs from 1 in 50 (2000) to 1 in 5 (2026).
 */

import { getHistoricalBaselineTempF } from "./survivalScore";

export interface ResearchYearPoint {
  year: number;
  /** Mean water temp °F (from research spreadsheet trend). */
  temperatureF: number;
  /** Survival strength %: 100 - 2*(tempF - baseline) for tempF >= baseline. */
  survivalStrengthPct: number;
  /** Entanglement risk denominator: 1 in N (50 → 5). */
  entanglementDenominator: number;
  /** Entanglement risk as % (2% → 20%). */
  entanglementRiskPct: number;
  /** Mortality risk % (projected); 2026 ≈ 5.90%. */
  mortalityRiskPct: number;
  /** Min/max mortality counts from historical band. */
  deathsMin: number;
  deathsMax: number;
  keyEvent?: string;
}

const KEY_EVENTS: Record<number, string> = {
  2000: "Baseline monitoring established in Bahama waters.",
  2001: "First documented temperature-mortality correlation study.",
  2002: "Unusual cold snap; lower mortality observed.",
  2003: "Hurricane impacts; temporary displacement.",
  2004: "Warm-water expansion; mortality range widened.",
  2005: "Multiple storm events (e.g. Katrina); habitat stress.",
  2006: "Recovery year; population surveys updated.",
  2007: "Food scarcity event in western range.",
  2008: "Oil spill risk assessment; mitigation measures.",
  2009: "Extended warm season; higher max mortality.",
  2010: "Deepwater Horizon spill; regional impact on prey.",
  2011: "Prey species decline; mortality spike in summer.",
  2012: "Record warm waters; min/max band widened.",
  2013: "The Exodus: 50% of dolphins relocated due to food scarcity.",
  2014: "New protected zones; some mortality reduction.",
  2015: "El Niño; prolonged high temperatures.",
  2016: "Bleaching event; indirect effects on dolphin prey.",
  2017: "Hurricane season; displacement and strandings.",
  2018: "2017–2018: Back-to-back stress years.",
  2019: "Revised mortality model; estimates updated.",
  2020: "COVID-era reduced boat traffic; lower vessel-related mortality.",
  2021: "Heat dome; short-term mortality increase.",
  2022: "Long-term warming trend continues.",
  2023: "New high in maximum mortality estimate.",
  2024: "Current year monitoring.",
  2025: "Projected (Est) – model extrapolation.",
  2026: "Projected (Pro) – 2026 mortality threshold 5.90% risk.",
};

/** Temperature trend by year (from Dolphin Research Charts: 85°F in 2000 → ~90.5°F in 2026). */
function getTemperatureByYear(year: number): number {
  const t = (year - 2000) / 26;
  return 85 + t * 5.5;
}

/** Entanglement: 1 in 50 (2000) → 1 in 5 (2026). */
function getEntanglementDenominator(year: number): number {
  const frac = (year - 2000) / 26;
  return Math.round(50 - frac * 45);
}

/** Mortality risk % trend: ~0.5% in 2000 → 5.90% in 2026. */
function getMortalityRiskPct(year: number): number {
  const frac = (year - 2000) / 26;
  return Math.round((0.5 + frac * 5.4) * 100) / 100;
}

/** Historical min/max band by year (from research spreadsheet). */
function getDeathsBand(year: number): { min: number; max: number } {
  const bands: Record<number, { min: number; max: number }> = {
    2000: { min: 5, max: 6 },
    2001: { min: 10, max: 17 },
    2002: { min: 18, max: 24 },
    2003: { min: 23, max: 30 },
    2004: { min: 28, max: 42 },
    2005: { min: 30, max: 49 },
    2006: { min: 33, max: 57 },
    2007: { min: 42, max: 64 },
    2008: { min: 47, max: 58 },
    2009: { min: 50, max: 62 },
    2010: { min: 51, max: 66 },
    2011: { min: 53, max: 74 },
    2012: { min: 55, max: 72 },
    2013: { min: 59, max: 84 },
    2014: { min: 60, max: 90 },
    2015: { min: 64, max: 92 },
    2016: { min: 65, max: 95 },
    2017: { min: 71, max: 102 },
    2018: { min: 74, max: 105 },
    2019: { min: 82, max: 110 },
    2020: { min: 80, max: 108 },
    2021: { min: 82, max: 110 },
    2022: { min: 83, max: 111 },
    2023: { min: 84, max: 112 },
    2024: { min: 84, max: 112 },
    2025: { min: 84, max: 112 },
    2026: { min: 88, max: 115 },
  };
  return bands[year] ?? { min: 50, max: 80 };
}

/**
 * Research mode time series: years 2000–2026.
 * Health Tax: survival strength = 100 - 2*(tempF - baseline) for tempF >= baseline.
 * Baseline is region-specific when stationId provided (cooler north).
 * Entanglement: 1 in 50 → 1 in 5.
 */
export function getResearchYearSeries(stationId?: string): ResearchYearPoint[] {
  const baseline = getHistoricalBaselineTempF(stationId);
  const points: ResearchYearPoint[] = [];
  for (let year = 2000; year <= 2026; year++) {
    const temperatureF = Math.round(getTemperatureByYear(year) * 10) / 10;
    const survivalStrengthPct = temperatureF >= baseline
      ? Math.round(Math.max(0, 100 - 2 * (temperatureF - baseline)) * 10) / 10
      : 100;
    const entanglementDenominator = getEntanglementDenominator(year);
    const entanglementRiskPct = Math.round((100 / entanglementDenominator) * 100) / 100;
    const mortalityRiskPct = getMortalityRiskPct(year);
    const { min: deathsMin, max: deathsMax } = getDeathsBand(year);
    points.push({
      year,
      temperatureF,
      survivalStrengthPct,
      entanglementDenominator,
      entanglementRiskPct,
      mortalityRiskPct,
      deathsMin,
      deathsMax,
      keyEvent: KEY_EVENTS[year],
    });
  }
  return points;
}

/** 2026 projected mortality threshold (%). When live data exceeds this, show "Projected Record High" alert. */
export const MORTALITY_RISK_THRESHOLD_2026_PCT = 5.9;

/** Get research data point for a given year. */
export function getResearchPointForYear(year: number): ResearchYearPoint | null {
  const series = getResearchYearSeries();
  return series.find((p) => p.year === year) ?? null;
}
