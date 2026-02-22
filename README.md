# SOS — Deep Ocean Environmental Dashboard

A marine research monitoring dashboard for the **Texas Science Fair**, tracking **boat traffic**, **water quality**, **temperature**, and **dolphin mortality** over a 7-day window with synced charts and a dolphin-themed background.

## Features

- **Synced timeline** — One slider controls the view date; all charts and metric cards update to the same moment so you can correlate temperature spikes, boat traffic, and dolphin mortality (e.g., *"Look at July 14th—temperature hit 88°F, boat traffic was high, dolphin mortality spiked"*).
- **Water Temperature & Dolphin Mortality** — Dual-axis chart (cyan = temperature °F, red = dolphin mortality).
- **Boat Traffic & Dolphin Mortality** — Dual-axis chart (amber = boat traffic vessels, red = dolphin mortality).
- **Metric cards** — Boat traffic, water quality (turbidity + temperature), and marine debris at the selected time.
- **Back to Live** — Button to jump back to current (live) data when viewing historical dates.
- **7-day range** — Data and timeline show the last 7 days by default.
- **Dolphin background** — Optional full-viewport background image with semi-transparent cards so the background shows through.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (ocean theme)
- **Recharts** (line charts)

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

| Command       | Description                |
|---------------|----------------------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build          |
| `npm run start` | Run production server     |
| `npm run lint`  | Run ESLint                |

## Project Structure

```
SOS/
├── public/
│   └── images/           # Static assets (e.g. dolphin_background.png)
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout + UnderwaterBackground
│   │   ├── page.tsx      # Dashboard page (state, sync logic)
│   │   └── globals.css   # Global styles, glass-card, animations
│   ├── components/       # UI components
│   │   ├── BoatTrafficChart.tsx
│   │   ├── DualAxisChart.tsx
│   │   ├── MetricCard.tsx
│   │   ├── MetricCards.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── TimelineSlider.tsx
│   │   └── UnderwaterBackground.tsx
│   ├── hooks/
│   │   └── useThrottle.ts
│   └── lib/
│       └── mockData.ts   # Time series data, slider↔date helpers
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── CODE_GUIDE.md
│   └── README.md
├── README.md             # This file
└── package.json
```

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — Data flow, component roles, sync behavior.
- **[Code guide](docs/CODE_GUIDE.md)** — Conventions, patterns, how to add features.

## Configuration

- **Data range** — Edit `RANGE_DAYS` in `src/lib/mockData.ts` to change the default window (e.g. 14 or 30 days).
- **Background image** — Place `dolphin_background.png` in `public/images/`; opacity is set in `UnderwaterBackground.tsx`.
- **Theme** — Ocean palette and glass-card opacity are in `tailwind.config.ts` and `src/app/globals.css`.

## License

Private / project use.
