"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Marine debris density (50–500 items/km²) from dashboard metrics; drives 3D background debris. 0 = no data. */
export interface MarineDebrisContextValue {
  marineDebris: number;
  setMarineDebris: (value: number) => void;
}

const MarineDebrisContext = createContext<MarineDebrisContextValue | null>(
  null
);

export function MarineDebrisProvider({ children }: { children: ReactNode }) {
  const [marineDebris, setMarineDebrisState] = useState(0);
  const setMarineDebris = useCallback((value: number) => {
    setMarineDebrisState(Math.max(0, Math.min(500, value)));
  }, []);

  const value = useMemo<MarineDebrisContextValue>(
    () => ({ marineDebris, setMarineDebris }),
    [marineDebris, setMarineDebris]
  );

  return (
    <MarineDebrisContext.Provider value={value}>
      {children}
    </MarineDebrisContext.Provider>
  );
}

export function useMarineDebris(): MarineDebrisContextValue {
  const ctx = useContext(MarineDebrisContext);
  if (!ctx) {
    return {
      marineDebris: 0,
      setMarineDebris: () => {},
    };
  }
  return ctx;
}
