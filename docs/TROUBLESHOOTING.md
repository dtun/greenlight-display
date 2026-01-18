# Troubleshooting Guide

Common issues and their solutions.

## Deployment Issues

### "Not authenticated with Cloudflare"

**Symptom**: Scripts fail with authentication error.

**Solution**:

```bash
wrangler login
```

### "wrangler.toml contains placeholder KV namespace IDs"

**Symptom**: Deployment fails with placeholder warning.

**Solution**:

1. Run the setup script:

   ```bash
   ./scripts/cf-setup.sh
   ```

2. Copy the printed namespace IDs to `packages/scraper/wrangler.toml`

### "Build failed"

**Symptom**: `bun run build` fails.

**Solution**:

1. Check for TypeScript errors:

   ```bash
   bun run typecheck
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Clear build cache and retry:

   ```bash
   rm -rf packages/*/dist
   bun run build
   ```

### "Deployment failed - Missing secrets"

**Symptom**: Worker deployment succeeds but runtime errors occur.

**Solution**:

```bash
# Verify secrets are set
./scripts/cf-secrets.sh list production

# Set missing secrets
./scripts/cf-secrets.sh setup production
```

## Browser Rendering Issues

### "Browser Rendering not enabled"

**Symptom**: Scraper fails with binding error.

**Solution**:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **Browser Rendering**
3. Enable the service and accept pricing

### "Browser Rendering timeout"

**Symptom**: Scrape operations timeout after 60 seconds.

**Solution**:

- Greenlight may be slow or blocking requests
- Check CPU limits in `wrangler.toml` (should be 50000ms)
- Try again during off-peak hours

### "Browser Rendering quota exceeded"

**Symptom**: 429 errors from Browser Rendering API.

**Solution**:

- Wait for quota reset (daily limits)
- Upgrade Cloudflare plan for higher limits
- Increase cache duration to reduce scrape frequency

## TRMNL Issues

### "No data displayed"

**Symptom**: TRMNL shows blank or stale data.

**Causes and Solutions**:

1. **API endpoint incorrect**: Verify the URL includes `/api` path
2. **API key mismatch**: Ensure TRMNL has the correct API_SECRET_KEY
3. **Worker not deployed**: Check Cloudflare dashboard for deployment status
4. **Polling hasn't occurred**: Wait up to 15 minutes for first poll

### "Authentication failed"

**Symptom**: TRMNL receives 401 errors.

**Solution**:

1. Verify API key in TRMNL plugin settings
2. Check the secret is set correctly:

   ```bash
   ./scripts/cf-secrets.sh list production
   ```

3. Regenerate and update the key if needed:

   ```bash
   ./scripts/cf-secrets.sh set production --name API_SECRET_KEY
   ```

### "Template rendering errors"

**Symptom**: TRMNL shows Liquid error messages.

**Solution**:

1. Verify JSON response format matches template expectations
2. Test API endpoint directly:

   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-worker-url/api/balances
   ```

3. Check Liquid template syntax in TRMNL dashboard

## Scraper Issues

### "Login failed"

**Symptom**: Scraper cannot authenticate with Greenlight.

**Causes and Solutions**:

1. **Wrong credentials**: Verify GREENLIGHT_USERNAME and GREENLIGHT_PASSWORD
2. **Account locked**: Check if Greenlight account is locked from multiple attempts
3. **2FA enabled**: The scraper doesn't support 2FA - disable it on Greenlight
4. **Greenlight UI changed**: DOM selectors may need updating

### "Balance shows $0 or incorrect values"

**Symptom**: Data is retrieved but values are wrong.

**Causes**:

- Greenlight UI changed their HTML structure
- Account has no active kids
- Kids have no spending/savings accounts

**Solution**:

1. Check Greenlight app directly to verify balances
2. Review scraper logs:

   ```bash
   wrangler tail --env production
   ```

### "Stale data"

**Symptom**: Balances don't update.

**Causes**:

- Cache not expiring
- Scraper errors silently returning cached data

**Solution**:

1. Check KV cache:

   ```bash
   wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
   ```

2. Clear cache if needed:

   ```bash
   wrangler kv:key delete CACHE_KEY --namespace-id=YOUR_NAMESPACE_ID
   ```

## Local Development Issues

### "Cannot connect to local server"

**Symptom**: `bun run dev` fails or localhost unreachable.

**Solution**:

1. Check if port 8787 is in use:

   ```bash
   lsof -i :8787
   ```

2. Try a different port or kill the conflicting process

### "Environment variables not loading"

**Symptom**: Local development missing secrets.

**Solution**:

Create `.dev.vars` in `packages/scraper/`:

```ini
GREENLIGHT_USERNAME=your@email.com
GREENLIGHT_PASSWORD=yourpassword
API_SECRET_KEY=your-dev-api-key
```

## Monitoring and Debugging

### View Real-time Logs

```bash
wrangler tail --env production
```

### Filter Error Logs

```bash
wrangler tail --env production --status error
```

### Check Worker Status

1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages** > **greenlight-scraper-prod**
3. View **Analytics** and **Logs** tabs

### Test Health Endpoint

```bash
curl https://your-worker-url/health
```

Expected response: `{"status":"ok"}`

## Getting Help

If you're still stuck:

1. Check the [FAQ](./FAQ.md)
2. Review [Security](./SECURITY.md) for credential issues
3. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Environment (development/staging/production)
   - Relevant logs (redact sensitive info)
