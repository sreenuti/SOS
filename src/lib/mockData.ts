/**
 * Mock data generator for Deep Ocean dashboard.
 * Deterministic 30-day time series for temperature, dolphin mortality, boat traffic, turbidity, debris.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between points
const RANGE_DAYS = 30;

// --- 2026 Real-Time projection ceilings and entanglement ---
/** 2026 projection: marine debris accumulation monthly ceiling (MT). At ~687 MT, entanglement = 1 in 5. */
export const DEBRIS_MT_CEILING_2026 = 687;
/** 2026 projection: total vessels per month as ceiling for vessel density metrics. */
export const VESSELS_MONTHLY_CEILING_2026 = 18_279;
/** Researched entanglement probability for 2026: 1 in N sightings. */
export const ENTANGLEMENT_DENOMINATOR_2026 = 5;
/** Entanglement risk % for 2026 (1 in 5 = 20%). */
export const ENTANGLEMENT_RISK_PCT_2026 = 100 / ENTANGLEMENT_DENOMINATOR_2026;

/** Daily flux ±5% by time of day; peak vessel hours (e.g. 10–14) get +5%, off-peak −5%. */
export function getDailyFluxFactor(hourNorm: number): number {
  // hourNorm in [0, 1) for 24h; peak at ~0.5 (noon)
  const peak = Math.exp(-Math.pow((hourNorm - 0.5) * 4, 2));
  return 0.95 + 0.1 * peak;
}

export interface TimeSeriesPoint {
  time: number;
  timeLabel: string;
  temperature: number;
  dolphinMortality: number;
  boatTraffic: number;
  turbidity: number;
  debris: number;
}

export interface MetricsAtTime {
  boatTraffic: number;
  turbidity: number;
  waterTemp: number;
  marineDebris: number;
}

/** Deterministic pseudo-random from seed (date-based) */
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Full 30-day time series at 15-min intervals */
export function getMockTimeSeries(): TimeSeriesPoint[] {
  const now = Date.now();
  const start = now - RANGE_DAYS * MS_PER_DAY;
  const points: TimeSeriesPoint[] = [];

  for (let t = start; t <= now; t += INTERVAL_MS) {
    const dayFrac = (t - start) / MS_PER_DAY;
    const hour = (new Date(t).getHours() + new Date(t).getMinutes() / 60) / 24;
    const flux = getDailyFluxFactor(hour);

    // Temperature 72–82°F with daily cycle (warmer afternoon)
    const tempBase = 76 + 4 * Math.sin((dayFrac * 2 * Math.PI) * 0.1);
    const tempCycle = 3 * Math.sin((hour - 0.4) * 2 * Math.PI);
    const tempNoise = (seeded(t * 0.001) - 0.5) * 1.5;
    const temperature = Math.round((tempBase + tempCycle + tempNoise) * 10) / 10;

    // Vessel density: 2026 monthly ceiling 18,279 total vessels; daily flux ±5% by peak hours (within 500m proxy)
    const slotsPerMonth = 30 * (MS_PER_DAY / INTERVAL_MS);
    const avgPerSlot = VESSELS_MONTHLY_CEILING_2026 / slotsPerMonth;
    const dayOfWeek = new Date(t).getDay();
    const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 1;
    const boatShape = Math.exp(-Math.pow((hour - 0.5) * 4, 2));
    const boatTraffic = Math.max(2, Math.min(20, Math.round(avgPerSlot * flux * weekend * (0.8 + 0.4 * boatShape) + (seeded(t * 0.003) - 0.5) * 2)));

    // Dolphin mortality 0–20: correlates with boat traffic (higher traffic → more mortality) plus baseline and noise
    const mortalityFromTraffic = (boatTraffic / 50) * 12;
    const mortalityBase = 2 + 2 * Math.sin(dayFrac * 0.1);
    const mortalityNoise = (seeded(t * 0.007) - 0.5) * 3;
    const dolphinMortality = Math.max(0, Math.min(20, Math.round(mortalityBase + mortalityFromTraffic + mortalityNoise)));

    // Turbidity (NTU): Texas estuary range 10–60; natural background 10–60, >30 often exceeds standards
    const turbBase = 12.5 + 23 * Math.sin(dayFrac * 0.15);
    const turbSpike = seeded(t * 0.004) > 0.97 ? 18 : 0;
    const turbidity = Math.round(Math.max(10, Math.min(60, turbBase + turbSpike + (seeded(t * 0.005) - 0.5) * 3)) * 10) / 10;

    // Marine debris: 2026 monthly ceiling 687 MT; density (items/km²) with daily flux ±5%
    const debrisBase = 150 + 150 * Math.sin(dayFrac * 0.12);
    const debrisNoise = (seeded(t * 0.006) - 0.5) * 80;
    const debrisRaw = debrisBase + debrisNoise;
    const debris = Math.max(50, Math.min(500, Math.round(debrisRaw * flux)));

    points.push({
      time: t,
      timeLabel: new Date(t).toISOString(),
      temperature,
      dolphinMortality,
      boatTraffic,
      turbidity,
      debris,
    });
  }

  return points;
}

/** Aggregate 15-min series into one point per day (avg temp, boat traffic, mortality) for readable charts. */
export function getDailyAggregatedSeries(raw: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!raw.length) return [];
  const byDay = new Map<string, TimeSeriesPoint[]>();
  for (const p of raw) {
    const d = new Date(p.time);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(p);
  }
  const result: TimeSeriesPoint[] = [];
  const keys = Array.from(byDay.keys()).sort();
  for (const key of keys) {
    const points = byDay.get(key)!;
    const n = points.length;
    const time = points[0].time;
    result.push({
      time,
      timeLabel: new Date(time).toISOString(),
      temperature: Math.round((points.reduce((a, p) => a + p.temperature, 0) / n) * 10) / 10,
      dolphinMortality: Math.round((points.reduce((a, p) => a + p.dolphinMortality, 0) / n) * 10) / 10,
      boatTraffic: Math.round((points.reduce((a, p) => a + p.boatTraffic, 0) / n) * 10) / 10,
      turbidity: Math.round((points.reduce((a, p) => a + p.turbidity, 0) / n) * 10) / 10,
      debris: Math.round(points.reduce((a, p) => a + p.debris, 0) / n),
    });
  }
  return result;
}

/** Get metric values at a given view date (nearest point or interpolate). */
export function getMetricsAtTime(
  dataset: TimeSeriesPoint[],
  viewDate: Date
): MetricsAtTime {
  const ts = viewDate.getTime();
  if (dataset.length === 0) {
    return { boatTraffic: 0, turbidity: 0, waterTemp: 0, marineDebris: 0 }; // 0 = no data
  }
  if (ts <= dataset[0].time) {
    const p = dataset[0];
    return { boatTraffic: p.boatTraffic, turbidity: p.turbidity, waterTemp: p.temperature, marineDebris: p.debris };
  }
  if (ts >= dataset[dataset.length - 1].time) {
    const p = dataset[dataset.length - 1];
    return { boatTraffic: p.boatTraffic, turbidity: p.turbidity, waterTemp: p.temperature, marineDebris: p.debris };
  }
  let i = 0;
  while (i < dataset.length - 1 && dataset[i + 1].time < ts) i++;
  const a = dataset[i];
  const b = dataset[i + 1];
  const frac = (ts - a.time) / (b.time - a.time);
  return {
    boatTraffic: Math.round(a.boatTraffic + frac * (b.boatTraffic - a.boatTraffic)),
    turbidity: Math.round((a.turbidity + frac * (b.turbidity - a.turbidity)) * 10) / 10,
    waterTemp: Math.round((a.temperature + frac * (b.temperature - a.temperature)) * 10) / 10,
    marineDebris: Math.round(a.debris + frac * (b.debris - a.debris)),
  };
}

/** Slider range: [0, 1] maps to [RANGE_DAYS ago, now] */
export function sliderValueToDate(value: number): Date {
  const now = Date.now();
  const start = now - RANGE_DAYS * MS_PER_DAY;
  return new Date(start + value * (now - start));
}

export function dateToSliderValue(date: Date): number {
  const now = Date.now();
  const start = now - RANGE_DAYS * MS_PER_DAY;
  const t = date.getTime();
  if (t <= start) return 0;
  if (t >= now) return 1;
  return (t - start) / (now - start);
}

// --- 12-month Debris vs Mortality (for DebrisMortalityChart) ---

export interface DebrisMortalityPoint {
  time: number;
  monthLabel: string;
  marineDebrisDensity: number; // items/km²
  /** Projected debris accumulation (MT); mortality line follows this. At ~687 MT, entanglement risk ≈ 1 in 5. */
  debrisAccumulation: number;
  dolphinMortalityCount: number; // scaled from debrisAccumulation so mortality line follows accumulation
}

const MONTH_MS = 30 * MS_PER_DAY; // ~1 month
const DEBRIS_SPIKE_THRESHOLD = 320; // items/km² above which we consider a "spike"
/** At ~687 MT projected, research shows entanglement risk 1 in 5 sightings (2026). */
const DEBRIS_ACCUMULATION_MIN_MT = 400;
/** Real-time 2026: monthly ceiling 687 MT; entanglement locked at 1 in 5. */
const DEBRIS_ACCUMULATION_MAX_MT = DEBRIS_MT_CEILING_2026;

/** Deterministic 12-month series: debris density + dolphin mortality with biological lag (debris spike → 70% chance mortality increase next month). */
export function getDebrisMortalitySeries(): DebrisMortalityPoint[] {
  const now = Date.now();
  const points: DebrisMortalityPoint[] = [];
  let prevDebris = 0;

  for (let i = 11; i >= 0; i--) {
    const t = now - i * MONTH_MS;
    const monthSeed = Math.floor(t / MONTH_MS);

    // Marine debris density 80–450 items/km² with occasional spikes
    const debrisBase = 120 + 120 * Math.sin(monthSeed * 0.4);
    const spike = seeded(monthSeed * 0.13) > 0.6 ? 120 + seeded(monthSeed * 0.17) * 80 : 0;
    const debrisNoise = (seeded(monthSeed * 0.11) - 0.5) * 60;
    const marineDebrisDensity = Math.max(80, Math.min(450, Math.round(debrisBase + spike + debrisNoise)));

    // Projected debris accumulation (MT); 2026 ceiling 687 MT (entanglement 1 in 5)
    const accumulationNorm = (marineDebrisDensity - 80) / (450 - 80);
    const debrisAccumulation = Math.min(
      DEBRIS_MT_CEILING_2026,
      Math.round(
        DEBRIS_ACCUMULATION_MIN_MT + accumulationNorm * (DEBRIS_ACCUMULATION_MAX_MT - DEBRIS_ACCUMULATION_MIN_MT) + (seeded(monthSeed * 0.07) - 0.5) * 50
      )
    );
    const accumNorm = (debrisAccumulation - DEBRIS_ACCUMULATION_MIN_MT) / (DEBRIS_ACCUMULATION_MAX_MT - DEBRIS_ACCUMULATION_MIN_MT);
    const dolphinMortalityCount = Math.max(0, Math.min(20, Math.round(accumNorm * 18 + 1)));

    const d = new Date(t);
    const monthLabel = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });

    points.push({
      time: t,
      monthLabel,
      marineDebrisDensity,
      debrisAccumulation,
      dolphinMortalityCount,
    });

    prevDebris = marineDebrisDensity;
  }

  return points;
}

/** Deterministic daily series (RANGE_DAYS): debris density, debrisAccumulation (MT), and mortality line following accumulation. */
export function getDebrisMortalitySeries7Days(): DebrisMortalityPoint[] {
  const now = Date.now();
  const points: DebrisMortalityPoint[] = [];
  let prevDebris = 0;

  for (let i = RANGE_DAYS - 1; i >= 0; i--) {
    const t = now - i * MS_PER_DAY;
    const daySeed = Math.floor(t / MS_PER_DAY);

    // Marine debris density with daily flux ±5% (peak hours); 80–450 items/km²
    const hour = (new Date(t).getHours() + new Date(t).getMinutes() / 60) / 24;
    const flux = getDailyFluxFactor(hour);
    const debrisBase = 150 + 150 * Math.sin(daySeed * 0.12);
    const spike = seeded(daySeed * 0.13) > 0.65 ? 100 + seeded(daySeed * 0.17) * 80 : 0;
    const debrisNoise = (seeded(daySeed * 0.11) - 0.5) * 50;
    const marineDebrisDensity = Math.max(80, Math.min(450, Math.round((debrisBase + spike + debrisNoise) * flux)));

    // Projected debris accumulation (MT): 2026 monthly ceiling 687 MT; entanglement 1 in 5 at ceiling
    const accumulationNorm = (marineDebrisDensity - 80) / (450 - 80);
    const accumulationNoise = (seeded(daySeed * 0.07) - 0.5) * 40;
    const debrisAccumulation = Math.min(
      DEBRIS_MT_CEILING_2026,
      Math.round(
        DEBRIS_ACCUMULATION_MIN_MT + accumulationNorm * (DEBRIS_ACCUMULATION_MAX_MT - DEBRIS_ACCUMULATION_MIN_MT) + accumulationNoise
      )
    );

    // Mortality line follows debrisAccumulation (scaled to 0–20 for right axis)
    const accumNorm = (debrisAccumulation - DEBRIS_ACCUMULATION_MIN_MT) / (DEBRIS_ACCUMULATION_MAX_MT - DEBRIS_ACCUMULATION_MIN_MT);
    const dolphinMortalityCount = Math.max(0, Math.min(20, Math.round(accumNorm * 18 + 1)));

    const d = new Date(t);
    const monthLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    points.push({
      time: t,
      monthLabel,
      marineDebrisDensity,
      debrisAccumulation,
      dolphinMortalityCount,
    });

    prevDebris = marineDebrisDensity;
  }

  return points;
}
