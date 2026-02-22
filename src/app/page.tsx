"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MetricCards from "@/components/MetricCards";
import DebrisComposition from "@/components/DebrisComposition";
import { useMarineDebris } from "@/context/MarineDebrisContext";
import TemperatureMortalityChart from "@/components/TemperatureMortalityChart";
import BoatTrafficMortalityChart from "@/components/BoatTrafficMortalityChart";
import DebrisMortalityChart from "@/components/DebrisMortalityChart";
import HistoricalMortalityChart from "@/components/HistoricalMortalityChart";
import { useNoaaTemperature } from "@/hooks/useNoaaTemperature";
import { getHistoricalMortalityByTemperature } from "@/lib/historicalMortalityData";
import ScientistsInsight from "@/components/ScientistsInsight";
import TimelineSlider from "@/components/TimelineSlider";
import StatusIndicator from "@/components/StatusIndicator";
import type { MetricsAtTime } from "@/lib/mockData";
import {
  getMockTimeSeries,
  getDailyAggregatedSeries,
  getDebrisMortalitySeries7Days,
  getMetricsAtTime,
  sliderValueToDate,
  dateToSliderValue,
} from "@/lib/mockData";
import {
  getNewObservationEntries,
  type ObservationLogEntry,
} from "@/lib/observationLog";
import LiveObservationLog from "@/components/LiveObservationLog";

const SLIDER_THROTTLE_MS = 40;

const TICK_MS = 3000; // live update every 3 seconds
const ADVANCE_MS = 3 * 60 * 1000; // advance view by 3 minutes each tick

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [sliderDragging, setSliderDragging] = useState(false);

  const dataset = useMemo(() => (mounted ? getMockTimeSeries() : []), [mounted]);
  const dailyDataset = useMemo(() => getDailyAggregatedSeries(dataset), [dataset]);
  const debrisMortalityData = useMemo(() => (mounted ? getDebrisMortalitySeries7Days() : []), [mounted]);
  const historicalMortalityData = useMemo(
    () => (mounted ? getHistoricalMortalityByTemperature() : []),
    [mounted]
  );
  const { latestReading } = useNoaaTemperature();
  const [timelineLiveValue, setTimelineLiveValue] = useState(0);
  const timelineThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimelineUpdate = useRef(0);
  const pendingTimeline = useRef<number | null>(null);

  const [logEntries, setLogEntries] = useState<ObservationLogEntry[]>([]);
  const prevMetricsRef = useRef<MetricsAtTime | null>(null);

  useEffect(() => {
    setMounted(true);
    setViewDate(new Date());
  }, []);

  const metrics = useMemo(
    () =>
      viewDate && dataset.length > 0
        ? getMetricsAtTime(dataset, viewDate)
        : { boatTraffic: 0, turbidity: 0, waterTemp: 0, marineDebris: 0 },
    [dataset, viewDate]
  );

  /** LIVE when viewing "now" (within 2 min); HISTORICAL when scrubbing the past */
  const isLive = useMemo(() => {
    if (!viewDate) return false;
    const now = Date.now();
    const diff = now - viewDate.getTime();
    return diff >= 0 && diff < 2 * 60 * 1000;
  }, [viewDate]);

  const { setMarineDebris } = useMarineDebris();
  useEffect(() => {
    setMarineDebris(metrics.marineDebris);
  }, [metrics.marineDebris, setMarineDebris]);

  // Append Live Observation Log entries when metrics transition into Red/Yellow (and High Traffic when Live & >15)
  useEffect(() => {
    if (!viewDate) return;
    const prev = prevMetricsRef.current;
    const newEntries = getNewObservationEntries(metrics, viewDate, prev, isLive);
    if (newEntries.length > 0) {
      setLogEntries((list) => [...list, ...newEntries]);
    }
    prevMetricsRef.current = metrics;
  }, [metrics, viewDate, isLive]);

  const sliderValue = useMemo(
    () => (viewDate ? dateToSliderValue(viewDate) : 0),
    [viewDate]
  );

  const handleTimelineChange = useCallback((value: number) => {
    setTimelineLiveValue(value);
    const now = Date.now();
    if (now - lastTimelineUpdate.current >= SLIDER_THROTTLE_MS) {
      lastTimelineUpdate.current = now;
      setViewDate(sliderValueToDate(value));
      pendingTimeline.current = null;
    } else {
      pendingTimeline.current = value;
      if (timelineThrottleRef.current === null) {
        timelineThrottleRef.current = setTimeout(() => {
          timelineThrottleRef.current = null;
          if (pendingTimeline.current !== null) {
            const v = pendingTimeline.current;
            pendingTimeline.current = null;
            lastTimelineUpdate.current = Date.now();
            setViewDate(sliderValueToDate(v));
          }
        }, SLIDER_THROTTLE_MS);
      }
    }
  }, []);

  const handleTimelineDragEnd = useCallback((value: number) => {
    setViewDate(sliderValueToDate(value));
    pendingTimeline.current = null;
    if (timelineThrottleRef.current !== null) {
      clearTimeout(timelineThrottleRef.current);
      timelineThrottleRef.current = null;
    }
  }, []);

  const handleBackToLive = useCallback(() => {
    const now = new Date();
    setViewDate(now);
    setTimelineLiveValue(dateToSliderValue(now));
    pendingTimeline.current = null;
    if (timelineThrottleRef.current !== null) {
      clearTimeout(timelineThrottleRef.current);
      timelineThrottleRef.current = null;
    }
  }, []);

  // Keep timeline live value in sync: when not dragging use viewDate; when drag starts use current slider value
  useEffect(() => {
    if (!sliderDragging && viewDate) {
      setTimelineLiveValue(dateToSliderValue(viewDate));
    }
  }, [sliderDragging, viewDate]);

  // Live advance every 3s when timeline not being dragged
  useEffect(() => {
    if (!viewDate || sliderDragging) return;
    const id = setInterval(() => {
      setViewDate((prev) => {
        if (!prev) return prev;
        const next = new Date(prev.getTime() + ADVANCE_MS);
        const now = new Date();
        return next > now ? now : next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [viewDate, sliderDragging]);

  if (!mounted || !viewDate) {
    return (
      <main className="min-h-screen p-4 md:p-8" style={{ minHeight: "100vh", padding: "1rem 2rem", background: "#0a1628", color: "#f1f5f9" }}>
        <header className="mb-8" style={{ marginBottom: "2rem" }}>
          <h1 className="text-2xl md:text-3xl font-bold text-ocean-text" style={{ fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 700, color: "#f1f5f9" }}>
            Deep Ocean Environmental Dashboard
          </h1>
          <p className="text-ocean-muted mt-1 text-sm md:text-base" style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            Marine research monitoring — live metrics and 30-day history
          </p>
        </header>
        <div className="flex items-center justify-center py-24 text-ocean-muted" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "6rem 0", color: "#94a3b8" }}>
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ocean-text">
              Deep Ocean Environmental Dashboard
            </h1>
            <p className="text-ocean-muted mt-1 text-sm md:text-base">
              Marine research monitoring — live metrics and 30-day history
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusIndicator isLive={isLive} viewDate={viewDate} />
            {!isLive && (
              <button
                type="button"
                onClick={handleBackToLive}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-ocean-cyan/40 bg-ocean-cyan/10 text-ocean-cyan hover:bg-ocean-cyan/20 focus:outline-none focus:ring-2 focus:ring-ocean-cyan/50 transition-colors"
                aria-label="Return to current live data"
              >
                Back to Live
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-6 flex-col xl:flex-row">
        <section className="flex-1 min-w-0 space-y-6">
          <MetricCards metrics={metrics} isLive={isLive} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DebrisComposition />
            </div>
            <div className="rounded-lg border border-ocean-cyan/30 bg-ocean-cyan/5 px-4 py-3 flex flex-col justify-center">
              <p className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-1">Health Status</p>
              <p className="text-ocean-text text-sm">
                0–100 <span className="text-emerald-400">Healthy</span> · 101–300 <span className="text-amber-400">Caution</span> · &gt;300 <span className="text-red-400">Critical</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-ocean-cyan/30 bg-ocean-cyan/5 px-4 py-2 text-center">
            <p className="text-ocean-muted text-sm">
              <strong className="text-ocean-cyan">Sync:</strong> Move the timeline to any day — all graphs and metrics update to that same moment. Compare temperature spikes, boat traffic, and dolphin mortality on the same date.
            </p>
          </div>

          <HistoricalMortalityChart
            data={historicalMortalityData}
            currentTemperatureF={latestReading?.temperatureF ?? metrics.waterTemp || undefined}
          />
          <TemperatureMortalityChart data={dailyDataset} />
          <BoatTrafficMortalityChart data={dailyDataset} />
          <DebrisMortalityChart data={debrisMortalityData} />

          <ScientistsInsight metrics={metrics} />

          <TimelineSlider
            value={sliderDragging ? timelineLiveValue : sliderValue}
            onChange={handleTimelineChange}
            onDragEnd={handleTimelineDragEnd}
            viewDate={viewDate}
            onSliderDrag={setSliderDragging}
          />
        </section>

        <aside className="xl:w-96 flex-shrink-0 flex flex-col min-h-[320px] xl:min-h-0 xl:h-[calc(100vh-8rem)]">
          <LiveObservationLog entries={logEntries} />
        </aside>
      </div>
    </main>
  );
}
