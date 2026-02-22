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
  const [timelineLiveValue, setTimelineLiveValue] = useState(0);
  const timelineThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimelineUpdate = useRef(0);
  const pendingTimeline = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || dataset.length === 0) return;
    setViewDate(new Date());
  }, [mounted, dataset.length]);

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

        <DualAxisChart data={dataset} viewDate={viewDate} />

        <TimelineSlider
          value={sliderDragging ? timelineLiveValue : sliderValue}
          onChange={handleTimelineChange}
          onDragEnd={handleTimelineDragEnd}
          viewDate={viewDate}
          onSliderDrag={setSliderDragging}
        />
      </section>
    </main>
  );
}
