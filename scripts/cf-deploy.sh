#!/usr/bin/env bash
#
# cf-deploy.sh - Deploy Greenlight Scraper to Cloudflare Workers
#
# DESCRIPTION:
#   This script deploys the Greenlight Scraper API to Cloudflare Workers.
#   It supports deployment to different environments (development, staging,
#   production) and includes pre-deployment checks.
#
# PREREQUISITES:
#   - Wrangler CLI installed (npm install -g wrangler)
#   - Authenticated with Cloudflare (wrangler login)
#   - KV namespaces created (./scripts/cf-setup.sh)
#   - Secrets configured (./scripts/cf-secrets.sh)
#   - Project built successfully (bun run build)
#
# USAGE:
#   ./scripts/cf-deploy.sh <environment> [options]
#
# ARGUMENTS:
#   environment  - Required. One of: development, staging, production
#
# OPTIONS:
#   --dry-run    - Show what would be deployed without deploying
#   --skip-build - Skip the build step (use existing build)
#   --skip-tests - Skip running tests before deployment
#
# EXAMPLES:
#   ./scripts/cf-deploy.sh development           # Deploy to dev
#   ./scripts/cf-deploy.sh production            # Deploy to production
#   ./scripts/cf-deploy.sh staging --dry-run    # Preview staging deployment
#   ./scripts/cf-deploy.sh production --skip-build  # Deploy without rebuilding
#

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRAPER_DIR="${PROJECT_ROOT}/packages/scraper"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
DRY_RUN=false
SKIP_BUILD=false
SKIP_TESTS=false

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
parse_args() {
    if [[ $# -lt 1 ]]; then
        log_error "Environment argument required"
        echo ""
        echo "Usage: $0 <environment> [options]"
        echo ""
        echo "Environments: development, staging, production"
        echo "Options: --dry-run, --skip-build, --skip-tests"
        exit 1
    fi

    ENVIRONMENT="$1"
    shift

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Validate environment
    case "$ENVIRONMENT" in
        development|dev)
            ENVIRONMENT="development"
            ;;
        staging)
            ;;
        production|prod)
            ENVIRONMENT="production"
            ;;
        *)
            log_error "Invalid environment: ${ENVIRONMENT}"
            echo "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Install it with: npm install -g wrangler"
        exit 1
    fi

    if ! command -v bun &> /dev/null; then
        log_error "Bun is not installed. Install it from: https://bun.sh"
        exit 1
    fi

    # Check if authenticated
    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi

    # Check wrangler.toml exists
    if [[ ! -f "${SCRAPER_DIR}/wrangler.toml" ]]; then
        log_error "wrangler.toml not found at ${SCRAPER_DIR}/wrangler.toml"
        exit 1
    fi

    # Check if KV namespace IDs are configured (not placeholders)
    if grep -q "placeholder" "${SCRAPER_DIR}/wrangler.toml"; then
        log_warn "wrangler.toml contains placeholder KV namespace IDs"
        log_warn "Run ./scripts/cf-setup.sh first to create KV namespaces"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            log_error "Cannot deploy to production with placeholder IDs"
            exit 1
        fi
    fi

    log_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_warn "Skipping tests (--skip-tests flag)"
        return 0
    fi

    log_info "Running tests..."
    cd "$PROJECT_ROOT"

    if ! bun test; then
        log_error "Tests failed. Fix tests before deploying."
        exit 1
    fi

    log_success "All tests passed"
}

# Build the project
build_project() {
    if [[ "$SKIP_BUILD" == true ]]; then
        log_warn "Skipping build (--skip-build flag)"
        return 0
    fi

    log_info "Building project..."
    cd "$PROJECT_ROOT"

    if ! bun run build; then
        log_error "Build failed"
        exit 1
    fi

    log_success "Build completed"
}

# Run type checking
run_typecheck() {
    log_info "Running type check..."
    cd "$PROJECT_ROOT"

    if ! bun run typecheck; then
        log_error "Type check failed"
        exit 1
    fi

    log_success "Type check passed"
}

# Deploy to Cloudflare
deploy() {
    log_info "Deploying to ${ENVIRONMENT}..."
    cd "$SCRAPER_DIR"

    local deploy_cmd="wrangler deploy --env ${ENVIRONMENT}"

    if [[ "$DRY_RUN" == true ]]; then
        deploy_cmd="${deploy_cmd} --dry-run"
        log_warn "DRY RUN MODE - No actual deployment will occur"
    fi

    echo ""
    log_info "Running: ${deploy_cmd}"
    echo ""

    if eval "$deploy_cmd"; then
        if [[ "$DRY_RUN" == true ]]; then
            log_success "Dry run completed successfully"
        else
            log_success "Deployment to ${ENVIRONMENT} completed!"
        fi
    else
        log_error "Deployment failed"
        exit 1
    fi
}

# Production confirmation
confirm_production() {
    if [[ "$ENVIRONMENT" != "production" ]]; then
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        return 0
    fi

    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  WARNING: Production Deployment${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo "You are about to deploy to PRODUCTION."
    echo "This will affect live users."
    echo ""
    read -p "Type 'yes' to confirm: " confirmation

    if [[ "$confirmation" != "yes" ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
}

# Print deployment summary
print_summary() {
    echo ""
    echo "============================================"
    echo "  Deployment Summary"
    echo "============================================"
    echo ""
    echo "  Environment: ${ENVIRONMENT}"
    echo "  Dry Run:     ${DRY_RUN}"
    echo "  Skip Build:  ${SKIP_BUILD}"
    echo "  Skip Tests:  ${SKIP_TESTS}"
    echo ""
}

# Main function
main() {
    parse_args "$@"

    echo ""
    echo "============================================"
    echo "  Cloudflare Workers Deployment"
    echo "  Greenlight Scraper"
    echo "============================================"

    print_summary
    check_prerequisites
    confirm_production
    run_typecheck
    run_tests
    build_project
    deploy

    echo ""
    if [[ "$DRY_RUN" != true ]]; then
        echo "Next steps:"
        echo "  - Check deployment: wrangler tail --env ${ENVIRONMENT}"
        echo "  - View logs: https://dash.cloudflare.com"
        echo ""
    fi
}

main "$@"
