# Contributing to SOS Dashboard

Thanks for your interest in contributing. This project is used for the Texas Science Fair marine research dashboard.

## Before You Start

1. Read the [README](README.md) for setup and overview.
2. Read the [Architecture](docs/ARCHITECTURE.md) to understand data flow and component roles.
3. Follow the [Code Guide](docs/CODE_GUIDE.md) for conventions and patterns.

## Development Setup

```bash
git clone https://github.com/sreenuti/SOS.git
cd SOS
npm install
npm run dev
```

## Workflow

1. Create a branch for your change (e.g. `feature/new-chart`, `fix/axis-labels`).
2. Make changes; keep commits focused and messages clear.
3. Run **`npm run lint`** and fix any issues.
4. Run **`npm run build`** to ensure the project builds.
5. Open a pull request against `main` with a short description of the change.

## What to Update When Changing Behavior

- **New or changed features**: Update [README](README.md) (e.g. Features, Project structure) if user-facing.
- **Data or API shape**: Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/CODE_GUIDE.md](docs/CODE_GUIDE.md) if relevant.
- **New env vars or config**: Document in README under Configuration.

## Questions

Open an issue on the repository for bugs or feature ideas.
