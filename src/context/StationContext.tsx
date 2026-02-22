"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getNoaaStationId } from "@/lib/noaaService";
import { getStationById, getDefaultStationId, NOAA_STATIONS, type NoaaStation } from "@/lib/noaaStations";

export interface StationContextValue {
  /** Currently selected NOAA station ID (drives real-time data and Health Tax baseline). */
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  /** Resolved station or undefined if ID not in list. */
  selectedStation: NoaaStation | undefined;
  /** All stations for map and selector. */
  stations: NoaaStation[];
}

const StationContext = createContext<StationContextValue | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const envStation = getNoaaStationId();
  const defaultId = getStationById(envStation) ? envStation : getDefaultStationId(envStation);
  const [selectedStationId, setSelectedStationIdState] = useState(defaultId);

  const setSelectedStationId = useCallback((id: string) => {
    setSelectedStationIdState(String(id).trim());
  }, []);

  const selectedStation = getStationById(selectedStationId);

  const value = useMemo<StationContextValue>(
    () => ({
      selectedStationId,
      setSelectedStationId,
      selectedStation: selectedStation ?? undefined,
      stations: NOAA_STATIONS,
    }),
    [selectedStationId, setSelectedStationId, selectedStation]
  );

  return (
    <StationContext.Provider value={value}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation(): StationContextValue {
  const ctx = useContext(StationContext);
  const fallbackId = getDefaultStationId();
  const fallbackStation = getStationById(fallbackId);
  if (!ctx) {
    return {
      selectedStationId: fallbackId,
      setSelectedStationId: () => {},
      selectedStation: fallbackStation ?? undefined,
      stations: NOAA_STATIONS,
    };
  }
  return ctx;
}
