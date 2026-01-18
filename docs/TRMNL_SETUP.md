# TRMNL Setup Guide

Detailed guide for configuring TRMNL to display Greenlight balances.

## Overview

TRMNL is an e-ink display that shows information from various sources. This guide covers setting up a private plugin to display your kids' Greenlight account balances.

## Prerequisites

- TRMNL device connected and registered
- Greenlight scraper deployed (see [Quick Start](./QUICK_START.md))
- API endpoint URL and API key

## Plugin Configuration

### Step 1: Access TRMNL Dashboard

1. Go to [usetrmnl.com/dashboard](https://usetrmnl.com/dashboard)
2. Log in with your TRMNL account

### Step 2: Create Private Plugin

1. Click **Add Plugin** or **+**
2. Select **Private Plugin**
3. Enter plugin details:
   - **Name**: Greenlight Balance
   - **Description**: Display Greenlight account balances for kids

### Step 3: Configure Polling

Set up how TRMNL fetches data from your scraper:

| Setting  | Value                                  |
| -------- | -------------------------------------- |
| Strategy | Polling                                |
| Method   | GET                                    |
| URL      | `https://your-worker-url/api/balances` |
| Interval | 900 (15 minutes)                       |

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Step 4: Upload Templates

Upload the Liquid templates from `packages/trmnl-plugin/`:

#### Full Screen Template

File: `full.liquid`

Best for: Dedicated balance display

Shows: All kids with spending, savings, totals, and parent wallet.

#### Half Horizontal Template

File: `half_horizontal.liquid`

Best for: Combined with another plugin on the same screen

Shows: Compact balance list with totals.

#### Half Vertical Template

File: `half_vertical.liquid`

Best for: Side-by-side display with another plugin

Shows: Stacked kid balances.

#### Quadrant Template

File: `quadrant.liquid`

Best for: Dashboard with multiple plugins

Shows: Summary balances in compact format.

### Step 5: Configure Form Fields

Add these fields so you can configure credentials in TRMNL:

#### API Endpoint

- **Key**: `api_endpoint`
- **Type**: Text
- **Label**: API Endpoint
- **Description**: Your scraper service URL
- **Help Text**: Example: `https://greenlight-scraper.your-domain.workers.dev`
- **Required**: Yes

#### API Key

- **Key**: `api_key`
- **Type**: Text
- **Label**: API Key
- **Description**: Your API authentication key
- **Help Text**: The Bearer token from your scraper's API_SECRET_KEY
- **Required**: Yes

### Step 6: Save and Test

1. Save the plugin configuration
2. Enter your API endpoint and key in the form fields
3. Click **Test** to verify the connection
4. Wait for the next poll interval or trigger a manual refresh

## Template Customization

### Understanding Liquid Templates

TRMNL uses [Liquid](https://shopify.github.io/liquid/) templates. The scraper returns JSON data that templates render.

### Expected Data Format

```json
{
	"timestamp": "2026-01-03T10:30:00Z",
	"accounts": [
		{
			"name": "Kid Name",
			"spending": 25.5,
			"savings": 100.0,
			"total": 125.5
		}
	],
	"parentWallet": 50.0
}
```

### Template Variables

| Variable              | Description                   |
| --------------------- | ----------------------------- |
| `timestamp`           | Last update time (ISO 8601)   |
| `accounts`            | Array of kid accounts         |
| `accounts[].name`     | Kid's name                    |
| `accounts[].spending` | Spending balance              |
| `accounts[].savings`  | Savings balance               |
| `accounts[].total`    | Combined balance              |
| `parentWallet`        | Parent funding wallet balance |

### Example Custom Template

```liquid
<div class="layout">
  <div class="title">Family Balances</div>

  {% for account in accounts %}
  <div class="item">
    <span class="name">{{ account.name }}</span>
    <span class="balance">${{ account.total | round: 2 }}</span>
  </div>
  {% endfor %}

  <div class="footer">
    Updated: {{ timestamp | date: "%I:%M %p" }}
  </div>
</div>
```

### TRMNL CSS Classes

TRMNL provides built-in CSS classes for consistent styling:

- `.layout` - Main container
- `.title` - Header text
- `.item` - List item
- `.footer` - Footer area
- `.gap--small`, `.gap--medium`, `.gap--large` - Spacing

Refer to [TRMNL documentation](https://docs.usetrmnl.com) for the full CSS reference.

## Display Layouts

### Full Screen (800x480)

The full template has room for:

- Title and last updated time
- All kids with full details
- Parent wallet balance
- Visual styling and icons

### Half Horizontal (800x240)

Compact horizontal strip:

- Condensed kid list
- Smaller fonts
- Essential info only

### Half Vertical (400x480)

Narrow vertical panel:

- Stacked layout
- Good for sidebars

### Quadrant (400x240)

Smallest format:

- Summary only
- Best for dashboards with 4+ plugins

## Polling Configuration

### Interval Settings

| Interval (seconds) | Use Case                           |
| ------------------ | ---------------------------------- |
| 300 (5 min)        | Frequent updates, higher API usage |
| 900 (15 min)       | Recommended balance                |
| 1800 (30 min)      | Low usage, slower updates          |
| 3600 (1 hr)        | Minimal updates                    |

### Rate Limiting

The scraper caches results to avoid hitting Greenlight too frequently. Even with shorter poll intervals, actual scrapes occur less often.

## Multiple Devices

If you have multiple TRMNL devices:

1. Each device can have its own plugin instance
2. Use the same API endpoint and key
3. Configure different templates per device if desired

## Troubleshooting

### "No data displayed"

1. Verify API endpoint URL is correct
2. Check API key matches your scraper's API_SECRET_KEY
3. Test the endpoint directly:

   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://your-worker-url/api/balances
   ```

### "Stale data"

- TRMNL polls at the configured interval
- Check the timestamp in the display
- Verify the scraper is running (check Cloudflare logs)

### "Template errors"

- Verify Liquid syntax
- Check that variable names match the API response
- Test with the sample JSON above

See [Troubleshooting](./TROUBLESHOOTING.md) for more help.

## Related Docs

- [Quick Start](./QUICK_START.md) - Initial setup
- [Cloudflare Deployment](./CLOUDFLARE_DEPLOYMENT.md) - Scraper deployment
- [Security](./SECURITY.md) - Securing your setup
- [FAQ](./FAQ.md) - Common questions
