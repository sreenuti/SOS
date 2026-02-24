# SOS — National SOS Marine Network

A marine research monitoring dashboard tracking **boat traffic**, **water quality**, **temperature**, and **dolphin mortality** across the **U.S. coasts**. It supports two modes: **Real-Time Monitoring** (NOAA live data and 30-day history) and **Research History Mode** (Dolphin Research Charts, 2000–2026).

## Features

### National Station Network

- **Five NOAA CO-OPS stations**: Santa Monica (9410840), Galveston (8771450), Key West (8724580), Charleston (8665530), Woods Hole (8447930).
- **Interactive USA map** — Clickable continental U.S. map with **pulse pins** at each station. Selecting a pin loads real-time data for that station and updates all graphs and regional baselines.
- **Regional baselines** — Health Tax uses region-specific historical baselines (e.g. **85.2°F** Gulf/Florida, **68°F** Northeast/West Coast). Scientific Summary card shows **Current Zone** and baseline.

### Mode Controller

- **Real-Time Monitoring** — Live-style data with a **green pulse “Live”** icon. Uses NOAA API for water temperature; station is chosen from the map. Synced 30-day timeline; metric cards and charts update to the same moment. **Loading** state and **cached** data when switching tabs.
- **Research History Mode** — **Library** icon. Charts use **Dolphin Research Charts Data Analysis** (years **2000–2026**): Health Tax baseline, Entanglement Risk (1 in 50 → 1 in 5), and mortality trends; **regional projections** for the selected station. **Historical Markers** layer: e.g. scrubbing to **2013** shows *“The Exodus: 50% of dolphins relocated due to food scarcity.”*

### Real-Time Mode

- **Synced timeline** — One slider controls the view date; all charts and metric cards update to the same moment.
- **Water Temperature & Dolphin Mortality** — Dual-axis chart (cyan = temperature °F, red = dolphin mortality).
- **Boat Traffic & Dolphin Mortality** — Dual-axis chart (blue = boat traffic, red = dolphin mortality).
- **Marine Debris & Dolphin Mortality** — Dual-axis (debris density vs mortality).
- **Metric cards** — Boat traffic, water quality (turbidity + temperature), marine debris, survival score; **station label** reflects selected station (e.g. Galveston, Key West).
- **Record High alert** — When live data exceeds the 2026 projected mortality threshold (5.90% risk), a **“Projected Record High”** banner is shown.
- **Back to Live** — Jump back to current (live) data when viewing historical dates.
- **Live Observation Log** — Side panel for vessel, turbidity, debris, and temperature alerts.
- **Loading** — Full-page loading while fetching live ocean data; **cache** avoids refetch when switching between Real-Time and Research tabs (refresh every 10 min).

### Research Mode

- **Year timeline** — Slider scrubs **2000–2026**; all research charts and markers use the selected year.
- **Health Tax chart** — Survival strength % vs water temp °F (2% reduction per °F above 85°F).
- **Entanglement & Mortality chart** — Entanglement risk % and mortality risk % by year.
- **Temperature vs Mortality chart** — Water temp and min/max mortality by year (dual-axis).
- **Historical Markers** — When the timeline is at 2013, a popup shows the Exodus event.

### Visual & UX

- **Dark-blue glassmorphism** theme; Recharts with dual-axis for Debris/Mortality and Temperature/Mortality.
- **Dolphin background** — Optional full-viewport background; semi-transparent cards so the background shows through.
- **Error boundary** — If the dashboard throws, an error message and “Try again” are shown instead of a stuck loading state.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (ocean theme, glass-card)
- **Recharts** (line/composed charts, dual-axis)

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

## Setup

```bash
# Clone the repo
git clone https://github.com/sreenuti/SOS.git
cd SOS

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start dev server (hot reload) |
| `npm run build` | Production build             |
| `npm run start` | Run production server        |
| `npm run lint`  | Run ESLint                   |

## Project Structure

```
SOS/
├── public/
│   └── images/              # Static assets (e.g. dolphin_background.png)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, MarineDebrisProvider, ErrorBoundary
│   │   ├── page.tsx         # Dashboard (mode state, realtime vs research UI)
│   │   └── globals.css      # Global styles, glass-card, animations
│   ├── components/
│   │   ├── BoatTrafficMortalityChart.tsx
│   │   ├── DebrisMortalityChart.tsx
│   │   ├── DashboardErrorBoundary.tsx   # Catches render errors
│   │   ├── HistoricalMarkers.tsx       # Research mode year popups (e.g. 2013)
│   │   ├── HistoricalMortalityChart.tsx
│   │   ├── LiveObservationLog.tsx
│   │   ├── MetricCards.tsx
│   │   ├── ModeController.tsx           # Real-Time vs Research toggle
│   │   ├── RecordHighAlert.tsx         # 5.90% mortality threshold alert
│   │   ├── ResearchCharts.tsx           # Health Tax, Entanglement, Temp/Mortality
│   │   ├── ScientistsInsight.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── TemperatureMortalityChart.tsx
│   │   ├── TimelineSlider.tsx          # 30-day or year (2000–2026) by mode
│   │   ├── UnderwaterBackground.tsx
│   │   ├── CoastMap.tsx                # USA map with pulse pins (station selector)
│   │   ├── DashboardLoadingWidget.tsx
│   │   └── ScientificSummaryCard.tsx   # Zone, station, Health Tax baseline
│   ├── context/
│   │   ├── MarineDebrisContext.tsx
│   │   └── StationContext.tsx         # Selected NOAA station (map → API & baseline)
│   ├── hooks/
│   │   ├── useNoaaTemperature.ts
│   │   └── useThrottle.ts
│   └── lib/
│       ├── mockData.ts           # 30-day series, metrics, 2026 ceilings, daily flux
│       ├── noaaStations.ts        # National stations (id, name, lat, lon, zone, baselineTempF)
│       ├── noaaService.ts        # Env: station ID, API URL (safe getters)
│       ├── fetchLiveOceanData.ts  # NOAA water temp by stationId; ChartData mapping
│       ├── historicalMortalityData.ts
│       ├── researchModeData.ts   # 2000–2026 series; regional baseline via stationId
│       ├── survivalScore.ts      # Health Tax baseline by station (regional)
│       └── ...
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CODE_GUIDE.md
│   └── README.md
├── README.md
├── CONTRIBUTING.md
└── package.json
```

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — Data flow, mode behavior, component roles.
- **[Code guide](docs/CODE_GUIDE.md)** — Conventions, patterns, how to add features.

## Configuration

### Environment variables (optional)

Create `.env.local` (or set in Vercel) for production:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_NOAA_STATION_ID` | Default station ID when app loads | `8771450` (Galveston) |
| `NEXT_PUBLIC_NOAA_API_URL` | NOAA CO-OPS datagetter base URL | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` |
| `NEXT_PUBLIC_HISTORICAL_BASELINE_TEMP` | Fallback Health Tax baseline °F when station has none | `85.2` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for the National SOS Marine Network map (station pins) | — |
| `NEXT_PUBLIC_AIS_API_URL` | AIS vessel API base URL. For MyShipTracking use `https://api.myshiptracking.com/api/v2/vessel/zone` | — |
| `NEXT_PUBLIC_AIS_API_KEY` | API key for the AIS provider (e.g. from MyShipTracking account → API Key Details). Sent as Bearer / x-api-key | — |

Stations and regional baselines are defined in `src/lib/noaaStations.ts` (Santa Monica, Galveston, Key West, Charleston, Woods Hole).

### Other settings

- **Data range (Real-Time)** — Edit `RANGE_DAYS` in `src/lib/mockData.ts` (e.g. 30 days).
- **Research years** — `RESEARCH_YEAR_MIN` / `RESEARCH_YEAR_MAX` in `src/app/page.tsx` (default 2000–2026).
- **Mortality threshold (Record High alert)** — `MORTALITY_RISK_THRESHOLD_2026_PCT` in `src/lib/researchModeData.ts` (default 5.9).
- **Background image** — Place `dolphin_background.png` in `public/images/`; opacity in `UnderwaterBackground.tsx`.
- **Theme** — Ocean palette and glass-card in `tailwind.config.ts` and `src/app/globals.css`.

## License

Private / project use.
