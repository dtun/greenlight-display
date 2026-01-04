# Greenlight-TRMNL

Automated Greenlight account scraper that displays kids' balances on a TRMNL e-ink display, updating every 15 minutes.

## Problem Statement

Kids constantly asking "What's my balance?" - This project solves that by automatically displaying Greenlight account balances on a TRMNL e-ink display.

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

## Deployment

Deployment is handled via Cloudflare Workers and Wrangler. See implementation prompt 06 for detailed deployment instructions.

## Implementation Roadmap

This project follows a structured 7-phase implementation plan:

1. ✅ Monorepo Setup (Prompt 01)
2. ⬜ Test Infrastructure (Prompt 02)
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
