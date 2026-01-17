#!/usr/bin/env bash
#
# test-deployment.sh - Validate Greenlight Scraper deployment
#
# DESCRIPTION:
#   This script validates a deployed Greenlight Scraper instance by running
#   health checks and verifying API endpoints are responding correctly.
#   Use this after deployment to confirm the service is working properly.
#
# PREREQUISITES:
#   - curl installed (usually pre-installed on most systems)
#   - jq installed for JSON parsing (optional but recommended)
#   - A deployed instance of the Greenlight Scraper
#
# USAGE:
#   ./scripts/test-deployment.sh <environment|url> [options]
#
# ARGUMENTS:
#   environment  - One of: development, staging, production
#                  OR a custom URL to test against
#
# OPTIONS:
#   --verbose    - Show detailed output for each check
#   --timeout N  - Set request timeout in seconds (default: 10)
#   --retries N  - Number of retries for failed checks (default: 3)
#
# EXAMPLES:
#   ./scripts/test-deployment.sh staging               # Test staging deployment
#   ./scripts/test-deployment.sh production --verbose  # Test production with details
#   ./scripts/test-deployment.sh https://my-worker.workers.dev  # Test custom URL
#
# EXIT CODES:
#   0 - All checks passed
#   1 - Invalid arguments or prerequisites not met
#   2 - Health check failed
#   3 - API endpoint check failed
#

set -euo pipefail

# Configuration - Update these URLs for your deployment
DEVELOPMENT_URL="${GREENLIGHT_DEV_URL:-https://greenlight-scraper-dev.workers.dev}"
STAGING_URL="${GREENLIGHT_STAGING_URL:-https://greenlight-scraper-staging.workers.dev}"
PRODUCTION_URL="${GREENLIGHT_PROD_URL:-https://greenlight-scraper.workers.dev}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
VERBOSE=false
TIMEOUT=10
RETRIES=3
BASE_URL=""

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Parse command line arguments
parse_args() {
    if [[ $# -lt 1 ]]; then
        log_error "Environment or URL argument required"
        echo ""
        echo "Usage: $0 <environment|url> [options]"
        echo ""
        echo "Environments: development, staging, production"
        echo "Options: --verbose, --timeout N, --retries N"
        exit 1
    fi

    local target="$1"
    shift

    # Determine if target is URL or environment name
    if [[ "$target" =~ ^https?:// ]]; then
        BASE_URL="$target"
    else
        case "$target" in
            development|dev)
                BASE_URL="$DEVELOPMENT_URL"
                ;;
            staging)
                BASE_URL="$STAGING_URL"
                ;;
            production|prod)
                BASE_URL="$PRODUCTION_URL"
                ;;
            *)
                log_error "Invalid environment: ${target}"
                echo "Valid environments: development, staging, production"
                echo "Or provide a full URL (e.g., https://my-worker.workers.dev)"
                exit 1
                ;;
        esac
    fi

    # Parse options
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --timeout)
                TIMEOUT="${2:-10}"
                shift 2
                ;;
            --retries)
                RETRIES="${2:-3}"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

show_help() {
    echo "Usage: $0 <environment|url> [options]"
    echo ""
    echo "Arguments:"
    echo "  environment  One of: development, staging, production"
    echo "               Or a custom URL to test against"
    echo ""
    echo "Options:"
    echo "  --verbose    Show detailed output"
    echo "  --timeout N  Request timeout in seconds (default: 10)"
    echo "  --retries N  Number of retries (default: 3)"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GREENLIGHT_DEV_URL      Override development URL"
    echo "  GREENLIGHT_STAGING_URL  Override staging URL"
    echo "  GREENLIGHT_PROD_URL     Override production URL"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_warn "jq is not installed - JSON parsing will be limited"
    fi

    log_success "Prerequisites check passed"
}

# Make HTTP request with retries
make_request() {
    local url="$1"
    local expected_status="${2:-200}"
    local attempt=1

    while [[ $attempt -le $RETRIES ]]; do
        log_verbose "Attempt $attempt of $RETRIES: GET $url"

        local response
        local http_code

        # Make request and capture both body and status code
        response=$(curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo -e "\n000")
        http_code=$(echo "$response" | tail -1)
        local body
        body=$(echo "$response" | sed '$d')

        log_verbose "HTTP Status: $http_code"

        if [[ "$http_code" == "$expected_status" ]]; then
            echo "$body"
            return 0
        fi

        if [[ $attempt -lt $RETRIES ]]; then
            log_verbose "Retrying in 2 seconds..."
            sleep 2
        fi

        ((attempt++))
    done

    log_verbose "All $RETRIES attempts failed"
    return 1
}

# Check health endpoint
check_health() {
    log_info "Checking health endpoint..."

    local health_url="${BASE_URL}/health"
    log_verbose "URL: $health_url"

    local response
    if response=$(make_request "$health_url" "200"); then
        log_success "Health check passed"

        if [[ "$VERBOSE" == true ]] && command -v jq &> /dev/null; then
            echo "$response" | jq . 2>/dev/null || echo "$response"
        fi

        return 0
    else
        log_error "Health check failed"
        return 1
    fi
}

# Check root endpoint
check_root() {
    log_info "Checking root endpoint..."

    local root_url="${BASE_URL}/"
    log_verbose "URL: $root_url"

    local response
    if response=$(make_request "$root_url" "200"); then
        log_success "Root endpoint check passed"

        if [[ "$VERBOSE" == true ]]; then
            echo "$response" | head -20
        fi

        return 0
    else
        log_error "Root endpoint check failed"
        return 1
    fi
}

# Check API endpoint (without auth - expects 401 or similar)
check_api_auth() {
    log_info "Checking API authentication..."

    local api_url="${BASE_URL}/api/balances"
    log_verbose "URL: $api_url (expecting 401 Unauthorized)"

    local response
    local http_code

    # We expect this to fail with 401 since we're not authenticated
    response=$(curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" "$api_url" 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -1)

    log_verbose "HTTP Status: $http_code"

    # 401 means auth is working, 403 means some form of access control
    if [[ "$http_code" == "401" ]] || [[ "$http_code" == "403" ]]; then
        log_success "API authentication is enforced (HTTP $http_code)"
        return 0
    elif [[ "$http_code" == "200" ]]; then
        log_warn "API returned 200 without auth - check security configuration"
        return 0
    elif [[ "$http_code" == "404" ]]; then
        log_warn "API endpoint not found (404) - endpoint may not be deployed yet"
        return 0
    else
        log_error "Unexpected response from API (HTTP $http_code)"
        return 1
    fi
}

# Check response time
check_response_time() {
    log_info "Checking response time..."

    local health_url="${BASE_URL}/health"
    local start_time
    local end_time
    local duration

    start_time=$(date +%s%3N 2>/dev/null || date +%s)

    if curl -s -o /dev/null --max-time "$TIMEOUT" "$health_url"; then
        end_time=$(date +%s%3N 2>/dev/null || date +%s)
        duration=$((end_time - start_time))

        if [[ $duration -lt 1000 ]]; then
            log_success "Response time: ${duration}ms"
        elif [[ $duration -lt 3000 ]]; then
            log_warn "Response time: ${duration}ms (consider optimizing)"
        else
            log_warn "Response time: ${duration}ms (slow)"
        fi
    else
        log_error "Request timed out"
        return 1
    fi
}

# Print test summary
print_summary() {
    local passed="$1"
    local failed="$2"
    local total=$((passed + failed))

    echo ""
    echo "============================================"
    echo "  Test Summary"
    echo "============================================"
    echo ""
    echo "  URL:     ${BASE_URL}"
    echo "  Passed:  ${passed}/${total}"
    echo "  Failed:  ${failed}/${total}"
    echo ""

    if [[ $failed -eq 0 ]]; then
        echo -e "${GREEN}All checks passed!${NC}"
    else
        echo -e "${RED}Some checks failed.${NC}"
    fi
    echo ""
}

# Main function
main() {
    parse_args "$@"

    echo ""
    echo "============================================"
    echo "  Deployment Validation Tests"
    echo "  Greenlight Scraper"
    echo "============================================"
    echo ""
    echo "  Target: ${BASE_URL}"
    echo "  Timeout: ${TIMEOUT}s"
    echo "  Retries: ${RETRIES}"
    echo ""

    check_prerequisites

    local passed=0
    local failed=0

    # Run checks
    echo ""
    echo "Running checks..."
    echo ""

    if check_health; then
        ((passed++))
    else
        ((failed++))
    fi

    if check_root; then
        ((passed++))
    else
        ((failed++))
    fi

    if check_api_auth; then
        ((passed++))
    else
        ((failed++))
    fi

    if check_response_time; then
        ((passed++))
    else
        ((failed++))
    fi

    print_summary "$passed" "$failed"

    if [[ $failed -gt 0 ]]; then
        exit 2
    fi
}

main "$@"
