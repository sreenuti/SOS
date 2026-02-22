# Code Guide

## Purpose

This guide describes coding conventions, patterns, and how to add or change features in the SOS dashboard.

## Stack and Tooling

- **Next.js 14** (App Router), **React 18**, **TypeScript**
- **Tailwind CSS** for styling; **Recharts** for line/composed charts (dual-axis)
- **ESLint** with `eslint-config-next`
- Path alias: `@/*` → `./src/*` (use `@/components/...`, `@/lib/...`)

## Project Conventions

### File and folder structure

- **Components**: `src/components/` — one component per file; PascalCase file name (e.g. `ModeController.tsx`, `ResearchCharts.tsx`).
- **App**: `src/app/` — `layout.tsx`, `page.tsx`, `globals.css`.
- **Shared logic / data**: `src/lib/` (e.g. `mockData.ts`, `researchModeData.ts`).
- **Hooks**: `src/hooks/` (e.g. `useNoaaTemperature.ts`, `useThrottle.ts`).
- **Context**: `src/context/` (e.g. `MarineDebrisContext.tsx`, `StationContext.tsx` for selected NOAA station).
- **Static assets**: `public/` (e.g. `public/images/`). Reference as `/images/...`.

### TypeScript

- Use **strict** TypeScript; avoid `any`.
- Prefer **interfaces** for component props and data shapes (e.g. `TimeSeriesPoint`, `MetricsAtTime`, `ResearchYearPoint`).
- Export types used across files (e.g. `DashboardMode` from `ModeController.tsx`).

### React patterns

- **Functional components** except where a class is required (e.g. `DashboardErrorBoundary`).
- **Client components**: add `"use client"` at the top for pages or components that use `useState`, hooks, or browser APIs.
- **State in the page**: Shared UI state (`viewDate`, `dashboardMode`, `researchSliderValue`, `sliderDragging`) lives in `page.tsx`; **selectedStationId** lives in `StationContext` and is set by CoastMap; pass props down.
- **useCallback** for handlers passed to children (e.g. `handleTimelineChange`, `handleBackToLive`, `setDashboardMode`).
- **useMemo** for derived data (e.g. `metrics`, `viewYear`, `researchData`, `dailyDataset`).

### Styling (Tailwind)

- Prefer **Tailwind utility classes**; use inline styles only when dynamic (e.g. chart colors, slider gradient).
- **Theme**: Use the `ocean` palette: `ocean-bg`, `ocean-card`, `ocean-border`, `ocean-cyan`, `ocean-text`, `ocean-muted`, etc.
- **Glass cards**: Use `.glass-card` (from `globals.css`) for panels; dark-blue glassmorphism so the background shows through.
- **Charts**: Recharts use hex colors for series (e.g. `#06b6d4`, `#f08080`, `#a78bfa`, `#34d399`) and shared tooltip styles (e.g. `rgba(13, 33, 55, 0.95)`).

### Naming

- **Components**: PascalCase.
- **Props**: camelCase; destructure when there are several.
- **Handlers**: `handle*` (e.g. `handleTimelineChange`, `handleBackToLive`).
- **Data helpers**: descriptive names (e.g. `getMetricsAtTime`, `getResearchYearSeries`, `sliderValueToDate`).

## Data and Types

- **TimeSeriesPoint** (`mockData.ts`): One point in the 30-day series (`time`, `temperature`, `dolphinMortality`, `boatTraffic`, `turbidity`, `debris`).
- **MetricsAtTime** (`mockData.ts`): Snapshot for metric cards (`boatTraffic`, `turbidity`, `waterTemp`, `marineDebris`).
- **ResearchYearPoint** (`researchModeData.ts`): One year in 2000–2026 (`year`, `temperatureF`, `survivalStrengthPct`, `entanglementDenominator`, `entanglementRiskPct`, `mortalityRiskPct`, `deathsMin`, `deathsMax`, `keyEvent`).
- **DashboardMode**: `"realtime"` | `"research"` (from `ModeController.tsx`).
- Time in **milliseconds** for real-time data; slider range [0, 1] maps to 30 days or to years 2000–2026 depending on mode.

## Adding a New Chart (Real-Time)

1. Create a component in `src/components/` (e.g. `MyChart.tsx`).
2. Props: `data: TimeSeriesPoint[]` (or `DebrisMortalityPoint[]`) and, if needed, `viewDate: Date`.
3. Use Recharts; add `ReferenceLine` at the view date if the chart is time-synced.
4. In `page.tsx`, inside the `dashboardMode === "realtime"` branch, import and render with `dailyDataset` (or the right series) and `viewDate`.

## Adding a New Chart (Research)

1. In `src/components/ResearchCharts.tsx`, add a new exported component (or create a new file) that accepts `data: ResearchYearPoint[]`.
2. X-axis: `dataKey="year"`; use dual Y-axis as needed (e.g. temp vs mortality).
3. In `page.tsx`, inside the `dashboardMode === "research"` branch, render the chart with `researchData`.

## Adding a New Metric (Real-Time)

1. In `src/lib/mockData.ts`: add the field to `TimeSeriesPoint` and `MetricsAtTime`, then update `getMockTimeSeries()` and `getMetricsAtTime()`.
2. In the UI: add a card in `MetricCards.tsx` or a new axis/line in the appropriate chart.

## Adding a Historical Marker (Research)

1. In `src/components/HistoricalMarkers.tsx`, add a constant (e.g. `MARKER_2013`) or a map of year → { title, description }.
2. In the render, when `viewYear === thatYear`, show the marker card.

## Changing the Time Window (Real-Time)

- In `src/lib/mockData.ts`, change **`RANGE_DAYS`** (e.g. 30).
- Update copy in `TimelineSlider.tsx` and `page.tsx` (“30 days”) and README/docs if needed.

## Environment variables (NOAA / station)

- **NEXT_PUBLIC_NOAA_STATION_ID** — Default station on load (e.g. `8771450`). See `src/lib/noaaService.ts`.
- **NEXT_PUBLIC_NOAA_API_URL** — NOAA CO-OPS datagetter base URL.
- **NEXT_PUBLIC_HISTORICAL_BASELINE_TEMP** — Fallback Health Tax baseline °F when a station has no `baselineTempF` (e.g. `85.2`).
- Stations and regional baselines are in `src/lib/noaaStations.ts`. Use `getStationById`, `getDefaultStationId`; add a new station there and in CoastMap pins if extending the network.

## Changing the Research Year Range

- In `src/app/page.tsx`, adjust **`RESEARCH_YEAR_MIN`** and **`RESEARCH_YEAR_MAX`**.
- In `src/components/TimelineSlider.tsx`, use the same constants for the step and label.
- In `src/lib/researchModeData.ts`, ensure the loop and any constants match (e.g. 2000–2026).

## Chart X-Axis and Dual-Axis

- **Real-time**: Often one label per day; use `dayLabel` or similar from aggregated data; `interval={2}` to avoid crowding.
- **Research**: `dataKey="year"`; `interval={2}` for readability.
- **Dual-axis**: Use Recharts `ComposedChart` with two `YAxis` (`yAxisId`, `orientation="left"` / `"right"`); assign each `Line`/`Bar` to the correct `yAxisId`.

## Background and Theme

- **UnderwaterBackground**: Next.js `Image` with `src="/images/dolphin_background.png"` in `public/images/`. Opacity via Tailwind; wrapper is `fixed inset-0 pointer-events-none z-0`.
- **Error boundary**: `DashboardErrorBoundary` in `layout.tsx` wraps `{children}` so render errors show a message and “Try again.”

## Linting and Checks

- Run **`npm run lint`** before committing.
- Run **`npm run build`** to ensure TypeScript and the app build cleanly.
- New components and hooks should follow the patterns above and use the shared types and theme.
