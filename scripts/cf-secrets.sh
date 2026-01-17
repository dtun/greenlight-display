#!/usr/bin/env bash
#
# cf-secrets.sh - Manage Cloudflare Workers secrets for Greenlight Scraper
#
# DESCRIPTION:
#   This script manages secrets for the Greenlight Scraper API across
#   all environments. It supports setting, listing, and deleting secrets
#   using the Wrangler CLI.
#
# PREREQUISITES:
#   - Wrangler CLI installed (npm install -g wrangler)
#   - Authenticated with Cloudflare (wrangler login)
#
# USAGE:
#   ./scripts/cf-secrets.sh <command> <environment> [options]
#
# COMMANDS:
#   set      - Set a secret value (interactive prompt)
#   list     - List all secrets for an environment
#   delete   - Delete a secret
#   setup    - Interactive setup of all required secrets
#
# ARGUMENTS:
#   environment  - One of: development, staging, production
#
# OPTIONS:
#   --name <name>   - Secret name (required for set/delete)
#   --value <value> - Secret value (optional for set, will prompt if not provided)
#
# EXAMPLES:
#   ./scripts/cf-secrets.sh setup development           # Interactive setup
#   ./scripts/cf-secrets.sh list production             # List all secrets
#   ./scripts/cf-secrets.sh set staging --name API_KEY  # Set secret (prompts for value)
#   ./scripts/cf-secrets.sh delete development --name OLD_SECRET
#
# REQUIRED SECRETS:
#   - GREENLIGHT_USERNAME  - Greenlight account username/email
#   - GREENLIGHT_PASSWORD  - Greenlight account password
#   - API_SECRET_KEY       - API authentication key for TRMNL webhook
#

set -euo pipefail

# Configuration
SCRAPER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../packages/scraper" && pwd)"

# Required secrets for the application
REQUIRED_SECRETS=(
    "GREENLIGHT_USERNAME"
    "GREENLIGHT_PASSWORD"
    "API_SECRET_KEY"
)

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

# Print usage
print_usage() {
    echo ""
    echo "Usage: $0 <command> <environment> [options]"
    echo ""
    echo "Commands:"
    echo "  setup    - Interactive setup of all required secrets"
    echo "  set      - Set a secret value"
    echo "  list     - List all secrets"
    echo "  delete   - Delete a secret"
    echo ""
    echo "Environments: development, staging, production"
    echo ""
    echo "Options:"
    echo "  --name <name>    - Secret name (for set/delete)"
    echo "  --value <value>  - Secret value (for set)"
    echo ""
    echo "Examples:"
    echo "  $0 setup development"
    echo "  $0 list production"
    echo "  $0 set staging --name API_KEY"
    echo "  $0 delete development --name OLD_SECRET"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Install it with: npm install -g wrangler"
        exit 1
    fi

    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi
}

# Validate environment
validate_environment() {
    local env="$1"
    case "$env" in
        development|dev)
            echo "development"
            ;;
        staging)
            echo "staging"
            ;;
        production|prod)
            echo "production"
            ;;
        *)
            log_error "Invalid environment: ${env}"
            echo "Valid environments: development, staging, production" >&2
            exit 1
            ;;
    esac
}

# Set a single secret
set_secret() {
    local env="$1"
    local name="$2"
    local value="${3:-}"

    cd "$SCRAPER_DIR"

    if [[ -z "$value" ]]; then
        echo -n "Enter value for ${name}: "
        read -s value
        echo ""
    fi

    if [[ -z "$value" ]]; then
        log_error "Secret value cannot be empty"
        return 1
    fi

    log_info "Setting secret '${name}' for ${env}..."

    # Use printf to avoid issues with special characters
    if printf '%s' "$value" | wrangler secret put "$name" --env "$env"; then
        log_success "Secret '${name}' set successfully"
    else
        log_error "Failed to set secret '${name}'"
        return 1
    fi
}

# List secrets
list_secrets() {
    local env="$1"

    cd "$SCRAPER_DIR"

    log_info "Listing secrets for ${env}..."
    echo ""

    wrangler secret list --env "$env" || true
}

# Delete a secret
delete_secret() {
    local env="$1"
    local name="$2"

    cd "$SCRAPER_DIR"

    echo ""
    log_warn "You are about to delete secret '${name}' from ${env}"
    read -p "Type 'yes' to confirm: " confirmation

    if [[ "$confirmation" != "yes" ]]; then
        log_info "Deletion cancelled"
        return 0
    fi

    log_info "Deleting secret '${name}' from ${env}..."

    if wrangler secret delete "$name" --env "$env"; then
        log_success "Secret '${name}' deleted"
    else
        log_error "Failed to delete secret '${name}'"
        return 1
    fi
}

# Interactive setup of all required secrets
setup_secrets() {
    local env="$1"

    echo ""
    echo "============================================"
    echo "  Secrets Setup for ${env}"
    echo "============================================"
    echo ""
    echo "This will set up the following required secrets:"
    for secret in "${REQUIRED_SECRETS[@]}"; do
        echo "  - ${secret}"
    done
    echo ""
    log_warn "Secrets will be entered interactively (hidden input)"
    echo ""

    for secret in "${REQUIRED_SECRETS[@]}"; do
        echo ""
        echo -e "${BLUE}Setting up: ${secret}${NC}"

        case "$secret" in
            GREENLIGHT_USERNAME)
                echo "Description: Your Greenlight account email/username"
                ;;
            GREENLIGHT_PASSWORD)
                echo "Description: Your Greenlight account password"
                ;;
            API_SECRET_KEY)
                echo "Description: API key for authenticating TRMNL webhook requests"
                echo "Tip: Generate a secure random key (e.g., openssl rand -hex 32)"
                ;;
        esac

        read -p "Set this secret? (y/n): " confirm
        if [[ "$confirm" =~ ^[Yy] ]]; then
            set_secret "$env" "$secret"
        else
            log_warn "Skipped ${secret}"
        fi
    done

    echo ""
    log_success "Secrets setup complete for ${env}!"
    echo ""
    echo "To verify, run: $0 list ${env}"
    echo ""
}

# Parse command line arguments
parse_args() {
    if [[ $# -lt 2 ]]; then
        print_usage
        exit 1
    fi

    COMMAND="$1"
    ENVIRONMENT=$(validate_environment "$2")
    shift 2

    SECRET_NAME=""
    SECRET_VALUE=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --name)
                SECRET_NAME="$2"
                shift 2
                ;;
            --value)
                SECRET_VALUE="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
}

# Main function
main() {
    if [[ $# -lt 1 ]]; then
        print_usage
        exit 1
    fi

    parse_args "$@"
    check_prerequisites

    case "$COMMAND" in
        setup)
            setup_secrets "$ENVIRONMENT"
            ;;
        set)
            if [[ -z "$SECRET_NAME" ]]; then
                log_error "--name is required for set command"
                exit 1
            fi
            set_secret "$ENVIRONMENT" "$SECRET_NAME" "$SECRET_VALUE"
            ;;
        list)
            list_secrets "$ENVIRONMENT"
            ;;
        delete)
            if [[ -z "$SECRET_NAME" ]]; then
                log_error "--name is required for delete command"
                exit 1
            fi
            delete_secret "$ENVIRONMENT" "$SECRET_NAME"
            ;;
        *)
            log_error "Unknown command: ${COMMAND}"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
