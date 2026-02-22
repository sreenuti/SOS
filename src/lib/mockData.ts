/**
 * Mock data generator for Deep Ocean dashboard.
 * Deterministic 7-day (1 week) time series for temperature, dolphin mortality, boat traffic, turbidity, debris.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between points
const RANGE_DAYS = 7; // 1 week

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

/** Full 7-day time series at 15-min intervals */
export function getMockTimeSeries(): TimeSeriesPoint[] {
  const now = Date.now();
  const start = now - RANGE_DAYS * MS_PER_DAY;
  const points: TimeSeriesPoint[] = [];

  for (let t = start; t <= now; t += INTERVAL_MS) {
    const dayFrac = (t - start) / MS_PER_DAY;
    const hour = (new Date(t).getHours() + new Date(t).getMinutes() / 60) / 24;

    // Temperature 72–82°F with daily cycle (warmer afternoon)
    const tempBase = 76 + 4 * Math.sin((dayFrac * 2 * Math.PI) * 0.1);
    const tempCycle = 3 * Math.sin((hour - 0.4) * 2 * Math.PI);
    const tempNoise = (seeded(t * 0.001) - 0.5) * 1.5;
    const temperature = Math.round((tempBase + tempCycle + tempNoise) * 10) / 10;

    // Boat traffic: nearby vessels within 500m, realistic range 2–15 (Texas ship channel)
    const dayOfWeek = new Date(t).getDay();
    const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1;
    const boatMidday = 20 * Math.exp(-Math.pow((hour - 0.5) * 8, 2));
    const boatNoise = seeded(t * 0.003) * 8;
    const rawBoat = weekend * (5 + boatMidday + boatNoise);
    const boatTraffic = Math.max(2, Math.min(15, Math.round(2 + (13 * Math.min(rawBoat, 30) / 30))));

    // Dolphin mortality 0–20: correlates with boat traffic (higher traffic → more mortality) plus baseline and noise
    const mortalityFromTraffic = (boatTraffic / 50) * 12;
    const mortalityBase = 2 + 2 * Math.sin(dayFrac * 0.1);
    const mortalityNoise = (seeded(t * 0.007) - 0.5) * 3;
    const dolphinMortality = Math.max(0, Math.min(20, Math.round(mortalityBase + mortalityFromTraffic + mortalityNoise)));

    // Turbidity (NTU): Texas estuary range 10–60; natural background 10–60, >30 often exceeds standards
    const turbBase = 12.5 + 23 * Math.sin(dayFrac * 0.15);
    const turbSpike = seeded(t * 0.004) > 0.97 ? 18 : 0;
    const turbidity = Math.round(Math.max(10, Math.min(60, turbBase + turbSpike + (seeded(t * 0.005) - 0.5) * 3)) * 10) / 10;

    // Marine debris density 50–500 items/km² (realistic coastal pollution)
    const debrisBase = 150 + 150 * Math.sin(dayFrac * 0.12);
    const debrisNoise = (seeded(t * 0.006) - 0.5) * 80;
    const debris = Math.max(50, Math.min(500, Math.round(debrisBase + debrisNoise)));

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
