#!/bin/bash

# Tunnel Script
# Configuration loaded from .env (root, gitignored) and .env.tunnel (per-app, git-tracked)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=tunnel-lib.sh
source "$SCRIPT_DIR/tunnel-lib.sh"

# --- Defaults ---
TUNNEL_DRY_RUN=false
TUNNEL_APP_ENV_ARG=""

# --- CLI Parsing ---
usage() {
    cat <<EOF
Usage: tunnel.sh [options]

Configuration Precedence:
  1. CLI options (--host, --port, --plugins)
  2. Root .env (user-specific, gitignored) - TUNNEL_PLUGINS
  3. Per-app .env.tunnel (app config, git-tracked)
  4. Default values

Options:
  --config <path>     Path to .env.tunnel file (default: ./.env.tunnel)
  --host <name>       Override TUNNEL_HOST
  --port <number>     Override TUNNEL_PORT / TUNNEL_MAIN_PORT
  --env <path>        Path to root .env (default: auto-detect, walk up from CWD)
  --plugins <list>    Override TUNNEL_PLUGINS (comma-separated, e.g. core,dashboard)
  --dry-run           Print resolved config and exit without starting anything
  --list              Discover all .env.tunnel files in the project
  -h, --help          Show this help message

Examples:
  # Start with all plugins from .env.tunnel:
  tunnel.sh

  # Start with specific plugins (CLI override):
  tunnel.sh --plugins core,dashboard

  # API docs mode (use root .env TUNNEL_PLUGINS=dashboard):
  tunnel.sh --config apps/docs/.env.tunnel
  tunnel.sh                                # uses .env.tunnel in CWD
  tunnel.sh --config apps/docs             # uses apps/docs/.env.tunnel
  tunnel.sh --host custom --port 8080      # override host and port
  tunnel.sh --list                         # show available configs
  tunnel.sh --dry-run                      # validate config without starting
EOF
    exit 0
}

tunnel_list_configs() {
    echo "Available .env.tunnel configurations:"
    echo
    local files
    files="$(find "$SCRIPT_DIR" -name ".env.tunnel" -not -path "*/node_modules/*" 2>/dev/null | sort)" || true
    if [ -z "$files" ]; then
        echo "  No .env.tunnel files found."
        echo
        return
    fi
    while IFS= read -r file; do
        local host
        host="$(grep -E '^TUNNEL_HOST=' "$file" 2>/dev/null | cut -d'=' -f2)" || true
        local mode
        mode="$(grep -E '^TUNNEL_MODE=' "$file" 2>/dev/null | cut -d'=' -f2)" || true
        mode="${mode:-single}"
        if [ -z "$host" ]; then
            host="$(grep -E '^TUNNEL_MAIN_HOST=' "$file" 2>/dev/null | cut -d'=' -f2)" || true
        fi
        printf "  %-40s  host=%-12s  mode=%s\n" "$file" "${host:-?}" "$mode"
    done <<< "$files"
    echo
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --config)
            TUNNEL_APP_ENV_ARG="$2"
            shift 2
            ;;
        --host)
            TUNNEL_HOST_OVERRIDE="$2"
            shift 2
            ;;
        --port)
            TUNNEL_PORT_OVERRIDE="$2"
            shift 2
            ;;
        --env)
            TUNNEL_ROOT_ENV="$2"
            export TUNNEL_ROOT_ENV
            shift 2
            ;;
        --plugins)
            TUNNEL_PLUGINS_OVERRIDE="$2"
            shift 2
            ;;
        --dry-run)
            TUNNEL_DRY_RUN=true
            shift
            ;;
        --list)
            tunnel_list_configs
            exit 0
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            ;;
    esac
done

# --- Load Config ---

# 1. Root .env (infrastructure secrets, gitignored)
tunnel_load_root_env

# Capture TUNNEL_PLUGINS from root .env BEFORE loading app config
# This allows user-specific plugin selection in gitignored .env
TUNNEL_PLUGINS_FROM_ROOT="${TUNNEL_PLUGINS:-}"

# 2. Per-app .env.tunnel (app config, git-tracked)
tunnel_load_app_env "$TUNNEL_APP_ENV_ARG"

# 3. CLI overrides for TUNNEL_PLUGINS take highest precedence
[ -n "${TUNNEL_PLUGINS_OVERRIDE:-}" ] && TUNNEL_PLUGINS="$TUNNEL_PLUGINS_OVERRIDE"

# 3. CLI overrides
[ -n "${TUNNEL_HOST_OVERRIDE:-}" ] && TUNNEL_HOST="$TUNNEL_HOST_OVERRIDE"
[ -n "${TUNNEL_PORT_OVERRIDE:-}" ] && TUNNEL_PORT="$TUNNEL_PORT_OVERRIDE"
[ -n "${TUNNEL_PORT_OVERRIDE:-}" ] && TUNNEL_MAIN_PORT="$TUNNEL_PORT_OVERRIDE"

# 4. Resolve paths relative to script dir
TUNNEL_APP_DIR="$(cd "$SCRIPT_DIR/$TUNNEL_APP_DIR" 2>/dev/null && pwd || echo "$SCRIPT_DIR/$TUNNEL_APP_DIR")"

if [ "${TUNNEL_MODE:-single}" = "multi" ]; then
    TUNNEL_MAIN_APP_DIR="$(cd "$SCRIPT_DIR/$TUNNEL_MAIN_APP_DIR" 2>/dev/null && pwd || echo "$SCRIPT_DIR/$TUNNEL_MAIN_APP_DIR")"

    if [ -n "${TUNNEL_PLUGIN_CONFIG:-}" ]; then
        TUNNEL_PLUGIN_CONFIG="$SCRIPT_DIR/$TUNNEL_PLUGIN_CONFIG"
    fi

    if [ -n "${TUNNEL_PLUGINS_BASE_DIR:-}" ]; then
        TUNNEL_PLUGINS_BASE_DIR="$SCRIPT_DIR/$TUNNEL_PLUGINS_BASE_DIR"
    fi
fi

# 5. Validate
tunnel_validate_config

# --- Dry Run ---
if [ "$TUNNEL_DRY_RUN" = true ]; then
    echo
    echo "=== Resolved Tunnel Configuration ==="
    echo "  TUNNEL_MODE         = ${TUNNEL_MODE:-single}"
    echo "  TUNNEL_DOMAIN        = $TUNNEL_DOMAIN"
    echo "  PIKO_SERVICE         = $PIKO_SERVICE"
    echo "  TUNNEL_APP_DIR       = $TUNNEL_APP_DIR"

    if [ "${TUNNEL_MODE:-single}" = "multi" ]; then
        echo "  TUNNEL_MAIN_HOST     = $TUNNEL_MAIN_HOST"
        echo "  TUNNEL_MAIN_APP_DIR  = $TUNNEL_MAIN_APP_DIR"
        echo "  TUNNEL_MAIN_PORT     = ${TUNNEL_MAIN_PORT:-4173}"
        echo "  TUNNEL_SERVER_CMD    = ${TUNNEL_SERVER_CMD:-pnpm serve}"
        echo "  TUNNEL_PLUGIN_CONFIG = ${TUNNEL_PLUGIN_CONFIG:-<none>}"
    else
        echo "  TUNNEL_HOST          = $TUNNEL_HOST"
        echo "  TUNNEL_PORT          = ${TUNNEL_PORT:-4173}"
        echo "  TUNNEL_SERVER_CMD    = ${TUNNEL_SERVER_CMD:-pnpm preview}"
        echo "  TUNNEL_SERVER_ARGS   = ${TUNNEL_SERVER_ARGS:-}"
    fi

    echo
    echo "Configuration valid. Exiting (dry-run)."
    exit 0
fi

# --- Execute ---
if [ "${TUNNEL_MODE:-single}" = "multi" ]; then
    tunnel_multi_app
else
    # Build server command with optional args
    local_port="${TUNNEL_PORT:-$(tunnel_find_open_port 4173)}"

    server_cmd="${TUNNEL_SERVER_CMD:-pnpm preview}"

    if [ -n "${TUNNEL_SERVER_ARGS:-}" ]; then
        server_cmd="$server_cmd $TUNNEL_SERVER_ARGS"
    fi

    # Substitute {PORT} placeholder in server args if present
    server_cmd="${server_cmd//\{PORT\}/$local_port}"

    tunnel_single_app "$TUNNEL_APP_DIR" "$local_port" "$TUNNEL_HOST" \
        "${TUNNEL_APP_NAME:-app}" "$server_cmd"
fi
