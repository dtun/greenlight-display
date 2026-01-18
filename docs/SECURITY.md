# Security Best Practices

Guidelines for securing your Greenlight scraper deployment.

## Overview

This system handles sensitive financial data and credentials. Follow these practices to keep your setup secure.

## Credential Management

### Never Commit Secrets

Secrets should never appear in version control:

```bash
# .gitignore should include:
.env
.env.*
.dev.vars
*.pem
*.key
```

### Use Cloudflare Secrets

Store credentials using Wrangler secrets, not environment variables in wrangler.toml:

```bash
# Correct: Use secrets
./scripts/cf-secrets.sh set production --name GREENLIGHT_PASSWORD

# Wrong: Don't put in wrangler.toml
# [vars]
# GREENLIGHT_PASSWORD = "..." # NEVER DO THIS
```

### Generate Strong API Keys

Use cryptographically secure random keys:

```bash
# Generate a 32-byte hex key
openssl rand -hex 32
```

### Rotate Credentials Regularly

- Rotate API_SECRET_KEY quarterly
- Update Greenlight password if compromised
- Regenerate keys after team member changes

## API Security

### Authentication

All API requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-worker-url/api/balances
```

Requests without valid authentication receive 401 Unauthorized.

### HTTPS Only

Cloudflare Workers enforce HTTPS by default:

- All traffic is encrypted in transit
- HTTP requests redirect to HTTPS
- TLS 1.2+ required

### Rate Limiting

Consider implementing rate limiting to prevent abuse:

- Limit requests per IP
- Limit requests per API key
- Return 429 Too Many Requests when exceeded

### CORS Configuration

If exposing the API to browsers, configure CORS carefully:

```typescript
// Only allow specific origins
const allowedOrigins = ['https://usetrmnl.com']
```

## Greenlight Credentials

### Dedicated Account

Consider using a dedicated Greenlight account:

- Create a separate parent account for scraping
- Reduces risk if credentials are compromised
- Easier to disable without affecting main account

### Two-Factor Authentication

The scraper doesn't support 2FA. If you need 2FA on your main account:

1. Create a secondary account for scraping
2. Or disable 2FA on the scraping account (less secure)

### Session Security

The scraper:

- Doesn't store raw passwords in KV
- Uses session tokens where possible
- Refreshes sessions automatically

## Infrastructure Security

### Cloudflare Security Features

Cloudflare provides:

- DDoS protection
- WAF (Web Application Firewall)
- Bot management
- SSL/TLS encryption

### KV Storage

KV data is:

- Encrypted at rest
- Isolated per account
- Not publicly accessible

### Worker Isolation

Workers run in:

- Isolated V8 instances
- Separate memory spaces
- No filesystem access

## Data Handling

### What Data is Stored

- Cached balance data in KV
- Session tokens (temporary)
- No raw passwords stored

### Data Retention

Configure cache TTL appropriately:

- Default: 15 minutes
- Maximum recommended: 1 hour
- Data automatically expires

### Minimal Data Collection

The scraper only collects:

- Account names
- Balance amounts
- Timestamps

No additional personal data is scraped or stored.

## Access Control

### GitHub Repository

If your repo is private:

- Limit collaborator access
- Use branch protection
- Require code reviews for secrets-related changes

### Cloudflare Account

Secure your Cloudflare account:

- Use strong password
- Enable 2FA
- Review API tokens regularly
- Use least-privilege tokens

### API Token Permissions

When creating Cloudflare API tokens:

- Use the Workers template
- Scope to specific account
- Set expiration dates
- Don't share tokens

## Monitoring and Alerts

### Log Monitoring

Monitor for suspicious activity:

```bash
# Watch for errors
wrangler tail --env production --status error
```

### Alert on Failures

Set up Cloudflare notifications for:

- High error rates
- Authentication failures
- Unusual traffic patterns

### Audit Logs

Review Cloudflare audit logs for:

- Configuration changes
- Secret modifications
- Deployment history

## Incident Response

### If API Key is Compromised

1. Immediately rotate the key:

   ```bash
   ./scripts/cf-secrets.sh set production --name API_SECRET_KEY
   ```

2. Update TRMNL with new key
3. Review access logs for unauthorized use
4. Investigate how compromise occurred

### If Greenlight Credentials are Compromised

1. Change Greenlight password immediately
2. Update the secret:

   ```bash
   ./scripts/cf-secrets.sh set production --name GREENLIGHT_PASSWORD
   ```

3. Review Greenlight account for unauthorized activity
4. Contact Greenlight support if needed

### If Cloudflare Account is Compromised

1. Change Cloudflare password
2. Revoke all API tokens
3. Review Workers for unauthorized changes
4. Check for new deployments or resources
5. Contact Cloudflare support

## Security Checklist

Before deploying to production:

- [ ] All secrets stored via Wrangler (not in code)
- [ ] Strong API key generated
- [ ] .env files in .gitignore
- [ ] HTTPS enforced
- [ ] Cloudflare 2FA enabled
- [ ] API token has minimal permissions
- [ ] Repository access restricted

Ongoing maintenance:

- [ ] Rotate API keys quarterly
- [ ] Review access logs monthly
- [ ] Update dependencies regularly
- [ ] Test authentication works correctly

## Reporting Security Issues

If you discover a security vulnerability:

1. Do not open a public issue
2. Email the maintainers directly
3. Provide detailed reproduction steps
4. Allow time for a fix before disclosure

## Related Docs

- [Quick Start](./QUICK_START.md) - Initial setup
- [Cloudflare Deployment](./CLOUDFLARE_DEPLOYMENT.md) - Deployment guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
- [FAQ](./FAQ.md) - Frequently asked questions
