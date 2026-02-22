"use client";

import { useCallback, useEffect, useState } from "react";

export interface NoaaTemperatureReading {
  /** Water temperature in °F */
  temperatureF: number;
  /** When the reading was received (ISO string or timestamp) */
  timestamp: number;
  /** Optional station or source id for display */
  sourceId?: string;
}

const POLL_MS = 60 * 1000; // 1 minute – adjust when wiring real NOAA API

/**
 * Hook for live water temperature from NOAA (or mock).
 * When you connect a real NOAA API, replace the fetch logic here;
 * the chart will live-update whenever setReadings is called or readings change.
 */
export function useNoaaTemperature() {
  const [readings, setReadings] = useState<NoaaTemperatureReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with real NOAA API call, e.g.:
      // const res = await fetch('https://api tidesandcurrents.noaa.gov/...');
      // const data = await res.json();
      // setReadings(prev => [...prev.slice(-99), { temperatureF: data.temp, timestamp: Date.now() }]);

      // Mock: simulate a new reading (e.g. from your existing dashboard temp)
      const mockTemp = 76 + Math.random() * 6;
      const reading: NoaaTemperatureReading = {
        temperatureF: Math.round(mockTemp * 10) / 10,
        timestamp: Date.now(),
        sourceId: "mock",
      };
      setReadings((prev) => [...prev.slice(-99), reading]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch temperature");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    const id = setInterval(fetchLatest, POLL_MS);
    return () => clearInterval(id);
  }, [fetchLatest]);

  /** Latest single reading (for reference line or "current temp" label). */
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return {
    readings,
    latestReading,
    loading,
    error,
    refetch: fetchLatest,
    /** Allow parent to push a new reading (e.g. from another NOAA or dashboard source). */
    pushReading: useCallback((r: NoaaTemperatureReading) => {
      setReadings((prev) => [...prev.slice(-99), r]);
    }, []),
  };
}
