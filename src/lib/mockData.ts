/**
 * Mock data generator for Deep Ocean dashboard.
 * Deterministic 30-day time series for temperature, dolphin activity, boat traffic, turbidity, debris.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between points

export interface TimeSeriesPoint {
  time: number;
  timeLabel: string;
  temperature: number;
  dolphinActivity: number;
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
  const start = now - 30 * MS_PER_DAY;
  const points: TimeSeriesPoint[] = [];

  for (let t = start; t <= now; t += INTERVAL_MS) {
    const dayFrac = (t - start) / MS_PER_DAY;
    const hour = (new Date(t).getHours() + new Date(t).getMinutes() / 60) / 24;

    // Temperature 72–82°F with daily cycle (warmer afternoon)
    const tempBase = 76 + 4 * Math.sin((dayFrac * 2 * Math.PI) * 0.1);
    const tempCycle = 3 * Math.sin((hour - 0.4) * 2 * Math.PI);
    const tempNoise = (seeded(t * 0.001) - 0.5) * 1.5;
    const temperature = Math.round((tempBase + tempCycle + tempNoise) * 10) / 10;

    // Dolphin activity 0–100 with peaks (morning/evening)
    const dolphinBase = 50 + 25 * Math.sin(dayFrac * 0.2);
    const dolphinPeak = 30 * Math.exp(-Math.pow((hour - 0.25) * 10, 2)) + 25 * Math.exp(-Math.pow((hour - 0.75) * 10, 2));
    const dolphinNoise = (seeded(t * 0.002) - 0.5) * 10;
    const dolphinActivity = Math.max(0, Math.min(100, Math.round(dolphinBase + dolphinPeak + dolphinNoise)));

    // Boat traffic 0–50 (higher on weekends and midday)
    const dayOfWeek = new Date(t).getDay();
    const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1;
    const boatMidday = 20 * Math.exp(-Math.pow((hour - 0.5) * 8, 2));
    const boatNoise = seeded(t * 0.003) * 8;
    const boatTraffic = Math.max(0, Math.min(50, Math.round(weekend * (5 + boatMidday + boatNoise))));

    // Turbidity (NTU-like) 0.5–8 with some spikes
    const turbBase = 2 + 1.5 * Math.sin(dayFrac * 0.15);
    const turbSpike = seeded(t * 0.004) > 0.97 ? 4 : 0;
    const turbidity = Math.round((turbBase + turbSpike + (seeded(t * 0.005) - 0.5) * 0.5) * 10) / 10;

    // Marine debris 0–25 count
    const debrisBase = 5 + 5 * Math.sin(dayFrac * 0.12);
    const debrisNoise = (seeded(t * 0.006) - 0.5) * 4;
    const debris = Math.max(0, Math.min(25, Math.round(debrisBase + debrisNoise)));

    points.push({
      time: t,
      timeLabel: new Date(t).toISOString(),
      temperature,
      dolphinActivity,
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
    return { boatTraffic: 0, turbidity: 0, waterTemp: 0, marineDebris: 0 };
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

/** Slider range: [0, 1] maps to [30 days ago, now] */
export function sliderValueToDate(value: number): Date {
  const now = Date.now();
  const start = now - 30 * MS_PER_DAY;
  return new Date(start + value * (now - start));
}

export function dateToSliderValue(date: Date): number {
  const now = Date.now();
  const start = now - 30 * MS_PER_DAY;
  const t = date.getTime();
  if (t <= start) return 0;
  if (t >= now) return 1;
  return (t - start) / (now - start);
}
