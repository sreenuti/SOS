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
import ModeController, { type DashboardMode } from "@/components/ModeController";
import HistoricalMarkers from "@/components/HistoricalMarkers";
import RecordHighAlert from "@/components/RecordHighAlert";
import {
  ResearchHealthTaxChart,
  ResearchEntanglementMortalityChart,
  ResearchTemperatureMortalityChart,
} from "@/components/ResearchCharts";
import { getSurvivalScore, getHistoricalBaselineTempF } from "@/lib/survivalScore";
import {
  getResearchYearSeries,
  MORTALITY_RISK_THRESHOLD_2026_PCT,
} from "@/lib/researchModeData";
import type { MetricsAtTime } from "@/lib/mockData";
import {
  getMockTimeSeries,
  getDailyAggregatedSeries,
  getDebrisMortalitySeries7Days,
  getMetricsAtTime,
  sliderValueToDate,
  dateToSliderValue,
  DEBRIS_MT_CEILING_2026,
  VESSELS_MONTHLY_CEILING_2026,
  ENTANGLEMENT_DENOMINATOR_2026,
} from "@/lib/mockData";
import {
  getNewObservationEntries,
  type ObservationLogEntry,
} from "@/lib/observationLog";
import LiveObservationLog from "@/components/LiveObservationLog";
import ScientificSummaryCard from "@/components/ScientificSummaryCard";
import DashboardLoadingWidget from "@/components/DashboardLoadingWidget";
import {
  fetchLiveOceanData,
  chartDataTimeMs,
  type ChartData,
} from "@/lib/fetchLiveOceanData";
import { useStation } from "@/context/StationContext";
import type { TimeSeriesPoint } from "@/lib/mockData";
import CoastMap from "@/components/CoastMap";

const RESEARCH_YEAR_MIN = 2000;
const RESEARCH_YEAR_MAX = 2026;

const SLIDER_THROTTLE_MS = 40;

const TICK_MS = 3000; // live update every 3 seconds
const ADVANCE_MS = 3 * 60 * 1000; // advance view by 3 minutes each tick
const LIVE_OCEAN_POLL_MS = 10 * 60 * 1000; // real-time NOAA refresh every 10 minutes
const LIVE_TEMP_MATCH_MS = 15 * 60 * 1000; // use live temp if within 15 min of point

export default function DashboardPage() {
  const { selectedStationId, selectedStation } = useStation();
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [sliderDragging, setSliderDragging] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("realtime");
  const [researchSliderValue, setResearchSliderValue] = useState(0.5); // ~2013

  const dataset = useMemo(() => (mounted ? getMockTimeSeries() : []), [mounted]);
  const researchData = useMemo(() => (mounted ? getResearchYearSeries(selectedStationId) : []), [mounted, selectedStationId]);

  /** Live ocean temperature from NOAA; cached across tab switches; refreshed every 10 min in Real-Time mode. */
  const [liveOceanData, setLiveOceanData] = useState<ChartData[]>([]);
  const [isLoadingLiveOcean, setIsLoadingLiveOcean] = useState(false);
  const liveOceanDataRef = useRef<ChartData[]>([]);
  const lastLiveOceanFetchAtRef = useRef<number>(0);
  liveOceanDataRef.current = liveOceanData;

  /** Merged series (mock + live NOAA temps) and daily aggregated series in one pass to avoid TDZ. */
  const { mergedDataset, dailyDataset } = useMemo(() => {
    const base = dataset;
    if (!mounted || !base.length) {
      return { mergedDataset: base, dailyDataset: getDailyAggregatedSeries(base) };
    }
    if (!liveOceanData.length) {
      return { mergedDataset: base, dailyDataset: getDailyAggregatedSeries(base) };
    }
    const merged: TimeSeriesPoint[] = base.map((p) => {
      let bestTemp: number | null = null;
      let bestDiff = Infinity;
      for (const live of liveOceanData) {
        const liveMs = chartDataTimeMs(live);
        const diff = Math.abs(p.time - liveMs);
        if (diff < bestDiff && diff <= LIVE_TEMP_MATCH_MS) {
          bestDiff = diff;
          bestTemp = live.temperature;
        }
      }
      return bestTemp !== null ? { ...p, temperature: bestTemp } : p;
    });
    return {
      mergedDataset: merged,
      dailyDataset: getDailyAggregatedSeries(merged),
    };
  }, [mounted, dataset, liveOceanData]);
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

  // Client-only mount: ensures we're past hydration so state updates don't get stuck
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setMounted(true);
      setViewDate(new Date());
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Fallback: if still loading after 2s (e.g. effect blocked), force show dashboard so errors surface
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted((m) => m || true);
      setViewDate((d) => d || new Date());
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  // When station changes, clear cache so new station data is fetched
  const prevStationRef = useRef(selectedStationId);
  useEffect(() => {
    if (prevStationRef.current !== selectedStationId) {
      setLiveOceanData([]);
      lastLiveOceanFetchAtRef.current = 0;
      prevStationRef.current = selectedStationId;
    }
  }, [selectedStationId]);

  // Real-Time mode: fetch live ocean data for selected station; cache per tab switch (skip refetch if cache < 10 min old)
  useEffect(() => {
    if (dashboardMode !== "realtime" || !mounted) return;
    const now = Date.now();
    const cacheFresh = liveOceanDataRef.current.length > 0 && now - lastLiveOceanFetchAtRef.current < LIVE_OCEAN_POLL_MS;

    const refresh = () => {
      setIsLoadingLiveOcean(true);
      fetchLiveOceanData(liveOceanDataRef.current, selectedStationId)
        .then((data) => {
          setLiveOceanData(data);
          lastLiveOceanFetchAtRef.current = Date.now();
        })
        .finally(() => setIsLoadingLiveOcean(false));
    };

    if (!cacheFresh) refresh();
    const id = setInterval(refresh, LIVE_OCEAN_POLL_MS);
    return () => clearInterval(id);
  }, [dashboardMode, mounted, selectedStationId]);

  const metrics = useMemo(
    () =>
      viewDate && mergedDataset.length > 0
        ? getMetricsAtTime(mergedDataset, viewDate)
        : { boatTraffic: 0, turbidity: 0, waterTemp: 0, marineDebris: 0 },
    [mergedDataset, viewDate]
  );

  /** LIVE when viewing "now" (within 2 min); HISTORICAL when scrubbing the past */
  const isLive = useMemo(() => {
    if (!viewDate) return false;
    const now = Date.now();
    const diff = now - viewDate.getTime();
    return diff >= 0 && diff < 2 * 60 * 1000;
  }, [viewDate]);

  /** Research mode: slider 0–1 maps to year 2000–2026 */
  const viewYear = useMemo(
    () => RESEARCH_YEAR_MIN + Math.round(researchSliderValue * (RESEARCH_YEAR_MAX - RESEARCH_YEAR_MIN)),
    [researchSliderValue]
  );

  /** Latest live temp from NOAA feed, or hook/metrics fallback. */
  const latestLiveTemp =
    liveOceanData.length > 0 ? liveOceanData[liveOceanData.length - 1].temperature : null;
  /** Current mortality risk % from temp (for Record High alert). 100 - survivalScore. */
  const currentTempForAlert =
    (latestLiveTemp ?? latestReading?.temperatureF ?? metrics.waterTemp) || 0;
  const baselineTempF = getHistoricalBaselineTempF(selectedStationId);
  const liveMortalityRiskPct = currentTempForAlert >= baselineTempF ? 100 - getSurvivalScore(currentTempForAlert, selectedStationId) : 0;

  const { setMarineDebris } = useMarineDebris();
  useEffect(() => {
    setMarineDebris(metrics.marineDebris);
  }, [metrics.marineDebris, setMarineDebris]);

  // Append Live Observation Log entries when metrics transition into Red/Yellow (and High Traffic when Live & >15)
  useEffect(() => {
    if (!viewDate) return;
    const prev = prevMetricsRef.current;
    const newEntries = getNewObservationEntries(metrics, viewDate, prev, isLive, selectedStationId);
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

  // Live advance every 3s when timeline not being dragged (real-time mode only)
  useEffect(() => {
    if (dashboardMode !== "realtime" || !viewDate || sliderDragging) return;
    const id = setInterval(() => {
      setViewDate((prev) => {
        if (!prev) return prev;
        const next = new Date(prev.getTime() + ADVANCE_MS);
        const now = new Date();
        return next > now ? now : next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dashboardMode, viewDate, sliderDragging]);

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
              {dashboardMode === "realtime"
                ? "National SOS Marine Network — live metrics and 30-day history"
                : "Dolphin Research Charts — 2000–2026 analysis (regional projections)"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ModeController mode={dashboardMode} onModeChange={setDashboardMode} />
            {dashboardMode === "realtime" && (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-6 flex-col xl:flex-row">
        <section className="flex-1 min-w-0 space-y-6">
          {dashboardMode === "realtime" && (
            <>
              {isLoadingLiveOcean && liveOceanData.length === 0 ? (
                <div className="space-y-6">
                  <DashboardLoadingWidget fullPage label="Loading live data and charts…" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60 pointer-events-none">
                    <div className="h-[120px] rounded-lg bg-ocean-card/40 border border-ocean-border/40 animate-pulse" />
                    <div className="h-[120px] rounded-lg bg-ocean-card/40 border border-ocean-border/40 animate-pulse" />
                    <div className="h-[120px] rounded-lg bg-ocean-card/40 border border-ocean-border/40 animate-pulse" />
                    <div className="h-[120px] rounded-lg bg-ocean-card/40 border border-ocean-border/40 animate-pulse" />
                  </div>
                  <div className="h-[320px] rounded-lg bg-ocean-card/20 border border-ocean-border/40 animate-pulse" />
                </div>
              ) : (
                <>
                  {isLoadingLiveOcean && liveOceanData.length > 0 && (
                    <div className="flex justify-end">
                      <DashboardLoadingWidget fullPage={false} label="Updating…" />
                    </div>
                  )}
                  {liveMortalityRiskPct >= MORTALITY_RISK_THRESHOLD_2026_PCT && (
                    <RecordHighAlert
                      mortalityRiskPct={liveMortalityRiskPct}
                      thresholdPct={MORTALITY_RISK_THRESHOLD_2026_PCT}
                    />
                  )}
                  <MetricCards
                metrics={metrics}
                isLive={isLive}
                stationLabel={selectedStation ? `${selectedStation.name} (${selectedStationId})` : `Station ${selectedStationId}`}
                stationId={selectedStationId}
              />

              <CoastMap />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <DebrisComposition />
                </div>
                <div className="space-y-3">
                  <ScientificSummaryCard />
                  <div className="rounded-lg border border-ocean-cyan/30 bg-ocean-cyan/5 px-4 py-3 flex flex-col justify-center">
                    <p className="text-ocean-muted text-sm font-medium uppercase tracking-wider mb-1">Health Status</p>
                    <p className="text-ocean-text text-sm">
                      0–100 <span className="text-emerald-400">Healthy</span> · 101–300 <span className="text-amber-400">Caution</span> · &gt;300 <span className="text-red-400">Critical</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-ocean-cyan/30 bg-ocean-cyan/5 px-4 py-2 text-center space-y-1">
                <p className="text-ocean-muted text-sm">
                  <strong className="text-ocean-cyan">Sync:</strong> Move the timeline to any day — all graphs and metrics update to that same moment. Water Temp & Turbidity from {selectedStation ? selectedStation.name : `Station ${selectedStationId}`} (NOAA/USGS).
                </p>
                <p className="text-ocean-muted text-sm">
                  <strong className="text-ocean-cyan">2026 projection:</strong> Marine debris ceiling {DEBRIS_MT_CEILING_2026} MT · Vessel ceiling {VESSELS_MONTHLY_CEILING_2026.toLocaleString()}/month (daily flux ±5% by peak hours). Entanglement probability locked at <strong className="text-ocean-text">1 in {ENTANGLEMENT_DENOMINATOR_2026} sightings</strong> (researched).
                </p>
              </div>

              <HistoricalMortalityChart
                data={historicalMortalityData}
                currentTemperatureF={(latestLiveTemp ?? latestReading?.temperatureF ?? metrics.waterTemp) || undefined}
              />
              <TemperatureMortalityChart data={dailyDataset} />
              <BoatTrafficMortalityChart data={dailyDataset} />
              <DebrisMortalityChart data={debrisMortalityData} />

              <ScientistsInsight metrics={metrics} />

              <TimelineSlider
                mode="realtime"
                value={sliderDragging ? timelineLiveValue : sliderValue}
                onChange={handleTimelineChange}
                onDragEnd={handleTimelineDragEnd}
                viewDate={viewDate}
                onSliderDrag={setSliderDragging}
              />
                </>
              )}
            </>
          )}

          {dashboardMode === "research" && (
            <>
              <HistoricalMarkers viewYear={viewYear} />
              <div className="rounded-lg border border-ocean-cyan/30 bg-ocean-cyan/5 px-4 py-2 text-center space-y-1">
                <p className="text-ocean-muted text-sm">
                  <strong className="text-ocean-cyan">Historical Markers:</strong> Scrub the timeline to a year to see key events. Data from Dolphin Research Charts (2000–2026).
                </p>
                <p className="text-ocean-muted text-sm">
                  <strong className="text-ocean-cyan">Regional projections:</strong> Health Tax and survival strength use the baseline for the selected station ({selectedStation?.zone ?? "selected zone"}).
                </p>
              </div>
              <ResearchHealthTaxChart data={researchData} />
              <ResearchEntanglementMortalityChart data={researchData} />
              <ResearchTemperatureMortalityChart data={researchData} />
              <TimelineSlider
                mode="research"
                value={researchSliderValue}
                onChange={setResearchSliderValue}
                onDragEnd={(v) => setResearchSliderValue(v)}
                viewDate={new Date(viewYear, 6, 1)}
                viewYear={viewYear}
              />
            </>
          )}
        </section>

        {dashboardMode === "realtime" && (
          <aside className="xl:w-96 flex-shrink-0 flex flex-col min-h-[320px] xl:min-h-0 xl:h-[calc(100vh-8rem)]">
            <LiveObservationLog entries={logEntries} />
          </aside>
        )}
      </div>
    </main>
  );
}
