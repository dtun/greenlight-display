# Quick Start Guide

Get your Greenlight balances displaying on TRMNL in 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed
- Cloudflare account with Workers enabled
- TRMNL device set up and connected
- Greenlight account credentials

## Step 1: Clone and Install

```bash
git clone https://github.com/your-username/greenlight-display.git
cd greenlight-display
bun install
```

## Step 2: Set Up Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Create KV namespaces
./scripts/cf-setup.sh
```

Copy the namespace IDs printed by the script and update `packages/scraper/wrangler.toml`.

## Step 3: Configure Secrets

```bash
# Set up required secrets
./scripts/cf-secrets.sh setup production
```

You'll be prompted to enter:

- **GREENLIGHT_USERNAME**: Your Greenlight email
- **GREENLIGHT_PASSWORD**: Your Greenlight password
- **API_SECRET_KEY**: Generate with `openssl rand -hex 32`

Save your API_SECRET_KEY - you'll need it for TRMNL.

## Step 4: Enable Browser Rendering

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **Browser Rendering**
3. Enable the service

## Step 5: Deploy

```bash
./scripts/cf-deploy.sh production
```

Note your worker URL (e.g., `https://greenlight-scraper-prod.your-subdomain.workers.dev`).

## Step 6: Configure TRMNL

1. Go to [TRMNL Dashboard](https://usetrmnl.com/dashboard)
2. Add a new **Private Plugin**
3. Upload templates from `packages/trmnl-plugin/`:
   - `full.liquid`
   - `half_horizontal.liquid`
   - `half_vertical.liquid`
   - `quadrant.liquid`
4. Configure plugin settings:
   - **API Endpoint**: Your worker URL + `/api` (e.g., `https://greenlight-scraper-prod.your-subdomain.workers.dev/api`)
   - **API Key**: Your API_SECRET_KEY from Step 3

## Step 7: Verify

Your TRMNL device should display balances within 15 minutes (the default polling interval).

To test immediately:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-worker-url/api/balances
```

## Next Steps

- [TRMNL Setup](./TRMNL_SETUP.md) - Detailed TRMNL configuration
- [Cloudflare Deployment](./CLOUDFLARE_DEPLOYMENT.md) - Advanced deployment options
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and fixes
- [Security](./SECURITY.md) - Security best practices

## Need Help?

Check the [FAQ](./FAQ.md) or open an issue on GitHub.
