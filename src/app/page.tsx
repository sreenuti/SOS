"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MetricCards from "@/components/MetricCards";
import DualAxisChart from "@/components/DualAxisChart";
import TimelineSlider from "@/components/TimelineSlider";
import StatusIndicator from "@/components/StatusIndicator";
import {
  getMockTimeSeries,
  getMetricsAtTime,
  sliderValueToDate,
  dateToSliderValue,
} from "@/lib/mockData";

const SLIDER_THROTTLE_MS = 40;

const TICK_MS = 3000; // live update every 3 seconds
const ADVANCE_MS = 3 * 60 * 1000; // advance view by 3 minutes each tick

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [sliderDragging, setSliderDragging] = useState(false);

  const dataset = useMemo(() => (mounted ? getMockTimeSeries() : []), [mounted]);
  const maxTimeIndex = Math.max(0, dataset.length - 1);
  const [timeIndex, setTimeIndex] = useState(0);
  const [timelineLiveValue, setTimelineLiveValue] = useState(0);
  const [chartRangeDragging, setChartRangeDragging] = useState(false);
  const [chartRangeLiveValue, setChartRangeLiveValue] = useState(0);
  const timelineThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chartRangeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimelineUpdate = useRef(0);
  const lastChartRangeUpdate = useRef(0);
  const pendingTimeline = useRef<number | null>(null);
  const pendingChartRange = useRef<number | null>(null);
  const chartRangeLatestRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || dataset.length === 0) return;
    const now = new Date();
    setViewDate(now);
    setTimeIndex(dataset.length - 1);
  }, [mounted, dataset.length]);

  const chartData = useMemo(
    () => dataset.slice(0, timeIndex + 1),
    [dataset, timeIndex]
  );

  const metrics = useMemo(
    () =>
      viewDate && dataset.length > 0
        ? getMetricsAtTime(dataset, viewDate)
        : { boatTraffic: 0, turbidity: 0, waterTemp: 0, marineDebris: 0 },
    [dataset, viewDate]
  );

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

  const handleChartRangeChange = useCallback((value: number) => {
    chartRangeLatestRef.current = value;
    setChartRangeLiveValue(value);
    const now = Date.now();
    if (now - lastChartRangeUpdate.current >= SLIDER_THROTTLE_MS) {
      lastChartRangeUpdate.current = now;
      setTimeIndex(value);
      pendingChartRange.current = null;
    } else {
      pendingChartRange.current = value;
      if (chartRangeThrottleRef.current === null) {
        chartRangeThrottleRef.current = setTimeout(() => {
          chartRangeThrottleRef.current = null;
          if (pendingChartRange.current !== null) {
            const v = pendingChartRange.current;
            pendingChartRange.current = null;
            lastChartRangeUpdate.current = Date.now();
            setTimeIndex(v);
          }
        }, SLIDER_THROTTLE_MS);
      }
    }
  }, []);

  const handleChartRangeDragEnd = useCallback((value: number) => {
    setTimeIndex(value);
    pendingChartRange.current = null;
    if (chartRangeThrottleRef.current !== null) {
      clearTimeout(chartRangeThrottleRef.current);
      chartRangeThrottleRef.current = null;
    }
  }, []);

  const isRealtime = timeIndex === maxTimeIndex;

  /** LIVE when viewing "now" (within 2 min); HISTORICAL when scrubbing the past */
  const isLive = useMemo(() => {
    if (!viewDate) return false;
    const now = Date.now();
    const diff = now - viewDate.getTime();
    return diff >= 0 && diff < 2 * 60 * 1000;
  }, [viewDate]);

  // Keep timeline live value in sync: when not dragging use viewDate; when drag starts use current slider value
  useEffect(() => {
    if (!sliderDragging && viewDate) {
      setTimelineLiveValue(dateToSliderValue(viewDate));
    }
  }, [sliderDragging, viewDate]);

  // Live advance every 3s only when timeline not being dragged AND chart range at max (real-time)
  useEffect(() => {
    if (!viewDate || sliderDragging || !isRealtime) return;
    const id = setInterval(() => {
      setViewDate((prev) => {
        if (!prev) return prev;
        const next = new Date(prev.getTime() + ADVANCE_MS);
        const now = new Date();
        return next > now ? now : next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [viewDate, sliderDragging, isRealtime]);

  if (!mounted || !viewDate) {
    return (
      <main className="min-h-screen bg-ocean-bg p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-ocean-text">
            Deep Ocean Environmental Dashboard
          </h1>
          <p className="text-ocean-muted mt-1 text-sm md:text-base">
            Marine research monitoring — live metrics and 30-day history
          </p>
        </header>
        <div className="flex items-center justify-center py-24 text-ocean-muted">
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ocean-bg p-4 md:p-8">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ocean-text">
              Deep Ocean Environmental Dashboard
            </h1>
            <p className="text-ocean-muted mt-1 text-sm md:text-base">
              Marine research monitoring — live metrics and 30-day history
            </p>
          </div>
          <StatusIndicator isLive={isLive} viewDate={viewDate} />
        </div>
      </header>

      <section className="space-y-6">
        <MetricCards metrics={metrics} />

        <DualAxisChart data={chartData} viewDate={viewDate} />

        <TimelineSlider
          value={sliderDragging ? timelineLiveValue : sliderValue}
          onChange={handleTimelineChange}
          onDragEnd={handleTimelineDragEnd}
          viewDate={viewDate}
          onSliderDrag={setSliderDragging}
        />

        <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/80 backdrop-blur-md w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
              Chart range (data from start to time index)
            </span>
            <span className="text-ocean-cyan text-sm font-mono tabular-nums">
              {timeIndex + 1} / {dataset.length}
              {isRealtime && " · Real-time"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxTimeIndex}
            step={1}
            value={chartRangeDragging ? chartRangeLiveValue : timeIndex}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              handleChartRangeChange(v);
            }}
            onMouseDown={() => {
              setChartRangeDragging(true);
              setChartRangeLiveValue(timeIndex);
            }}
            onMouseUp={() => {
              setChartRangeDragging(false);
              handleChartRangeDragEnd(chartRangeLatestRef.current);
            }}
            onTouchStart={() => {
              setChartRangeDragging(true);
              setChartRangeLiveValue(timeIndex);
              chartRangeLatestRef.current = timeIndex;
            }}
            onTouchEnd={() => {
              setChartRangeDragging(false);
              handleChartRangeDragEnd(chartRangeLatestRef.current);
            }}
            aria-label="Chart display range from start to time index"
            className="w-full h-2 rounded-lg cursor-pointer border border-ocean-border/50 focus:outline-none focus:ring-2 focus:ring-ocean-cyan/50"
            style={{
              background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${maxTimeIndex ? ((chartRangeDragging ? chartRangeLiveValue : timeIndex) / maxTimeIndex) * 100 : 0}%, #0d2137 ${maxTimeIndex ? ((chartRangeDragging ? chartRangeLiveValue : timeIndex) / maxTimeIndex) * 100 : 0}%, #0d2137 100%)`,
            }}
          />
        </div>
      </section>
    </main>
  );
}
