# Greenlight Mobile API Discovery

> **Status**: In Progress
> **Date**: 2026-01-17
> **Goal**: Find API endpoint that returns child balance data

---

## Quick Reference: Charles Setup for iOS

```bash
# 1. Start Charles, enable SSL Proxying
# Charles → Proxy → SSL Proxying Settings → Enable
# Add: *.greenlight.com (or * for all during discovery)

# 2. Get Charles IP (your Mac's local IP)
# Charles → Help → Local IP Address

# 3. On iOS device:
# Settings → Wi-Fi → [Your Network] → Configure Proxy → Manual
# Server: [Charles IP]  Port: 8888

# 4. Install Charles certificate on iOS:
# Safari → chls.pro/ssl → Allow → Install Profile
# Settings → General → VPN & Device Management → Charles → Install
# Settings → General → About → Certificate Trust Settings → Enable Charles

# 5. Verify: Browse to any HTTPS site, should see traffic in Charles
```

---

## API Discovery Results

### Base URL

| Field       | Value  |
| ----------- | ------ |
| Host        | `TODO` |
| Protocol    | HTTPS  |
| API Version | `TODO` |

### SSL Pinning Status

- [ ] No SSL pinning detected (traffic visible)
- [ ] SSL pinning present (traffic blocked)

**If pinned, notes on bypass attempts**:

```
TODO: Document any pinning issues and workarounds attempted
```

---

## Authentication

### Login Endpoint

| Field        | Value  |
| ------------ | ------ |
| Method       | `TODO` |
| Path         | `TODO` |
| Content-Type | `TODO` |

**Request Headers**:

```
TODO: Document required headers
```

**Request Payload**:

```json
TODO: Document request body structure
```

**Response**:

```json
TODO: Document response structure (sanitized)
```

### Token Information

| Field             | Value                       |
| ----------------- | --------------------------- |
| Token Type        | `TODO (JWT/opaque/etc.)`    |
| Token Location    | `TODO (header/cookie/etc.)` |
| Observed Lifetime | `TODO`                      |

### 2FA Flow

```
TODO: Document 2FA steps observed
1.
2.
3.
```

### Refresh Mechanism

| Field                 | Value           |
| --------------------- | --------------- |
| Refresh Endpoint      | `TODO or N/A`   |
| Refresh Token Present | `TODO (yes/no)` |
| Auto-refresh Observed | `TODO (yes/no)` |

---

## Balance Endpoint

### Request

| Field        | Value  |
| ------------ | ------ |
| Method       | `TODO` |
| Path         | `TODO` |
| Content-Type | `TODO` |

**Required Headers**:

```
TODO: List all required headers
Authorization: Bearer <token>
...
```

**Request Payload** (if POST):

```json
TODO: Document request body if applicable
```

### Response

**Status Code**: `TODO`

**Response Body** (sanitized):

```json
TODO: Paste sanitized response showing structure
{
  "children": [
    {
      "name": "REDACTED",
      "spending": 0.00,
      "savings": 0.00
    }
  ]
}
```

### Data Mapping

| API Field | Our Field  | Notes                  |
| --------- | ---------- | ---------------------- |
| `TODO`    | `name`     | Child's name           |
| `TODO`    | `spending` | Spend Anywhere balance |
| `TODO`    | `savings`  | Savings balance        |
| `TODO`    | `total`    | Combined balance       |

---

## Additional Observations

### Request Headers of Interest

```
TODO: Document any interesting headers
X-API-Key:
X-Device-ID:
X-App-Version:
User-Agent:
```

### Other Relevant Endpoints Discovered

| Endpoint | Method | Purpose |
| -------- | ------ | ------- |
| `TODO`   | `TODO` | `TODO`  |

---

## Viability Assessment

### Checklist

- [ ] API endpoint exists that returns balance data
- [ ] Authentication flow is understood
- [ ] Token can be obtained programmatically
- [ ] Token lifetime is reasonable (> 1 hour)
- [ ] Refresh mechanism exists OR initial auth is automatable
- [ ] No device attestation/certificate pinning blocking automation

### Decision

**Is this approach viable?** `TODO: YES / NO / NEEDS MORE INVESTIGATION`

**Reasoning**:

```
TODO: Explain why this is or isn't viable
```

**Blockers** (if any):

1.
2.

**Next Steps**:

- [ ] TODO

---

## Raw Traffic Samples

<details>
<summary>Login Request/Response</summary>

```http
TODO: Paste raw request

---

TODO: Paste raw response
```

</details>

<details>
<summary>Balance Request/Response</summary>

```http
TODO: Paste raw request

---

TODO: Paste raw response
```

</details>
