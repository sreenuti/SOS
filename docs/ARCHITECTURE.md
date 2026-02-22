# Architecture

## Overview

The dashboard is a **single-page app** built with Next.js App Router. It has two **modes** and a **National SOS Marine Network** of five NOAA CO-OPS stations.

1. **Real-Time Monitoring** — One **view date** drives all visualizations over a **30-day** window; the timeline slider is the single source of truth. **Station** is selected from the USA map (CoastMap); live water temperature is fetched per station via NOAA API; metrics and charts use that station. Data is cached (~10 min) when switching modes.
2. **Research History Mode** — A **view year** (2000–2026) drives research charts and historical markers. Data comes from **Dolphin Research Charts Data Analysis** with **regional baselines** for the **selected station** (Health Tax baseline °F per region: e.g. 85.2 Gulf/Florida, 68 Northeast/West).

## High-Level Data Flow

### Station context and USA map

- **StationContext** (`src/context/StationContext.tsx`): Holds `selectedStationId`, `setSelectedStationId`, `selectedStation`, `stations`. Provided in `layout.tsx`. Default from env `NEXT_PUBLIC_NOAA_STATION_ID` or Galveston 8771450.
- **Stations** (`src/lib/noaaStations.ts`): Five stations — Santa Monica 9410840, Galveston 8771450, Key West 8724580, Charleston 8665530, Woods Hole 8447930. Each has `id`, `name`, `lat`, `lon`, `zone`, `baselineTempF`.
- **CoastMap** (`src/components/CoastMap.tsx`): Continental USA SVG; clickable pulse pins; selecting a pin sets `selectedStationId`.

### Real-Time Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Page (page.tsx)                                                          │
│  • dashboardMode = "realtime"                                             │
│  • viewDate state                                                         │
│  • dataset = getMockTimeSeries() + live merge; loading when no cache       │
│  • metrics = getMetricsAtTime(dataset, viewDate)                           │
│  • selectedStationId from StationContext; fetchLiveOceanData(stationId); cache │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐
│ CoastMap     │    │ MetricCards      │    │ TimelineSlider              │
│ (station     │    │ Charts           │    │ mode="realtime"             │
│  selection)  │    │ ScientificSummary│    │ value ↔ viewDate (30 days)  │
└──────────────┘    └──────────────────┘    └─────────────────────────────┘
```

- **viewDate**: The moment in time the dashboard is “showing.” All real-time charts and metric cards use this.
- **selectedStationId**: Drives NOAA fetch and regional baseline (Scientific Summary, Health Tax). See "Station context and USA map" below.
- **Slider**: In real-time mode, [0, 1] maps to [30 days ago, now]. Moving the slider updates `viewDate`.
- **Record High alert**: When mortality risk from current temp ≥ 5.90% (2026 threshold), `RecordHighAlert` is shown.

### Research Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Page (page.tsx)                                                          │
│  • dashboardMode = "research"                                             │
│  • researchSliderValue ∈ [0, 1]; selectedStationId from StationContext    │
│  • viewYear = 2000 + round(researchSliderValue * 26)                      │
│  • researchData = getResearchYearSeries(stationId) — regional baseline     │
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

### 2. Real-Time Data Layer

- **mockData.ts**: **getMockTimeSeries()** (30 days, 15-min), **getMetricsAtTime()**, slider↔date helpers; 2026 ceilings (marine debris 687 MT, vessel 18,279/month), daily flux ±5%, entanglement 1 in 5.
- **fetchLiveOceanData.ts**: Fetches NOAA water temperature by `stationId`; product `water_temperature`, datum `mllw`, units `english`; maps to `ChartData`; fallback last-known or 78.5°F; called every 10 min; cache used when &lt; 10 min old.
- **noaaService.ts**: Safe env getters — `getNoaaStationId()`, `getNoaaApiUrl()`, `isNoaaConfigured()`.
- **noaaStations.ts**: Five stations with `baselineTempF` per region; `getStationById`, `getDefaultStationId`.

### 3. Research Data Layer (`src/lib/researchModeData.ts`)

- **getResearchYearSeries(stationId?)**: Returns `ResearchYearPoint[]` for years 2000–2026; uses **regional baseline** for Health Tax when `stationId` is provided (via `getHistoricalBaselineTempF` in survivalScore.ts).
- **MORTALITY_RISK_THRESHOLD_2026_PCT** (5.9): Used by Record High alert in real-time mode.

### 4. Component Roles

| Component | Responsibility |
|-----------|----------------|
| **page.tsx** | Holds `dashboardMode`, `viewDate`, `viewYear`, `researchSliderValue`, datasets, metrics; wires ModeController, slider handlers, Back to Live; conditionally renders real-time vs research UI. |
| **ModeController** | Toggle between Real-Time (Live pulse icon) and Research (Library icon). |
| **CoastMap** | USA map with pulse pins; click selects station; drives StationContext. |
| **MetricCards** | Displays metrics; `stationLabel` from selected station. |
| **ScientificSummaryCard** | Current zone, station name/id, Health Tax baseline (regional). |
| **DashboardLoadingWidget** | Full-page/compact loading while live data is fetched. |
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

### 6. Loading, cache, and errors

- **Live data**: Loading widget until first successful fetch; cache reused when switching modes if &lt; 10 min old.
- **Client-only mount**: `mounted` and `viewDate` set in `useEffect` so the dashboard shows after hydration.
- **Fallback**: If still “Loading…” after 2 seconds, state is forced so the main UI (or an error) can appear.
- **DashboardErrorBoundary** (in layout): Catches render errors and displays the message and a “Try again” button.

## UI Layers (z-index)

1. **z-0**: `UnderwaterBackground` (fixed, full viewport).
2. **z-10**: Main content wrapper (ModeController, cards, charts, slider).

## File Map

- **App**: `src/app/layout.tsx` (StationProvider), `page.tsx`, `globals.css`.
- **Mode / UX**: `ModeController.tsx`, `TimelineSlider.tsx`, `StatusIndicator.tsx`, `DashboardErrorBoundary.tsx`, `RecordHighAlert.tsx`, `HistoricalMarkers.tsx`.
- **Station / map**: `StationContext.tsx`, `CoastMap.tsx`, `ScientificSummaryCard.tsx`, `DashboardLoadingWidget.tsx`.
- **Real-time charts**: `HistoricalMortalityChart.tsx`, `TemperatureMortalityChart.tsx`, `BoatTrafficMortalityChart.tsx`, `DebrisMortalityChart.tsx`.
- **Research charts**: `ResearchCharts.tsx` (Health Tax, Entanglement, Temp/Mortality).
- **Data**: `src/lib/mockData.ts`, `noaaStations.ts`, `noaaService.ts`, `fetchLiveOceanData.ts`, `survivalScore.ts` (regional baseline), `historicalMortalityData.ts`, `researchModeData.ts`.
- **Theme**: `tailwind.config.ts`, `globals.css` (glass-card, status-pulse, etc.).

## Extending the System

- **New real-time metric**: Add field to `TimeSeriesPoint` and `MetricsAtTime`, update `getMockTimeSeries` and `getMetricsAtTime`, then add a card or axis.
- **New real-time chart**: Component that accepts `data` and (if needed) `viewDate`; add to the real-time branch in `page.tsx`.
- **New research chart**: Component that accepts `data: ResearchYearPoint[]`; add to the research branch and use `researchData`.
- **New historical marker**: In `HistoricalMarkers.tsx`, add another year/event and condition on `viewYear`.
- **Real API**: Live water temp is already via `fetchLiveOceanData(stationId)`; station comes from CoastMap/StationContext. Keep `getMetricsAtTime`, slider helpers, and mode logic so the rest of the app stays consistent.
