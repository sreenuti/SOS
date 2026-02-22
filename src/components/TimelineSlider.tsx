"use client";

import { useRef } from "react";

interface TimelineSliderProps {
  value: number;
  onChange: (value: number) => void;
  onDragEnd?: (value: number) => void;
  viewDate: Date;
  onSliderDrag?: (dragging: boolean) => void;
}

function formatSliderLabel(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimelineSlider({
  value,
  onChange,
  onDragEnd,
  viewDate,
  onSliderDrag,
}: TimelineSliderProps) {
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    latestValueRef.current = v;
    onChange(v);
  };

  const handlePointerEnd = () => {
    onSliderDrag?.(false);
    onDragEnd?.(latestValueRef.current);
  };

  return (
    <div className="glass-card p-4 md:p-6 border border-ocean-border/60 bg-ocean-card/45 backdrop-blur-sm w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
          Historical Timeline (30 days)
        </span>
        <span className="text-ocean-cyan text-sm font-mono tabular-nums">
          {formatSliderLabel(viewDate)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.0001}
        value={value}
        onChange={handleChange}
        onMouseDown={() => onSliderDrag?.(true)}
        onTouchStart={() => onSliderDrag?.(true)}
        onMouseUp={handlePointerEnd}
        onTouchEnd={handlePointerEnd}
        aria-label="Scrub through last 30 days"
        className="w-full h-2 rounded-lg cursor-pointer border border-ocean-border/50 focus:outline-none focus:ring-2 focus:ring-ocean-cyan/50"
        style={{
          background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${value * 100}%, #0d2137 ${value * 100}%, #0d2137 100%)`,
        }}
      />
    </div>
  );
}
