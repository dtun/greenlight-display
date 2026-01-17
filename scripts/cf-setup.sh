#!/usr/bin/env bash
#
# cf-setup.sh - Create Cloudflare KV namespaces for Greenlight Scraper
#
# DESCRIPTION:
#   This script creates the required KV namespaces for the Greenlight Scraper
#   across all environments (development, staging, production). It uses the
#   Wrangler CLI to provision namespaces and outputs the namespace IDs that
#   need to be added to wrangler.toml.
#
# PREREQUISITES:
#   - Wrangler CLI installed (npm install -g wrangler)
#   - Authenticated with Cloudflare (wrangler login)
#   - Account ID set via CLOUDFLARE_ACCOUNT_ID env var or wrangler.toml
#
# USAGE:
#   ./scripts/cf-setup.sh [environment]
#
# ARGUMENTS:
#   environment  - Optional. One of: development, staging, production, all
#                  Defaults to 'all' if not specified.
#
# EXAMPLES:
#   ./scripts/cf-setup.sh              # Create all KV namespaces
#   ./scripts/cf-setup.sh development  # Create only development namespace
#   ./scripts/cf-setup.sh production   # Create only production namespace
#
# OUTPUT:
#   Prints the KV namespace IDs to add to wrangler.toml
#

set -euo pipefail

# Configuration
PROJECT_NAME="greenlight-scraper"
KV_NAMESPACE_PREFIX="greenlight-cache"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Install it with: npm install -g wrangler"
        exit 1
    fi

    # Check if authenticated
    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create a KV namespace
create_kv_namespace() {
    local namespace_name="$1"
    local env_label="$2"

    log_info "Creating KV namespace: ${namespace_name}"

    # Check if namespace already exists
    local existing_id
    existing_id=$(wrangler kv namespace list 2>/dev/null | grep -w "${namespace_name}" | awk '{print $1}' || true)

    if [[ -n "$existing_id" ]]; then
        log_warn "Namespace '${namespace_name}' already exists with ID: ${existing_id}"
        echo "$existing_id"
        return 0
    fi

    # Create namespace
    local output
    output=$(wrangler kv namespace create "${namespace_name}" 2>&1)

    # Extract ID from output
    local namespace_id
    namespace_id=$(echo "$output" | grep -oE 'id = "[^"]+"' | cut -d'"' -f2 || true)

    if [[ -z "$namespace_id" ]]; then
        log_error "Failed to create namespace '${namespace_name}'"
        log_error "Output: $output"
        exit 1
    fi

    log_success "Created namespace '${namespace_name}' with ID: ${namespace_id}"
    echo "$namespace_id"
}

# Create namespaces for an environment
setup_environment() {
    local env="$1"
    local namespace_name="${KV_NAMESPACE_PREFIX}-${env}"

    log_info "Setting up ${env} environment..."

    local namespace_id
    namespace_id=$(create_kv_namespace "$namespace_name" "$env")

    echo ""
    echo -e "${GREEN}=== ${env^^} Environment ===${NC}"
    echo "Add this to your wrangler.toml:"
    echo ""

    if [[ "$env" == "production" ]]; then
        echo "# Production (base config)"
        echo "[[kv_namespaces]]"
        echo "binding = \"CACHE\""
        echo "id = \"${namespace_id}\""
    else
        echo "[[env.${env}.kv_namespaces]]"
        echo "binding = \"CACHE\""
        echo "id = \"${namespace_id}\""
    fi
    echo ""
}

# Main function
main() {
    local target_env="${1:-all}"

    echo ""
    echo "============================================"
    echo "  Cloudflare KV Namespace Setup"
    echo "  Project: ${PROJECT_NAME}"
    echo "============================================"
    echo ""

    check_prerequisites

    case "$target_env" in
        development|dev)
            setup_environment "development"
            ;;
        staging)
            setup_environment "staging"
            ;;
        production|prod)
            setup_environment "production"
            ;;
        all)
            setup_environment "development"
            setup_environment "staging"
            setup_environment "production"
            ;;
        *)
            log_error "Unknown environment: ${target_env}"
            echo "Valid options: development, staging, production, all"
            exit 1
            ;;
    esac

    echo ""
    log_success "KV namespace setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Copy the namespace IDs above to packages/scraper/wrangler.toml"
    echo "  2. Run ./scripts/cf-secrets.sh to set up secrets"
    echo "  3. Run ./scripts/cf-deploy.sh to deploy"
    echo ""
}

main "$@"
