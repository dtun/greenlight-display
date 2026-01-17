# Greenlight-TRMNL

Automated Greenlight account scraper that displays kids' balances on a TRMNL e-ink display, updating every 15 minutes.

## Features

- **Automatic Balance Updates**: Scrapes Greenlight accounts every 15 minutes
- **E-Ink Display**: Beautiful, always-on display on TRMNL devices
- **Multiple Layouts**: Full, half, and quadrant templates for flexible display options
- **Per-Child Balances**: Shows spending, savings, and total for each child
- **Parent Wallet**: Displays parent funding wallet balance
- **Edge Deployment**: Runs on Cloudflare Workers for fast, reliable performance
- **Secure**: API key authentication, encrypted credentials, no data stored

## Problem Statement

Kids constantly asking "What's my balance?" - This project solves that by automatically displaying Greenlight account balances on a TRMNL e-ink display.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                              │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  Scraper Worker  │◄───│   KV Storage     │                  │
│  │  (Hono API)      │    │   (Sessions)     │                  │
│  └────────┬─────────┘    └──────────────────┘                  │
│           │                                                     │
│           │ Browser Rendering API                               │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │  Headless Chrome │                                          │
│  │  (Puppeteer)     │                                          │
│  └────────┬─────────┘                                          │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ Scrapes
            ▼
   ┌──────────────────┐         ┌──────────────────┐
   │  Greenlight.com  │         │  TRMNL Device    │
   │  (Account Data)  │         │  (E-Ink Display) │
   └──────────────────┘         └────────┬─────────┘
                                         │
                                         │ Polls every 15 min
                                         ▼
                                ┌──────────────────┐
                                │  /api/balances   │
                                │  JSON Response   │
                                └──────────────────┘
```

**Data Flow**:

1. TRMNL device polls the scraper API every 15 minutes
2. Scraper Worker authenticates with Greenlight via headless browser
3. Balance data is extracted and returned as JSON
4. TRMNL renders the data using Liquid templates on the e-ink display

## Tech Stack

- **Scraper**: Hono + Cloudflare Workers with Browser Rendering API
- **Display**: TRMNL (Liquid templates)
- **Shared**: TypeScript + Vitest
- **Build**: Bun workspaces + Turborepo

## Project Structure

```
greenlight-trmnl/
├── packages/
│   ├── scraper/         # Hono service for scraping Greenlight accounts
│   ├── trmnl-plugin/    # TRMNL Liquid templates for e-ink display
│   └── shared/          # TypeScript types and shared utilities
├── package.json         # Root workspace configuration
├── turbo.json          # Turborepo pipeline
└── tsconfig.base.json  # Base TypeScript configuration
```

## Prerequisites

- Bun 1.0+ ([install Bun](https://bun.sh))
- Node.js 18+

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd greenlight-display
   ```

2. **Copy environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**

   Edit `.env` and add your credentials:

   ```
   GREENLIGHT_EMAIL=your-email@example.com
   GREENLIGHT_PASSWORD=your-password
   API_KEY=your-secure-api-key
   PORT=3000
   ```

4. **Install dependencies**

   ```bash
   bun install
   ```

## Development Commands

```bash
# Start scraper in development mode
bun dev

# Build all packages
bun build

# Type check all TypeScript packages
bun typecheck

# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage

# Format code with Prettier
bun format

# Check code formatting
bun format:check

# Clean build artifacts
bun clean
```

## Package-Specific Commands

```bash
# Run scraper in development
bun --filter scraper dev

# Deploy scraper to Cloudflare Workers
bun --filter scraper deploy

# Build shared package
bun --filter shared build
```

## Quick Start

Get your Greenlight balances displaying on TRMNL in minutes:

```bash
# Clone and install
git clone https://github.com/your-username/greenlight-display.git
cd greenlight-display
bun install

# Set up Cloudflare
wrangler login
./scripts/cf-setup.sh

# Configure secrets
./scripts/cf-secrets.sh setup production

# Deploy
./scripts/cf-deploy.sh production
```

For complete setup instructions, see the [Quick Start Guide](docs/QUICK_START.md).

## Documentation

| Guide                                                  | Description                          |
| ------------------------------------------------------ | ------------------------------------ |
| [Quick Start](docs/QUICK_START.md)                     | Get up and running in 5 minutes      |
| [TRMNL Setup](docs/TRMNL_SETUP.md)                     | Detailed TRMNL device configuration  |
| [Cloudflare Deployment](docs/CLOUDFLARE_DEPLOYMENT.md) | Deployment options and configuration |
| [Security](docs/SECURITY.md)                           | Security best practices              |
| [Troubleshooting](docs/TROUBLESHOOTING.md)             | Common issues and fixes              |
| [FAQ](docs/FAQ.md)                                     | Frequently asked questions           |

## Deployment

Deployment is handled via Cloudflare Workers and Wrangler. See the [Cloudflare Deployment Guide](docs/CLOUDFLARE_DEPLOYMENT.md) for detailed instructions.

## Implementation Roadmap

This project follows a structured 7-phase implementation plan:

1. ✅ Monorepo Setup (Prompt 01)
2. ✅ Test Infrastructure (Prompt 02)
3. ⬜ Shared Package (Prompt 03)
4. ⬜ Scraper Service (Prompt 04)
5. ⬜ TRMNL Plugin (Prompt 05)
6. ⬜ Deployment Configuration (Prompt 06)
7. ⬜ Documentation & Integration (Prompt 07)

For detailed implementation guides, see the `reference-files/` directory.

## Code Style

- Use `let` for variables that may be reassigned
- Use `const` ONLY for true constants (e.g., `const API_TIMEOUT = 5000`)
- Run `bun format` before committing
- Use conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`

## License

MIT
