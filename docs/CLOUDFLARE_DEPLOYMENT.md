# Cloudflare Deployment Guide

Complete guide for deploying the Greenlight scraper to Cloudflare Workers.

## Overview

The scraper runs on Cloudflare Workers with:

- **Workers**: Serverless edge compute
- **KV**: Key-value storage for caching
- **Browser Rendering**: Headless browser for scraping

## Prerequisites

- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Bun installed: [bun.sh](https://bun.sh)
- Domain added to Cloudflare (optional, for custom domain)

## Initial Setup

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser to authenticate.

### 2. Create KV Namespaces

```bash
./scripts/cf-setup.sh
```

This creates KV namespaces for all environments and prints the namespace IDs.

### 3. Update Configuration

Edit `packages/scraper/wrangler.toml` and replace placeholder IDs with the actual namespace IDs from step 2.

### 4. Configure Secrets

```bash
./scripts/cf-secrets.sh setup production
```

Required secrets:

| Secret                | Description                      |
| --------------------- | -------------------------------- |
| `GREENLIGHT_USERNAME` | Greenlight account email         |
| `GREENLIGHT_PASSWORD` | Greenlight account password      |
| `API_SECRET_KEY`      | API authentication key for TRMNL |

### 5. Enable Browser Rendering

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **Browser Rendering**
3. Enable the service
4. Accept the pricing ($5 per million requests)

## Deployment

### Deploy to Production

```bash
./scripts/cf-deploy.sh production
```

This script:

1. Checks prerequisites
2. Prompts for production confirmation
3. Runs type checking
4. Runs tests
5. Builds the project
6. Deploys to Cloudflare

### Deploy to Staging

```bash
./scripts/cf-deploy.sh staging
```

### Deploy to Development

```bash
./scripts/cf-deploy.sh development
```

### Deployment Options

| Option         | Description                          |
| -------------- | ------------------------------------ |
| `--dry-run`    | Preview deployment without deploying |
| `--skip-build` | Use existing build artifacts         |
| `--skip-tests` | Skip test execution                  |

Example:

```bash
./scripts/cf-deploy.sh staging --dry-run
```

## Configuration Reference

### wrangler.toml Structure

```toml
# Base configuration
name = "greenlight-scraper"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Browser Rendering binding
[browser]
binding = "BROWSER"

# KV Namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "your-namespace-id"

# Build settings
[build]
command = "bun run build"

# CPU limits for browser operations
[limits]
cpu_ms = 50000

# Environment overrides
[env.production]
name = "greenlight-scraper-prod"
workers_dev = false

[env.staging]
name = "greenlight-scraper-staging"
workers_dev = true

[env.development]
name = "greenlight-scraper-dev"
workers_dev = true
```

### Environment Variables vs Secrets

**Variables** (in wrangler.toml):

- Non-sensitive configuration
- Version controlled

**Secrets** (via wrangler secret):

- Sensitive credentials
- Never committed to git
- Set per environment

## Custom Domain Setup

### Option 1: Workers Route

Add to `wrangler.toml`:

```toml
[env.production]
route = { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
```

### Option 2: Custom Domain

1. In Cloudflare Dashboard, go to your Worker
2. Click **Triggers** > **Custom Domains**
3. Add your domain (e.g., `api.yourdomain.com`)

### DNS Configuration

If using a route, add a DNS record:

| Type  | Name | Target                                             | Proxy   |
| ----- | ---- | -------------------------------------------------- | ------- |
| CNAME | api  | greenlight-scraper-prod.your-subdomain.workers.dev | Enabled |

## Monitoring

### Real-time Logs

```bash
# All logs
wrangler tail --env production

# Errors only
wrangler tail --env production --status error
```

### Cloudflare Dashboard

1. Go to **Workers & Pages**
2. Select **greenlight-scraper-prod**
3. View:
   - **Analytics**: Request counts, errors, latency
   - **Logs**: Recent invocations
   - **Settings**: Configuration overview

### Health Check

```bash
curl https://your-worker-url/health
# Expected: {"status":"ok"}
```

## Secret Management

### List Secrets

```bash
./scripts/cf-secrets.sh list production
```

### Set a Secret

```bash
./scripts/cf-secrets.sh set production --name API_SECRET_KEY
```

### Delete a Secret

```bash
./scripts/cf-secrets.sh delete production --name OLD_SECRET
```

### Rotate API Key

```bash
./scripts/cf-secrets.sh set production --name API_SECRET_KEY
```

Remember to update TRMNL with the new key.

## KV Cache Management

### List Keys

```bash
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

### Get a Value

```bash
wrangler kv:key get KEY_NAME --namespace-id=YOUR_NAMESPACE_ID
```

### Delete a Key

```bash
wrangler kv:key delete KEY_NAME --namespace-id=YOUR_NAMESPACE_ID
```

## Costs

### Free Tier Includes

- 100,000 requests/day
- 10ms CPU time per request
- 1GB KV storage
- 1GB KV reads/day

### Paid Features

| Feature           | Cost                     |
| ----------------- | ------------------------ |
| Workers Paid      | $5/month (10M requests)  |
| Browser Rendering | ~$5/million requests     |
| Additional KV     | $0.50/million operations |

**Expected Monthly Cost**: $5-10 for typical home use.

## Environments

### Development

- Uses workers.dev subdomain
- Separate KV namespace
- Safe for testing

### Staging

- Uses workers.dev subdomain (or staging subdomain)
- Mirrors production config
- For pre-production testing

### Production

- Custom domain (recommended)
- Production secrets
- Real user traffic

## CI/CD with GitHub Actions

A workflow at `.github/workflows/deploy-cloudflare.yml` deploys automatically:

- Push to `staging` branch → Deploy to staging
- Push to `main` branch → Deploy to production

### Required GitHub Secrets

Set these in your repository settings:

| Secret                  | Description                        |
| ----------------------- | ---------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with Workers permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID         |

### Create API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Copy the token to GitHub secrets

## Rollback

### Quick Rollback

```bash
# View recent deployments
wrangler deployments list --env production

# Rollback to previous version
wrangler rollback --env production
```

### Manual Rollback

1. Check out the previous commit
2. Re-deploy:

   ```bash
   ./scripts/cf-deploy.sh production
   ```

## Troubleshooting

### Deployment Fails

1. Verify `wrangler login` is active
2. Check KV namespace IDs in wrangler.toml
3. Ensure Browser Rendering is enabled

### "Script too large"

- Check for large dependencies
- Use dynamic imports where possible
- Review bundle size in build output

### "CPU time exceeded"

- Increase `limits.cpu_ms` in wrangler.toml
- Optimize scraper logic
- Check for infinite loops

See [Troubleshooting](./TROUBLESHOOTING.md) for more help.

## Related Docs

- [Quick Start](./QUICK_START.md) - Initial setup
- [TRMNL Setup](./TRMNL_SETUP.md) - Display configuration
- [Security](./SECURITY.md) - Security practices
- [FAQ](./FAQ.md) - Common questions
