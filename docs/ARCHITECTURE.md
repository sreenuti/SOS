# Architecture

## Overview

The dashboard is a **single-page app** built with Next.js App Router. One **view date** drives all visualizations; the **timeline slider** is the single source of truth for “current moment” in the 30-day window.

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Page (page.tsx)                                                 │
│  • viewDate state                                                │
│  • dataset = getMockTimeSeries() (30 days, 15-min points)         │
│  • metrics = getMetricsAtTime(dataset, viewDate)                 │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ MetricCards  │    │ DualAxisChart     │    │ BoatTrafficChart    │
│ (metrics)    │    │ (data, viewDate) │    │ (data, viewDate)    │
└──────────────┘    └──────────────────┘    └─────────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ TimelineSlider     │
                    │ value ↔ viewDate  │
                    │ onChange → setViewDate
                    └───────────────────┘
```

- **viewDate**: The single moment in time the dashboard is “showing.” All charts draw a vertical reference line at this time; metric cards show values interpolated at this time.
- **Slider**: Maps [0, 1] to [30 days ago, now]. Moving the slider updates `viewDate`; nothing else owns “current time” for the UI.
- **Sync**: Because every component receives the same `viewDate` (and same `data`), moving the slider once updates every chart and card to that same day/time.

## Core Concepts

### 1. Single Source of Truth: `viewDate`

- Lived in **page.tsx** as `useState<Date | null>`.
- Initialized to “now” when the app mounts and data is ready.
- Updated by:
  - **TimelineSlider** — user drags or clicks.
  - **Back to Live** — resets to `new Date()`.
  - **Live tick** — when not dragging, every 3s the view can advance by 3 minutes (optional “live” behavior).

### 2. Data Layer (`src/lib/mockData.ts`)

- **getMockTimeSeries()**: Returns a deterministic time series for the last `RANGE_DAYS` (7) at 15-minute intervals. Each point has: `time`, `temperature`, `dolphinMortality`, `boatTraffic`, `turbidity`, `debris`.
- **getMetricsAtTime(dataset, viewDate)**: Interpolates or clamps to the nearest point and returns `{ boatTraffic, turbidity, waterTemp, marineDebris }` for the metric cards.
- **sliderValueToDate(value)** / **dateToSliderValue(date)**: Map between slider [0, 1] and a `Date` in the 30-day window.

Data is **mock** and deterministic (seeded by time) so the science-fair story (e.g. boat traffic ↔ dolphin mortality) is visible without a backend.

### 3. Component Roles

| Component | Responsibility |
|-----------|----------------|
| **page.tsx** | Holds `viewDate`, `dataset`, `metrics`; wires slider handlers and Back to Live; renders layout and sync banner. |
| **MetricCards** | Displays current metrics (boat traffic, water quality card, marine debris). |
| **DualAxisChart** | Temperature (left axis) + Dolphin mortality (right axis); reference line at `viewDate`. |
| **BoatTrafficChart** | Boat traffic (left) + Dolphin mortality (right); reference line at `viewDate`. |
| **TimelineSlider** | Range input [0, 1]; shows formatted `viewDate`; reports onChange/onDragEnd. |
| **StatusIndicator** | LIVE vs HISTORICAL and the current viewing date. |
| **UnderwaterBackground** | Full-viewport background image; fixed, non-interactive, behind content. |

### 4. Throttling and Slider UX

- Slider updates at 15-min resolution in data; the UI throttles `viewDate` updates (e.g. ~40 ms) so dragging doesn’t flood state.
- **timelineLiveValue** keeps the thumb position responsive while dragging; on release, `viewDate` is set from the final value so charts and cards stay in sync.

## UI Layers (z-index)

1. **z-0**: `UnderwaterBackground` (fixed, full viewport).
2. **z-10**: Main content wrapper (cards, charts, slider).

So the dolphin background sits behind all interactive content.

## File Map

- **App**: `src/app/layout.tsx`, `page.tsx`, `globals.css`.
- **Charts**: `src/components/DualAxisChart.tsx`, `BoatTrafficChart.tsx` (Recharts, one tick per day on X-axis).
- **Data**: `src/lib/mockData.ts` (types, time series, metrics, slider↔date).
- **Theme**: `tailwind.config.ts` (ocean colors), `globals.css` (glass-card, animations).

## Extending the System

- **New metric**: Add field to `TimeSeriesPoint` and `MetricsAtTime`, update `getMockTimeSeries` and `getMetricsAtTime`, then add a card or axis in the right component.
- **New chart**: New component that accepts `data: TimeSeriesPoint[]` and `viewDate: Date`; add to `page.tsx` and pass the same props; it will be synced automatically.
- **Real API**: Replace `getMockTimeSeries()` with a fetch/API call; keep `getMetricsAtTime`, `sliderValueToDate`, and `dateToSliderValue` so the rest of the app stays unchanged.
