# Frequently Asked Questions

Common questions about the Greenlight-TRMNL integration.

## General

### What is this project?

A system that automatically displays your kids' Greenlight account balances on a TRMNL e-ink display. It scrapes Greenlight for balance data and provides an API that TRMNL polls to update the display.

### What do I need to get started?

- A Greenlight account with kids added
- A TRMNL device
- A Cloudflare account (free tier works)
- Basic command line knowledge

### How much does it cost to run?

- **Cloudflare Workers**: Free tier covers most usage
- **Browser Rendering**: ~$5/million requests (typically <$1/month)
- **TRMNL**: Your existing device subscription

Total: Usually $0-5/month depending on usage.

### Is this officially supported by Greenlight or TRMNL?

No. This is an independent project. It's not affiliated with, endorsed by, or supported by Greenlight or TRMNL.

## Setup

### How long does setup take?

About 5 minutes if you follow the [Quick Start](./QUICK_START.md) guide.

### Can I use this without a Cloudflare account?

Not with the default setup. Cloudflare Workers provides the serverless infrastructure. Alternative deployments would require code changes.

### Do I need a custom domain?

No. Cloudflare provides a workers.dev subdomain for free. Custom domains are optional.

### Can I run this locally?

Yes, for development:

```bash
cd packages/scraper
bun run dev
```

This starts a local server at `http://localhost:8787`.

## TRMNL

### How often does the display update?

By default, every 15 minutes (900 seconds). You can adjust this in the TRMNL plugin settings.

### Can I use different templates for different rooms?

Yes. If you have multiple TRMNL devices, each can use a different template (full, half, quadrant).

### Why is my display blank?

Common causes:

1. API endpoint URL incorrect
2. API key mismatch
3. Worker not deployed
4. Polling hasn't occurred yet (wait 15 minutes)

See [Troubleshooting](./TROUBLESHOOTING.md) for solutions.

### Can I customize the display layout?

Yes. Edit the Liquid templates in `packages/trmnl-plugin/` and re-upload to TRMNL. See [TRMNL Setup](./TRMNL_SETUP.md) for details.

## Greenlight

### Does this work with Greenlight 2FA?

No. The scraper uses headless browser automation which doesn't support 2FA. You'll need to disable 2FA on the account used for scraping.

### Will this get my Greenlight account banned?

The scraper mimics normal browser behavior and uses reasonable delays. However, aggressive scraping could trigger anti-bot measures. The default 15-minute polling interval is conservative.

### Does this work with multiple kids?

Yes. The scraper returns all kid accounts associated with your Greenlight login.

### Can I see transaction history?

Not currently. The scraper only fetches current balances. Transaction history would require additional development.

### What if Greenlight changes their website?

The scraper may break if Greenlight changes their HTML structure. Watch for errors in your logs and check for project updates.

## Security

### Is my Greenlight password stored securely?

Yes. Passwords are stored as Cloudflare secrets, encrypted at rest, and never logged or exposed via API.

### Can others see my kids' balances?

Only if they have your API key. The API requires authentication on every request.

### Should I use my main Greenlight account?

You can, but consider creating a dedicated account for scraping to reduce risk.

See [Security](./SECURITY.md) for best practices.

## Costs and Billing

### What's included in Cloudflare's free tier?

- 100,000 Worker requests/day
- 1GB KV storage
- Unlimited custom domains

### What costs extra?

- **Browser Rendering**: ~$5/million requests
- **Workers Paid**: $5/month for 10M requests (if you exceed free tier)

### How can I reduce costs?

1. Increase polling interval (e.g., 30 minutes instead of 15)
2. The scraper caches results, so most TRMNL polls don't trigger actual scrapes
3. Use a longer cache TTL

## Troubleshooting

### The display shows old data

1. Check the timestamp on the display
2. Verify the Worker is running (check Cloudflare dashboard)
3. Test the API endpoint directly with curl

### I get "401 Unauthorized"

1. Verify the API key in TRMNL matches your API_SECRET_KEY
2. List secrets to confirm: `./scripts/cf-secrets.sh list production`

### Deployment fails

1. Run `wrangler login` to refresh authentication
2. Verify KV namespace IDs in wrangler.toml
3. Check that Browser Rendering is enabled

See [Troubleshooting](./TROUBLESHOOTING.md) for more help.

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

### How do I run tests?

```bash
bun test
```

### How do I add a new template?

1. Create a new `.liquid` file in `packages/trmnl-plugin/`
2. Follow the existing template structure
3. Upload to TRMNL dashboard

### Can I use a different display device?

The TRMNL-specific code is isolated in `packages/trmnl-plugin/`. The scraper API could work with other displays that support JSON APIs.

## Future Plans

### Will you add transaction history?

Possibly. It would require additional scraping logic and template updates.

### Will you support other card services?

Contributions welcome. The architecture supports multiple scrapers.

### Will you add spending notifications?

Not currently planned, but the infrastructure could support it via additional integrations.

## Getting Help

### Where can I report bugs?

Open an issue on GitHub with:

- Error messages
- Steps to reproduce
- Environment details

### Where can I ask questions?

- Check this FAQ first
- Search existing GitHub issues
- Open a new issue if your question isn't covered

### How do I get updates?

Watch or star the GitHub repository to receive notifications about new releases.

## Related Docs

- [Quick Start](./QUICK_START.md) - Get started in 5 minutes
- [TRMNL Setup](./TRMNL_SETUP.md) - Display configuration
- [Cloudflare Deployment](./CLOUDFLARE_DEPLOYMENT.md) - Deployment guide
- [Security](./SECURITY.md) - Security best practices
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem solving
