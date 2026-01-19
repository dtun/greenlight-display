# PRD: Greenlight Mobile API Discovery

## Overview

**Problem**: The current browser-based scraper approach is blocked by mandatory 2FA on every authentication attempt. The Greenlight mobile app likely uses an API that may have more favorable authentication characteristics (longer-lived tokens, refresh tokens, or session persistence).

**Goal**: Discover if the Greenlight mobile app exposes API endpoints that return child balance data, and document findings for potential implementation.

**Success Criteria**: Identify any API endpoint that returns child balance data.

---

## Scope

### In Scope

- Intercept and document Greenlight iOS app network traffic
- Identify authentication flow and token mechanisms
- Find endpoint(s) that return child balance data
- Document findings in project docs

### Out of Scope

- Building the implementation (decision comes after discovery)
- Transaction history, spending categories, or other account data
- Android app analysis
- ToS compliance determination (document findings regardless)

---

## Technical Approach

### Phase 1: Environment Setup (~15 min)

**Prerequisites**:

- macOS with Charles Proxy installed
- iOS device on same network
- Greenlight app installed with valid credentials

**Steps**:

1. Configure Charles Proxy for SSL proxying
2. Install Charles root certificate on iOS device
3. Configure iOS to use Charles as HTTP proxy
4. Test with a non-pinned app to verify setup

**SSL Pinning Consideration**:
If Greenlight uses certificate pinning, traffic will fail. Document this as a finding - it may require:

- A) Jailbroken device with SSL Kill Switch
- B) Using an older app version (if available)
- C) Alternative approach (Android with Frida, etc.)

### Phase 2: Traffic Capture (~30 min)

**Capture Scenarios**:

1. Fresh app launch (cold start)
2. Login flow with 2FA
3. Navigate to child balance screen
4. Background/foreground the app (token refresh behavior)
5. Pull-to-refresh on balance screen

**Data to Capture**:

- Base URL / API host
- Authentication endpoints and payload structure
- Token format (JWT, opaque, etc.)
- Balance endpoint request/response
- Any refresh token mechanisms
- Request headers (API keys, app version, device ID)

### Phase 3: Documentation (~15 min)

**Deliverables**:

1. `docs/api-discovery.md` - Raw findings with request/response examples
2. Update `reference-files/greenlight-trmnl-architecture.md` - Add API alternative section
3. If viable: Draft `reference-files/prompt-04-alt-api-scraper.md` - Alternative implementation prompt

---

## Expected Findings Structure

```markdown
## API Discovery Results

### Base URL

- Host: `api.greenlight.com` (or similar)
- Protocol: HTTPS
- API Version: (if apparent)

### Authentication

- Login endpoint:
- Token type:
- Token lifetime: (if determinable)
- Refresh mechanism:
- 2FA behavior:

### Balance Endpoint

- Method:
- Path:
- Headers required:
- Response format:
- Sample response (sanitized):

### Viability Assessment

- [ ] API endpoint exists
- [ ] Returns balance data
- [ ] Token mechanism understood
- [ ] Appears viable for automation
```

---

## Risks & Mitigations

| Risk                            | Likelihood | Mitigation                                       |
| ------------------------------- | ---------- | ------------------------------------------------ |
| SSL pinning blocks inspection   | Medium     | Document as finding; note alternative approaches |
| API requires device attestation | Low        | May be visible in headers; document if present   |
| Tokens are very short-lived     | Medium     | Document refresh mechanism if present            |
| API is GraphQL/complex          | Low        | Still document; may be usable                    |

---

## Decision Gate

After discovery, answer:

1. **Is there a balance API?** (Yes/No)
2. **Can we authenticate programmatically?** (Yes/No/Maybe)
3. **Is token management feasible?** (Yes/No/Unknown)

**If all Yes**: Proceed to implementation prompt (new Prompt 04 variant)
**If any No/Unknown**: Document blockers, evaluate alternatives

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

## Timeline

| Phase     | Duration | Output                   |
| --------- | -------- | ------------------------ |
| Setup     | 15 min   | Charles + iOS configured |
| Capture   | 30 min   | Raw traffic data         |
| Document  | 15 min   | Findings in docs/        |
| **Total** | ~1 hour  | Discovery complete       |
