"use client";

import { useCallback, useRef } from "react";

const THROTTLE_MS = 32; // ~30fps for heavy updates

/**
 * Returns a throttled version of the callback. Used so slider thumb can
 * update immediately (local state) while parent state updates at limited rate.
 */
export function useThrottledCallback<T extends (arg: number) => void>(
  callback: T,
  ms: number = THROTTLE_MS
): T {
  const lastRun = useRef(0);
  const pending = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  return useCallback(
    ((value: number) => {
      const now = Date.now();
      pending.current = value;
      if (now - lastRun.current >= ms) {
        lastRun.current = now;
        pending.current = null;
        callback(value);
      } else if (raf.current === null) {
        raf.current = requestAnimationFrame(() => {
          raf.current = null;
          if (pending.current !== null) {
            lastRun.current = Date.now();
            const v = pending.current;
            pending.current = null;
            callback(v);
          }
        });
      }
    }) as T,
    [callback, ms]
  );
}
