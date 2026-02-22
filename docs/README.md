# SOS Dashboard — Documentation

This folder contains detailed documentation for the Deep Ocean Environmental Dashboard (SOS) project.

## Contents

| Document | Description |
|----------|-------------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, **National SOS Marine Network** (stations, CoastMap, StationContext), Real-Time vs Research mode data flow, regional baselines, loading/cache, component roles, and file map. |
| **[CODE_GUIDE.md](CODE_GUIDE.md)** | Conventions, patterns, env vars, and how to add or change features (new charts, metrics, stations, research data, historical markers). |

## Quick Links

- **Main README**: [../README.md](../README.md) — setup, scripts, project structure, configuration, Mode Controller overview.
- **App entry**: `src/app/page.tsx` — dashboard mode state, real-time vs research layout.
- **Data**: `src/lib/mockData.ts` (30-day series), `src/lib/researchModeData.ts` (2000–2026 research series).
