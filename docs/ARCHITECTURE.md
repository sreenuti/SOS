# Architecture

## Overview

The dashboard is a **single-page app** built with Next.js App Router. It has two **modes**:

1. **Real-Time Monitoring** — One **view date** drives all visualizations over a **30-day** window; the timeline slider is the single source of truth. Data is mock (or NOAA/USGS-style); Water Temp & Turbidity are labeled for **Galveston Station 8771450**.
2. **Research History Mode** — A **view year** (2000–2026) drives research charts and historical markers. Data comes from **Dolphin Research Charts Data Analysis** (health tax, entanglement risk, mortality by year).

## High-Level Data Flow

### Real-Time Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Page (page.tsx)                                                          │
│  • dashboardMode = "realtime"                                             │
│  • viewDate state                                                         │
│  • dataset = getMockTimeSeries() (30 days, 15-min points)                 │
│  • metrics = getMetricsAtTime(dataset, viewDate)                           │
│  • latestReading from useNoaaTemperature()                                │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐
│ MetricCards  │    │ Charts            │    │ TimelineSlider              │
│ (metrics,    │    │ (dailyDataset,    │    │ mode="realtime"             │
│  stationLabel)│   │  debrisMortality, │    │ value ↔ viewDate (30 days)  │
└──────────────┘    │  historical…)     │    └─────────────────────────────┘
                    └──────────────────┘
```

- **viewDate**: The moment in time the dashboard is “showing.” All real-time charts and metric cards use this.
- **Slider**: In real-time mode, [0, 1] maps to [30 days ago, now]. Moving the slider updates `viewDate`.
- **Record High alert**: When mortality risk from current temp ≥ 5.90% (2026 threshold), `RecordHighAlert` is shown.

### Research Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Page (page.tsx)                                                          │
│  • dashboardMode = "research"                                             │
│  • researchSliderValue ∈ [0, 1]                                           │
│  • viewYear = 2000 + round(researchSliderValue * 26)                      │
│  • researchData = getResearchYearSeries() (2000–2026)                     │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌────────────────────┐    ┌──────────────────────────────────────────────┐
│ ResearchCharts      │    │ TimelineSlider                                │
│ (Health Tax,        │    │ mode="research"                              │
│  Entanglement,      │    │ value = researchSliderValue → viewYear       │
│  Temp/Mortality)    │    └──────────────────────────────────────────────┘
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ HistoricalMarkers  │  When viewYear === 2013 → "The Exodus" popup
└────────────────────┘
```

- **viewYear**: The selected year (2000–2026). Research charts and markers use this.
- **Slider**: In research mode, [0, 1] maps to years 2000–2026; step is per year.

## Core Concepts

### 1. Mode: `dashboardMode`

- Lived in **page.tsx** as `useState<DashboardMode>` (`"realtime"` | `"research"`).
- **ModeController** at the top of the page toggles between the two; only one mode’s content is rendered.
- Real-time mode shows: MetricCards, DebrisComposition, sync bar, HistoricalMortalityChart, TemperatureMortalityChart, BoatTrafficMortalityChart, DebrisMortalityChart, ScientistsInsight, TimelineSlider (30-day), LiveObservationLog.
- Research mode shows: HistoricalMarkers, ResearchHealthTaxChart, ResearchEntanglementMortalityChart, ResearchTemperatureMortalityChart, TimelineSlider (year).

### 2. Real-Time Data Layer (`src/lib/mockData.ts`)

- **getMockTimeSeries()**: Deterministic time series for the last `RANGE_DAYS` (30) at 15-minute intervals. Fields: `time`, `temperature`, `dolphinMortality`, `boatTraffic`, `turbidity`, `debris`.
- **getMetricsAtTime(dataset, viewDate)**: Interpolates or clamps to the nearest point; returns `{ boatTraffic, turbidity, waterTemp, marineDebris }`.
- **sliderValueToDate(value)** / **dateToSliderValue(date)**: Map between slider [0, 1] and a `Date` in the 30-day window.
- **getDebrisMortalitySeries7Days()**, **getDailyAggregatedSeries()**: Used by Debris and Temp/Boat charts.

### 3. Research Data Layer (`src/lib/researchModeData.ts`)

- **getResearchYearSeries()**: Returns `ResearchYearPoint[]` for years 2000–2026. Each point has: `year`, `temperatureF`, `survivalStrengthPct` (Health Tax: 100 − 2×(temp−85)), `entanglementDenominator` (50→5), `entanglementRiskPct`, `mortalityRiskPct`, `deathsMin`, `deathsMax`, `keyEvent`.
- **MORTALITY_RISK_THRESHOLD_2026_PCT** (5.9): Used by Record High alert in real-time mode.

### 4. Component Roles

| Component | Responsibility |
|-----------|----------------|
| **page.tsx** | Holds `dashboardMode`, `viewDate`, `viewYear`, `researchSliderValue`, datasets, metrics; wires ModeController, slider handlers, Back to Live; conditionally renders real-time vs research UI. |
| **ModeController** | Toggle between Real-Time (Live pulse icon) and Research (Library icon). |
| **MetricCards** | Displays metrics; optional `stationLabel` (e.g. Galveston Station 8771450). |
| **TimelineSlider** | `mode` determines 30-day vs year range; shows `viewDate` or `viewYear`; reports onChange/onDragEnd. |
| **StatusIndicator** | LIVE vs HISTORICAL and current viewing date (real-time only). |
| **RecordHighAlert** | Shown when live mortality risk % ≥ 5.90% (real-time only). |
| **HistoricalMarkers** | Shows popup when `viewYear` is 2013 (Research only). |
| **ResearchCharts** | ResearchHealthTaxChart, ResearchEntanglementMortalityChart, ResearchTemperatureMortalityChart (year X-axis, dual-axis). |
| **DashboardErrorBoundary** | Catches render errors; shows message and “Try again.” |
| **UnderwaterBackground** | Full-viewport background; fixed, behind content. |

### 5. Throttling and Slider UX

- Real-time slider: `viewDate` updates are throttled (~40 ms) while dragging; **timelineLiveValue** keeps the thumb responsive; on release, `viewDate` is set from the final value.
- Research slider: value maps directly to year; step = 1/(2026−2000).

### 6. Loading and Errors

- **Client-only mount**: `mounted` and `viewDate` are set in a `useEffect` (with `requestAnimationFrame`) so the dashboard only shows after hydration.
- **Fallback**: If still “Loading…” after 2 seconds, state is forced so the main UI (or an error) can appear.
- **DashboardErrorBoundary** (in layout): Catches render errors and displays the message and a “Try again” button.

## UI Layers (z-index)

1. **z-0**: `UnderwaterBackground` (fixed, full viewport).
2. **z-10**: Main content wrapper (ModeController, cards, charts, slider).

## File Map

- **App**: `src/app/layout.tsx`, `page.tsx`, `globals.css`.
- **Mode / UX**: `ModeController.tsx`, `TimelineSlider.tsx`, `StatusIndicator.tsx`, `DashboardErrorBoundary.tsx`, `RecordHighAlert.tsx`, `HistoricalMarkers.tsx`.
- **Real-time charts**: `HistoricalMortalityChart.tsx`, `TemperatureMortalityChart.tsx`, `BoatTrafficMortalityChart.tsx`, `DebrisMortalityChart.tsx`.
- **Research charts**: `ResearchCharts.tsx` (Health Tax, Entanglement, Temp/Mortality).
- **Data**: `src/lib/mockData.ts`, `src/lib/historicalMortalityData.ts`, `src/lib/researchModeData.ts`.
- **Theme**: `tailwind.config.ts`, `globals.css` (glass-card, status-pulse, etc.).

## Extending the System

- **New real-time metric**: Add field to `TimeSeriesPoint` and `MetricsAtTime`, update `getMockTimeSeries` and `getMetricsAtTime`, then add a card or axis.
- **New real-time chart**: Component that accepts `data` and (if needed) `viewDate`; add to the real-time branch in `page.tsx`.
- **New research chart**: Component that accepts `data: ResearchYearPoint[]`; add to the research branch and use `researchData`.
- **New historical marker**: In `HistoricalMarkers.tsx`, add another year/event and condition on `viewYear`.
- **Real API**: Replace mock in `useNoaaTemperature` or `getMockTimeSeries()`; keep `getMetricsAtTime`, slider helpers, and mode logic so the rest of the app stays consistent.
