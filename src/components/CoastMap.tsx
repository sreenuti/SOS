"use client";

import { useMemo } from "react";
import { useStation } from "@/context/StationContext";

/** Continental USA: lon -125 to -66, lat 24 to 49. Maps (lon, lat) to SVG coords. */
const VIEW_WIDTH = 590;
const VIEW_HEIGHT = 250;
const LON_MIN = -125;
const LON_MAX = -66;
const LAT_MIN = 24;
const LAT_MAX = 49;

function lonLatToXY(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_HEIGHT;
  return { x, y };
}

/** Continental USA outline: [lon, lat] pairs tracing lower 48 (west coast → south → Gulf → Florida → east → north). */
const USA_BOUNDARY: [number, number][] = [
  [-124.8, 48.4],
  [-124.2, 46.9],
  [-124.0, 43.6],
  [-124.2, 41.4],
  [-124.0, 39.2],
  [-123.2, 37.2],
  [-122.0, 36.8],
  [-119.8, 34.8],
  [-118.4, 33.7],
  [-117.2, 32.5],
  [-117.0, 30.8],
  [-116.4, 28.9],
  [-114.2, 28.0],
  [-108.2, 31.4],
  [-106.5, 31.7],
  [-105.0, 31.7],
  [-103.0, 29.0],
  [-100.3, 28.0],
  [-97.4, 25.9],
  [-97.0, 26.2],
  [-96.9, 28.9],
  [-94.0, 29.3],
  [-91.2, 29.0],
  [-89.2, 29.0],
  [-87.5, 30.3],
  [-86.2, 30.4],
  [-84.9, 30.0],
  [-84.1, 29.7],
  [-83.0, 29.5],
  [-82.5, 28.8],
  [-82.2, 27.4],
  [-81.9, 26.5],
  [-81.7, 25.5],
  [-81.0, 24.9],
  [-80.4, 25.1],
  [-80.2, 26.0],
  [-80.0, 27.5],
  [-79.9, 29.2],
  [-79.8, 31.0],
  [-79.5, 32.5],
  [-79.0, 33.2],
  [-78.0, 33.9],
  [-77.5, 34.7],
  [-76.7, 35.5],
  [-75.9, 36.5],
  [-75.2, 37.5],
  [-74.7, 39.2],
  [-73.7, 40.7],
  [-72.9, 41.0],
  [-71.8, 41.3],
  [-70.6, 41.5],
  [-70.2, 41.6],
  [-69.9, 42.2],
  [-69.4, 43.2],
  [-67.9, 44.6],
  [-67.0, 45.0],
  [-67.0, 47.0],
  [-69.0, 47.0],
  [-71.0, 45.2],
  [-73.5, 45.0],
  [-76.0, 44.2],
  [-79.2, 43.2],
  [-82.4, 41.7],
  [-84.8, 41.7],
  [-87.6, 42.1],
  [-90.4, 43.0],
  [-92.8, 43.5],
  [-95.2, 43.5],
  [-97.2, 45.8],
  [-104.0, 49.0],
  [-116.0, 49.0],
  [-122.0, 48.9],
  [-124.8, 48.4],
];

function buildUsaPath(): string {
  const points = USA_BOUNDARY.map(([lon, lat]) => lonLatToXY(lon, lat));
  if (points.length < 2) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ") + " Z";
}

export default function CoastMap() {
  const { stations, selectedStationId, setSelectedStationId } = useStation();
  const usaPath = useMemo(() => buildUsaPath(), []);

  return (
    <div className="glass-card p-4 border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm overflow-hidden">
      <h3 className="text-ocean-cyan text-sm font-semibold uppercase tracking-wider mb-1">
        National SOS Marine Network
      </h3>
      <p className="text-ocean-muted text-xs mb-3">
        Click a pulse pin to load real-time data for that station.
      </p>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto min-h-[220px]"
        role="img"
        aria-label="U.S. map with NOAA station locations — select a station"
      >
        <defs>
          <linearGradient id="usaFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.78)" />
            <stop offset="100%" stopColor="rgba(30, 41, 59, 0.65)" />
          </linearGradient>
          <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Ocean / background */}
        <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="rgba(6, 182, 212, 0.08)" />
        {/* Continental USA */}
        <path
          d={usaPath}
          fill="url(#usaFill)"
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth="1.2"
        />
        {/* Pulse pins — all 5 stations */}
        {stations.map((station) => {
          const { x, y } = lonLatToXY(station.lon, station.lat);
          const isSelected = station.id === selectedStationId;
          return (
            <g
              key={station.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onClick={() => setSelectedStationId(station.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedStationId(station.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${station.name} (${station.zone}) — ${isSelected ? "selected" : "select"}`}
            >
              {/* Pulse ring: SVG animateTransform scales from (0,0) = pin center so it stays concentric */}
              <circle cx={0} cy={0} r={10} fill="none" stroke="#06b6d4" strokeWidth={1.5}>
                <animate
                  attributeName="opacity"
                  values="0.55;0.12;0.55"
                  keyTimes="0;0.5;1"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;2;1"
                  keyTimes="0;0.5;1"
                  dur="1.8s"
                  repeatCount="indefinite"
                  additive="replace"
                />
              </circle>
              <circle
                cx={0}
                cy={0}
                r={isSelected ? 7 : 5}
                fill={isSelected ? "#06b6d4" : "rgba(6, 182, 212, 0.9)"}
                stroke="#e2e8f0"
                strokeWidth={isSelected ? 2 : 1}
                filter="url(#pin-glow)"
              />
              <text
                x={0}
                y={22}
                textAnchor="middle"
                className="fill-current text-ocean-text"
                style={{ fontSize: 9, fontWeight: isSelected ? 700 : 500 }}
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
