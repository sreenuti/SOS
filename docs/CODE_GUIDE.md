# Code Guide

## Purpose

This guide describes coding conventions, patterns, and how to add or change features in the SOS dashboard.

## Stack and Tooling

- **Next.js 14** (App Router), **React 18**, **TypeScript**
- **Tailwind CSS** for styling; **Recharts** for line charts
- **ESLint** with `eslint-config-next`
- Path alias: `@/*` → `./src/*` (use `@/components/...`, `@/lib/...`)

## Project Conventions

### File and folder structure

- **Components**: `src/components/` — one component per file; PascalCase file name (e.g. `BoatTrafficChart.tsx`).
- **App**: `src/app/` — `layout.tsx`, `page.tsx`, `globals.css`.
- **Shared logic / data**: `src/lib/` (e.g. `mockData.ts`).
- **Hooks**: `src/hooks/` (e.g. `useThrottle.ts`).
- **Static assets**: `public/` (e.g. `public/images/`). Reference in code as `/images/...`.

### TypeScript

- Use **strict** TypeScript; avoid `any`.
- Prefer **interfaces** for component props and data shapes (e.g. `TimeSeriesPoint`, `MetricsAtTime` in `mockData.ts`).
- Export types/interfaces that are used across files (e.g. from `@/lib/mockData`).

### React patterns

- **Functional components** only.
- **Client components** where needed: add `"use client"` at the top (e.g. pages that use `useState`, components that use hooks or browser APIs).
- Keep **state in the page** for shared UI state (`viewDate`, `sliderDragging`); pass props down to charts and slider.
- Use **useCallback** for handlers passed to children (e.g. `handleTimelineChange`, `handleBackToLive`) to avoid unnecessary re-renders.
- Use **useMemo** for derived data (e.g. `metrics`, `sliderValue`, `xAxisTicks`) when the computation or referential equality matters.

### Styling (Tailwind)

- Prefer **Tailwind utility classes**; avoid inline styles unless dynamic (e.g. StatusIndicator colors).
- **Theme**: Use the `ocean` palette from `tailwind.config.ts`: `ocean-bg`, `ocean-card`, `ocean-border`, `ocean-cyan`, `ocean-text`, `ocean-muted`, etc.
- **Glass cards**: Use the `.glass-card` class (from `globals.css`) for panels; opacity and blur are tuned so the background shows through.
- **Charts**: Recharts components use hex colors for series (e.g. `#06b6d4` temperature, `#ef4444` mortality, `#f59e0b` boat traffic) to keep contrast and semantics clear.

### Naming

- **Components**: PascalCase.
- **Props**: camelCase; destructure in the parameter list when there are more than one or two.
- **Handlers**: `handle*` (e.g. `handleTimelineChange`, `handleBackToLive`).
- **Data helpers**: descriptive names (e.g. `getMetricsAtTime`, `sliderValueToDate`, `getDayTicks`).

## Data and Types

- **TimeSeriesPoint**: One point in the time series (`time`, `temperature`, `dolphinMortality`, `boatTraffic`, `turbidity`, `debris`).
- **MetricsAtTime**: Snapshot for the metric cards (`boatTraffic`, `turbidity`, `waterTemp`, `marineDebris`).
- All time in **milliseconds** (e.g. `Date.getTime()`, `data[].time`). Slider range is [0, 1] and is converted via `sliderValueToDate` / `dateToSliderValue`.

## Adding a New Chart

1. Create a new component in `src/components/` (e.g. `WaterQualityChart.tsx`).
2. Props: `data: TimeSeriesPoint[]` and `viewDate: Date`.
3. Use Recharts `LineChart`; add a `ReferenceLine` at `x={viewDate.getTime()}` so it stays synced.
4. Use `getDayTicks(data)` (or the same pattern) for the X-axis so each day appears once.
5. In `page.tsx`, import the component and render it with the same `dataset` and `viewDate` as the other charts.

## Adding a New Metric

1. In `src/lib/mockData.ts`:
   - Add the field to `TimeSeriesPoint` and, if needed, to `MetricsAtTime`.
   - In `getMockTimeSeries()`, compute the new value per point.
   - In `getMetricsAtTime()`, include the new field (interpolate or take nearest).
2. In the UI: add a new card in `MetricCards.tsx` or a new axis/line in the appropriate chart, using the same `metrics` or `data`.

## Changing the Time Window

- In `src/lib/mockData.ts`, change **`RANGE_DAYS`** (e.g. to 14 or 30).
- Update copy in `TimelineSlider.tsx` and `page.tsx` (e.g. “7 days” → “14 days”) and in README/docs if needed.

## Chart X-Axis (One Label per Day)

- Charts use a **custom tick list** so each calendar day appears once: iterate the data and push `p.time` the first time the calendar date changes.
- Pass that array as **`ticks={xAxisTicks}`** and **`interval={0}`** on `XAxis` so all day labels show.
- Use **`type="number"`** and **`domain={["dataMin", "dataMax"]}`** so the scale matches the data.

## Background Image

- **UnderwaterBackground** uses Next.js `Image` with `src="/images/dolphin_background.png"` (file in `public/images/`).
- Opacity is controlled by Tailwind (e.g. `opacity-30`) on the image so the dashboard remains readable.
- The wrapper is `fixed inset-0 pointer-events-none z-0`; main content is in a `relative z-10` wrapper in the layout.

## Linting and Checks

- Run **`npm run lint`** before committing.
- Ensure new components and hooks follow the patterns above and that TypeScript builds cleanly (`npm run build`).
