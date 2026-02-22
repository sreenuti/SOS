/**
 * Historical Bahama dolphin mortality by water temperature (°F).
 * Matches Dolphin Research Charts: Min/Max mortality vs Water Temperature.
 * Each point can have a Key Event for tooltip (e.g. year-specific events).
 */

export interface HistoricalMortalityPoint {
  /** Water temperature in °F (X-axis) */
  temperatureF: number;
  /** Minimum mortality estimate */
  deathsMin: number;
  /** Maximum mortality estimate */
  deathsMax: number;
  /** Year this reading is associated with (for display) */
  year?: number;
  /** Optional label for axis (e.g. "90.1 (Est)", "90.5 (Pro)") */
  tempLabel?: string;
  /** Key event description for hover popup (e.g. "2013: The Exodus - 50% of dolphins relocated due to food scarcity") */
  keyEvent?: string;
}

/** Key events by year for tooltip popups (spreadsheet-style). */
const KEY_EVENTS: Record<number, string> = {
  2000: "2000: Baseline monitoring established in Bahama waters.",
  2001: "2001: First documented temperature-mortality correlation study.",
  2002: "2002: Unusual cold snap; lower mortality observed.",
  2003: "2003: Hurricane impacts; temporary displacement.",
  2004: "2004: Warm-water expansion; mortality range widened.",
  2005: "2005: Multiple storm events (e.g. Katrina); habitat stress.",
  2006: "2006: Recovery year; population surveys updated.",
  2007: "2007: Food scarcity event in western range.",
  2008: "2008: Oil spill risk assessment; mitigation measures.",
  2009: "2009: Extended warm season; higher max mortality.",
  2010: "2010: Deepwater Horizon spill; regional impact on prey.",
  2011: "2011: Prey species decline; mortality spike in summer.",
  2012: "2012: Record warm waters; min/max band widened.",
  2013: "2013: The Exodus - 50% of dolphins relocated due to food scarcity.",
  2014: "2014: New protected zones; some mortality reduction.",
  2015: "2015: El Niño; prolonged high temperatures.",
  2016: "2016: Bleaching event; indirect effects on dolphin prey.",
  2017: "2017: Hurricane season; displacement and strandings.",
  2018: "2018: 2017–2018: Back-to-back stress years.",
  2019: "2019: Revised mortality model; estimates updated.",
  2020: "2020: COVID-era reduced boat traffic; lower vessel-related mortality.",
  2021: "2021: Heat dome; short-term mortality increase.",
  2022: "2022: Long-term warming trend continues.",
  2023: "2023: New high in maximum mortality estimate.",
  2024: "2024: Current year monitoring.",
  2025: "2025: Projected (Est) – model extrapolation.",
  2026: "2026: Projected (Pro) – scenario-based estimate.",
};

/**
 * Historical mortality by water temperature (°F).
 * X-axis: Water Temperature (°F); Y: Min/Max mortality.
 * Ordered by temperature for LineChart.
 */
export function getHistoricalMortalityByTemperature(): HistoricalMortalityPoint[] {
  const raw: Array<{
    temperatureF: number;
    deathsMin: number;
    deathsMax: number;
    year: number;
    tempLabel?: string;
  }> = [
    { temperatureF: 85.0, deathsMin: 5, deathsMax: 6, year: 2000 },
    { temperatureF: 85.1, deathsMin: 10, deathsMax: 17, year: 2001 },
    { temperatureF: 85.2, deathsMin: 18, deathsMax: 24, year: 2002 },
    { temperatureF: 85.4, deathsMin: 23, deathsMax: 30, year: 2003 },
    { temperatureF: 85.8, deathsMin: 28, deathsMax: 42, year: 2004 },
    { temperatureF: 85.9, deathsMin: 30, deathsMax: 49, year: 2005 },
    { temperatureF: 86.0, deathsMin: 33, deathsMax: 57, year: 2006 },
    { temperatureF: 86.2, deathsMin: 42, deathsMax: 64, year: 2007 },
    { temperatureF: 86.3, deathsMin: 47, deathsMax: 58, year: 2008 },
    { temperatureF: 86.8, deathsMin: 50, deathsMax: 62, year: 2009 },
    { temperatureF: 87.1, deathsMin: 51, deathsMax: 66, year: 2010 },
    { temperatureF: 87.5, deathsMin: 53, deathsMax: 74, year: 2011 },
    { temperatureF: 88.0, deathsMin: 55, deathsMax: 72, year: 2012 },
    { temperatureF: 88.2, deathsMin: 59, deathsMax: 84, year: 2013 },
    { temperatureF: 88.4, deathsMin: 60, deathsMax: 90, year: 2014 },
    { temperatureF: 88.6, deathsMin: 64, deathsMax: 92, year: 2015 },
    { temperatureF: 88.9, deathsMin: 65, deathsMax: 95, year: 2016 },
    { temperatureF: 89.1, deathsMin: 71, deathsMax: 102, year: 2017 },
    { temperatureF: 89.4, deathsMin: 74, deathsMax: 105, year: 2018 },
    { temperatureF: 89.7, deathsMin: 82, deathsMax: 110, year: 2019 },
    { temperatureF: 90.1, deathsMin: 84, deathsMax: 112, year: 2025, tempLabel: "90.1 (Est)" },
    { temperatureF: 90.5, deathsMin: 88, deathsMax: 115, year: 2026, tempLabel: "90.5 (Pro)" },
  ];

  return raw.map((p) => ({
    ...p,
    keyEvent: KEY_EVENTS[p.year] ?? `${p.year}: Historical data point.`,
  }));
}
