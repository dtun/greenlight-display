#!/usr/bin/env bash
#
# setup.sh - Initial project setup for Greenlight Scraper
#
# DESCRIPTION:
#   This script automates the initial setup of the Greenlight Scraper project.
#   It installs dependencies, verifies the development environment, and runs
#   initial checks to ensure everything is properly configured.
#
# PREREQUISITES:
#   - Bun runtime installed (https://bun.sh)
#   - Git repository cloned
#
# USAGE:
#   ./scripts/setup.sh [options]
#
# OPTIONS:
#   --skip-install  - Skip installing dependencies
#   --skip-checks   - Skip running validation checks (typecheck, format)
#   --ci            - Run in CI mode (non-interactive, stricter checks)
#
# EXAMPLES:
#   ./scripts/setup.sh                  # Full setup with all checks
#   ./scripts/setup.sh --skip-checks    # Quick setup, skip validation
#   ./scripts/setup.sh --ci             # CI mode for automated environments
#
# EXIT CODES:
#   0 - Success
#   1 - Prerequisites not met
#   2 - Dependency installation failed
#   3 - Validation checks failed
#

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIN_BUN_VERSION="1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
SKIP_INSTALL=false
SKIP_CHECKS=false
CI_MODE=false

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

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --skip-install)
                SKIP_INSTALL=true
                shift
                ;;
            --skip-checks)
                SKIP_CHECKS=true
                shift
                ;;
            --ci)
                CI_MODE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-install  Skip installing dependencies"
    echo "  --skip-checks   Skip running validation checks"
    echo "  --ci            Run in CI mode (non-interactive)"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Full setup"
    echo "  $0 --skip-checks       # Quick setup"
    echo "  $0 --ci                # CI mode"
}

# Version comparison helper
version_gte() {
    # Returns 0 if $1 >= $2
    printf '%s\n%s' "$2" "$1" | sort -V -C
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking Prerequisites"

    local has_errors=false

    # Check for Bun
    if ! command -v bun &> /dev/null; then
        log_error "Bun is not installed"
        echo "  Install from: https://bun.sh"
        echo "  Run: curl -fsSL https://bun.sh/install | bash"
        has_errors=true
    else
        local bun_version
        bun_version=$(bun --version 2>/dev/null || echo "0.0.0")
        if version_gte "$bun_version" "$MIN_BUN_VERSION"; then
            log_success "Bun v${bun_version} installed"
        else
            log_warn "Bun v${bun_version} found, but v${MIN_BUN_VERSION}+ recommended"
        fi
    fi

    # Check for Git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        has_errors=true
    else
        log_success "Git $(git --version | cut -d' ' -f3) installed"
    fi

    # Check if we're in the project root
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Not in project root (package.json not found)"
        has_errors=true
    fi

    # Check for wrangler (optional but recommended)
    if ! command -v wrangler &> /dev/null; then
        log_warn "Wrangler CLI not installed (needed for deployment)"
        echo "  Install with: npm install -g wrangler"
    else
        log_success "Wrangler $(wrangler --version 2>/dev/null | head -1) installed"
    fi

    if [[ "$has_errors" == true ]]; then
        log_error "Prerequisites check failed"
        exit 1
    fi

    log_success "All prerequisites met"
}

# Install dependencies
install_dependencies() {
    log_step "Installing Dependencies"

    if [[ "$SKIP_INSTALL" == true ]]; then
        log_warn "Skipping dependency installation (--skip-install)"
        return 0
    fi

    cd "$PROJECT_ROOT"

    log_info "Running bun install..."
    if ! bun install; then
        log_error "Dependency installation failed"
        exit 2
    fi

    log_success "Dependencies installed"
}

# Run validation checks
run_checks() {
    log_step "Running Validation Checks"

    if [[ "$SKIP_CHECKS" == true ]]; then
        log_warn "Skipping validation checks (--skip-checks)"
        return 0
    fi

    cd "$PROJECT_ROOT"
    local has_errors=false

    # Type checking
    log_info "Running type check..."
    if bun run typecheck; then
        log_success "Type check passed"
    else
        log_error "Type check failed"
        has_errors=true
    fi

    # Format check
    log_info "Running format check..."
    if bun run format:check 2>/dev/null; then
        log_success "Format check passed"
    else
        log_warn "Format check failed - run 'bun run format' to fix"
        if [[ "$CI_MODE" == true ]]; then
            has_errors=true
        fi
    fi

    # Run tests
    log_info "Running tests..."
    if bun test; then
        log_success "All tests passed"
    else
        log_error "Tests failed"
        has_errors=true
    fi

    if [[ "$has_errors" == true ]]; then
        log_error "Validation checks failed"
        exit 3
    fi

    log_success "All validation checks passed"
}

# Print project info
print_project_info() {
    log_step "Project Information"

    cd "$PROJECT_ROOT"

    echo ""
    echo "  Project:     $(grep '"name"' package.json | cut -d'"' -f4)"
    echo "  Version:     $(grep '"version"' package.json | cut -d'"' -f4)"
    echo "  Location:    ${PROJECT_ROOT}"
    echo ""

    # List workspaces
    log_info "Workspaces:"
    if [[ -d "${PROJECT_ROOT}/packages" ]]; then
        for pkg in "${PROJECT_ROOT}"/packages/*/; do
            if [[ -f "${pkg}package.json" ]]; then
                local pkg_name
                pkg_name=$(grep '"name"' "${pkg}package.json" | cut -d'"' -f4)
                echo "    - ${pkg_name}"
            fi
        done
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Setup Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Configure Cloudflare (if not done):"
    echo "     wrangler login"
    echo "     ./scripts/cf-setup.sh"
    echo "     ./scripts/cf-secrets.sh"
    echo ""
    echo "  2. Start development:"
    echo "     bun run dev"
    echo ""
    echo "  3. Run tests:"
    echo "     bun test"
    echo ""
    echo "  4. Deploy (when ready):"
    echo "     ./scripts/cf-deploy.sh staging"
    echo ""
    echo "For more information, see docs/CLOUDFLARE_DEPLOYMENT.md"
    echo ""
}

# Main function
main() {
    parse_args "$@"

    echo ""
    echo "============================================"
    echo "  Greenlight Scraper - Project Setup"
    echo "============================================"

    if [[ "$CI_MODE" == true ]]; then
        log_info "Running in CI mode"
    fi

    check_prerequisites
    install_dependencies
    run_checks
    print_project_info
    print_next_steps
}

main "$@"
