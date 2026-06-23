#!/bin/bash

# Tunnel Library - Shared functions for tunnel scripts
# Source this library in your tunnel scripts

# --- Global State ---
declare -a TUNNEL_PIDS=()
declare -g TUNNEL_SCRIPT_DIR=""
declare -g TUNNEL_DOMAIN=""
declare -g PIKO_SERVICE=""
declare -g PIKO_SECRET=""
declare -g PIKO_TOKEN=""

# --- Auto-initialize on source ---
TUNNEL_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
trap tunnel_cleanup EXIT SIGINT SIGTERM

# --- Initialization ---
tunnel_init() {
    trap tunnel_cleanup EXIT SIGINT SIGTERM
}

# --- Cleanup function ---
tunnel_cleanup() {
    trap - EXIT SIGINT SIGTERM

    # Skip cleanup if no processes were started
    if [ ${#TUNNEL_PIDS[@]} -eq 0 ]; then
        return
    fi

    echo
    echo "Shutting down servers and tunnels..."

    for pid in "${TUNNEL_PIDS[@]}"; do
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "Killing process $pid..."
            kill "$pid" 2>/dev/null
        fi
    done

    if [ $# -gt 0 ]; then
        for port in "$@"; do
            echo "Killing server on port $port..."
            lsof -ti tcp:"$port" 2>/dev/null | xargs kill 2>/dev/null
        done
    fi

    echo "Cleanup complete."
    exit 0
}

# --- Add PID to tracking ---
tunnel_track_pid() {
    TUNNEL_PIDS+=("$1")
}

# --- Kill server by port ---
tunnel_kill_port() {
    local port="$1"
    lsof -ti tcp:"$port" 2>/dev/null | xargs kill 2>/dev/null
}

# --- Generate JWT Token for Piko ---
tunnel_generate_piko_token() {
    local endpoint_name="$1"

    PIKO_TOKEN=$(python3 -c "import time,jwt; t=jwt.encode({'exp':int(time.time())+3600,'piko':{'endpoints':['$endpoint_name']}},'$PIKO_SECRET',algorithm='HS512'); print(t.decode() if isinstance(t,bytes) else t)")

    echo "Generated JWT token for endpoint: $endpoint_name"
}

# --- Prerequisite Checks ---
tunnel_check_prerequisites() {
    local check_jq="${1:-false}"
    local check_piko="${2:-true}"

    if [ "$check_jq" = "true" ]; then
        if ! command -v jq &> /dev/null; then
            echo "Error: jq is not installed. Please install it to continue." >&2
            exit 1
        fi
    fi

    if [ "$check_piko" = "true" ]; then
        if ! command -v piko &> /dev/null; then
            echo "Error: piko is not installed or not in PATH. Please install it to continue." >&2
            exit 1
        fi
    fi

    if ! command -v python3 &> /dev/null; then
        echo "Error: python3 is not installed or not in PATH. Please install it to continue." >&2
        exit 1
    fi

    if ! python3 -c "import jwt" 2>/dev/null; then
        echo "Error: PyJWT is not installed. Install with: pip install pyjwt" >&2
        exit 1
    fi
}

# --- Check directory exists ---
tunnel_check_directory() {
    local dir="$1"
    local description="$2"

    if [ ! -d "$dir" ]; then
        echo "Error: $description not found at $dir" >&2
        exit 1
    fi
}

# --- Check file exists ---
tunnel_check_file() {
    local file="$1"
    local description="$2"

    if [ ! -f "$file" ]; then
        echo "Error: $description not found at $file" >&2
        exit 1
    fi
}

# --- Start application server ---
# Usage: tunnel_start_server <app_dir> <port> <name> [ENV_VAR=value ...] <command> [args...]
tunnel_start_server() {
    local app_dir="$1"
    local port="$2"
    local name="$3"
    shift 3

    if [ ! -d "$app_dir" ]; then
        echo "Warning: Directory '$app_dir' not found. Skipping." >&2
        return 1
    fi

    # Separate env vars (KEY=VALUE) from command parts
    local env_vars=()
    local cmd_parts=()
    local found_cmd=false

    for arg in "$@"; do
        if [ "$found_cmd" = false ] && [[ "$arg" == *=* ]]; then
            env_vars+=("$arg")
        else
            found_cmd=true
            cmd_parts+=("$arg")
        fi
    done

    # Prepend PORT env var (will be overridden if explicitly provided)
    env_vars=("PORT=$port" "${env_vars[@]}")

    # Append --port flag for vite commands that support it
    local cmd_str="${cmd_parts[*]}"
    if [[ "$cmd_str" == *"vite"* ]]; then
        # Check if --port is not already specified
        if [[ "$cmd_str" != *"--port"* ]]; then
            cmd_parts+=("--port" "$port")
        fi
    fi

    echo "Starting $name server from '$app_dir' on port $port..."
    echo "  Env: ${env_vars[*]}"
    echo "  Cmd: ${cmd_parts[*]}"
    (
        cd "$app_dir" || exit
        # Export env vars
        for e in "${env_vars[@]}"; do
            # shellcheck disable=SC2163
            export "$e"
        done
        # Run command through shell to handle multi-word commands
        sh -c "${cmd_parts[*]}" 2>/dev/null
    ) &
    tunnel_track_pid $!
}

# --- Create Piko tunnel ---
tunnel_create_piko_tunnel() {
    local endpoint_name="$1"
    local local_port="$2"
    local description="$3"

    tunnel_generate_piko_token "$endpoint_name"
    echo "Creating piko tunnel for $description: $endpoint_name.$TUNNEL_DOMAIN -> localhost:$local_port"
    piko agent http "$endpoint_name" "$local_port" --connect.url "$PIKO_SERVICE" --connect.token "$PIKO_TOKEN" &
    tunnel_track_pid $!
}

# --- Monitor and wait ---
tunnel_monitor() {
    local pid="${TUNNEL_PIDS[-1]}"
    local message="$1"

    echo
    echo "$message"
    echo "Press Ctrl+C to shut down all processes."

    while ps -p "$pid" > /dev/null 2>&1; do
        sleep 1
    done

    echo
    echo "Process (PID $pid) has terminated. Shutting down..."
}

# --- Get script directory ---
tunnel_get_script_dir() {
    echo "$TUNNEL_SCRIPT_DIR"
}

# --- Get tunnel domain ---
tunnel_get_domain() {
    echo "$TUNNEL_DOMAIN"
}

# --- Find available port starting from given port ---
tunnel_find_open_port() {
    local start_port=${1:-4173}
    local port=$start_port

    while lsof -ti tcp:"$port" >/dev/null 2>&1; do
        port=$((port + 1))
    done

    echo "$port"
}

# --- Config Loading ---

# Find root .env by walking up from start_dir to project root
tunnel_find_root_env() {
    local start_dir="${1:-$TUNNEL_SCRIPT_DIR}"
    local dir="$start_dir"

    while [ "$dir" != "/" ]; do
        if [ -f "$dir/.env" ]; then
            echo "$dir/.env"
            return 0
        fi
        dir="$(dirname "$dir")"
    done

    return 1
}

# Load root .env (infrastructure: TUNNEL_DOMAIN, PIKO_SERVICE, PIKO_SECRET)
tunnel_load_root_env() {
    local env_file=""

    if [ -n "${TUNNEL_ROOT_ENV:-}" ]; then
        env_file="$TUNNEL_ROOT_ENV"
    else
        env_file=$(tunnel_find_root_env "$TUNNEL_SCRIPT_DIR") || true
    fi

    if [ -z "$env_file" ] || [ ! -f "$env_file" ]; then
        echo "Error: Root .env not found. Create one with TUNNEL_DOMAIN, PIKO_SERVICE, PIKO_SECRET" >&2
        echo "  Searched from: ${TUNNEL_SCRIPT_DIR}" >&2
        echo "  Or set TUNNEL_ROOT_ENV to the path of your .env file" >&2
        exit 1
    fi

    set -a
    # shellcheck source=/dev/null
    source "$env_file"
    set +a

    echo "Loaded root env from: $env_file"
}

# Load per-app .env.tunnel config
tunnel_load_app_env() {
    local env_file="${1:-}"

    if [ -z "$env_file" ]; then
        env_file="${TUNNEL_APP_ENV:-}"
    fi

    if [ -z "$env_file" ]; then
        env_file="./.env.tunnel"
    fi

    if [ ! -f "$env_file" ]; then
        echo "Error: App .env.tunnel not found at '$env_file'" >&2
        echo "  Usage: tunnel.sh --config <path>" >&2
        echo "  Or create .env.tunnel in the current directory" >&2
        exit 1
    fi

    set -a
    # shellcheck source=/dev/null
    source "$env_file"
    set +a

    echo "Loaded app config from: $env_file"
}

# Validate that required config variables are set
tunnel_validate_config() {
    local mode="${TUNNEL_MODE:-single}"
    local errors=()

    [ -z "$TUNNEL_DOMAIN" ] && errors+=("TUNNEL_DOMAIN is not set (add to root .env)")
    [ -z "$PIKO_SERVICE" ] && errors+=("PIKO_SERVICE is not set (add to root .env)")
    [ -z "$PIKO_SECRET" ] && errors+=("PIKO_SECRET is not set (add to root .env)")
    [ -z "$TUNNEL_APP_DIR" ] && errors+=("TUNNEL_APP_DIR is not set (add to .env.tunnel)")

    if [ "$mode" = "single" ]; then
        [ -z "$TUNNEL_HOST" ] && errors+=("TUNNEL_HOST is not set (add to .env.tunnel)")
    elif [ "$mode" = "multi" ]; then
        [ -z "$TUNNEL_MAIN_APP_DIR" ] && errors+=("TUNNEL_MAIN_APP_DIR is not set (add to .env.tunnel for multi-app mode)")
        [ -z "$TUNNEL_MAIN_HOST" ] && errors+=("TUNNEL_MAIN_HOST is not set (add to .env.tunnel for multi-app mode)")
    fi

    if [ ${#errors[@]} -gt 0 ]; then
        echo "Error: Missing required configuration:" >&2
        for err in "${errors[@]}"; do
            echo "  - $err" >&2
        done
        exit 1
    fi
}

# --- Single App Tunnel ---
# Usage: tunnel_single_app <app_dir> <port> <tunnel_host> <app_name> <command...>
tunnel_single_app() {
    local app_dir="$1"
    local port="$2"
    local tunnel_host="$3"
    local app_name="$4"
    shift 4
    local server_command=("$@")

    tunnel_check_prerequisites false true
    tunnel_check_directory "$app_dir" "$app_name app directory"
    tunnel_start_server "$app_dir" "$port" "$app_name" "${server_command[@]}"
    tunnel_create_piko_tunnel "$tunnel_host" "$port" "$app_name"

    local tunnel_url
    tunnel_url="https://$tunnel_host.$(tunnel_get_domain)"
    tunnel_monitor "$app_name server and tunnel are starting up. Access your $app_name at: $tunnel_url"
}

# --- Generate Plugin Config JSON ---
# Usage: tunnel_generate_plugin_config <base_port> <domain> <plugins_base_dir> [prefix:]plugin1,[prefix:]plugin2,...
# Supported prefixes:
#   local:  Client-only plugin (no Go backend, e.g. local:onboarding)
#   ignore: Plugin excluded from /api/meta response (skips server start + tunnel creation)
tunnel_generate_plugin_config() {
    local base_port="${1:-4174}"
    local domain="${2:-$TUNNEL_DOMAIN}"
    local plugins_base_dir="${3:-libs}"
    local plugin_list="${4:-}"
    local port=$base_port

    # If no list provided, error out - explicit is better than implicit
    if [ -z "$plugin_list" ]; then
        echo "Error: TUNNEL_PLUGINS not set. Specify plugins as comma-separated list (e.g., dashboard,admin,ipfs)" >&2
        exit 1
    fi

    # Build jq array using --arg and --argjson
    local jq_args=("--arg" "domain" "$domain")
    local idx=0
    local -a local_indices=()
    local -a ignore_indices=()

    # Parse comma-separated list (supports "local:" and "ignore:" prefixes)
    IFS=',' read -ra plugins <<< "$plugin_list"
    for entry in "${plugins[@]}"; do
        # Trim whitespace
        entry=$(echo "$entry" | xargs)
        [ -z "$entry" ] && continue

        local is_local=false
        local is_ignore=false
        local name="$entry"

        # Check for local: prefix
        if [[ "$entry" == local:* ]]; then
            is_local=true
            name="${entry#local:}"
        fi

        # Check for ignore: prefix
        if [[ "$entry" == ignore:* ]]; then
            is_ignore=true
            name="${entry#ignore:}"
        fi

        local plugin_dir="$plugins_base_dir/portal-plugin-$name"

        # Verify plugin exists
        if [ ! -d "$plugin_dir" ]; then
            echo "Warning: Plugin directory not found: $plugin_dir" >&2
            continue
        fi

        jq_args+=("--arg" "name$idx" "$name")
        jq_args+=("--argjson" "port$idx" "$port")
        local_indices[idx]=$is_local
        ignore_indices[idx]=$is_ignore
        idx=$((idx + 1))
        port=$((port + 1))
    done

    if [ $idx -eq 0 ]; then
        echo "[]"
        return 0
    fi

    local filter="["
    for i in $(seq 0 $((idx - 1))); do
        [ "$i" -gt 0 ] && filter="$filter,"
        filter="$filter{name: \$name$i, port: \$port$i, tunnelHost: \"\$(\$name$i).\$(\$domain)\""
        if [ "${local_indices[$i]}" = true ]; then
            filter="$filter, local: true"
        fi
        if [ "${ignore_indices[$i]}" = true ]; then
            filter="$filter, ignore: true"
        fi
        filter="$filter}"
    done
    filter="$filter]"

    jq "${jq_args[@]}" -n "$filter"
}

# --- Multi-App Tunnel (module-federation with plugins) ---
tunnel_multi_app() {
    local base_dir="${TUNNEL_APP_DIR:-.}"
    local main_app_dir="$TUNNEL_MAIN_APP_DIR"
    local main_host="$TUNNEL_MAIN_HOST"
    local main_port="${TUNNEL_MAIN_PORT:-4173}"
    local server_cmd="${TUNNEL_SERVER_CMD:-pnpm serve}"
    read -ra server_cmd_parts <<< "$server_cmd"
    local plugin_config="${TUNNEL_PLUGIN_CONFIG:-}"
    local plugins_base_dir="${TUNNEL_PLUGINS_BASE_DIR:-$base_dir/libs}"
    local plugins_list="${TUNNEL_PLUGINS:-}"

    tunnel_check_prerequisites true true

    # Check for TUNNEL_PLUGINS from root .env (user-specific, gitignored)
    # This takes precedence over the value that may have been set in .env.tunnel
    if [ -n "${TUNNEL_PLUGINS_FROM_ROOT:-}" ]; then
        plugins_list="$TUNNEL_PLUGINS_FROM_ROOT"
        echo "Using TUNNEL_PLUGINS from root .env: $plugins_list"
    fi

    # Auto-generate plugin config if requested
    if [ "$plugin_config" = "auto" ] || [ -n "$plugins_list" ]; then
        echo "Auto-generating plugin configuration..."
        # Write to main app dir where vite plugin expects it
        plugin_config="$main_app_dir/plugin.config.json"
        tunnel_generate_plugin_config $((main_port + 1)) "$TUNNEL_DOMAIN" "$plugins_base_dir" "$plugins_list" > "$plugin_config"
        echo "Generated: $plugin_config"
    elif [ -n "$plugin_config" ] && [ ! -f "$plugin_config" ]; then
        echo "Plugin config not found at '$plugin_config' and TUNNEL_PLUGINS not set" >&2
        exit 1
    fi

    if [ -n "$plugin_config" ]; then
        tunnel_check_file "$plugin_config" "Plugin configuration file"
    fi

    tunnel_check_directory "$main_app_dir" "Main app directory"

    # Start main app
    tunnel_start_server "$main_app_dir" "$main_port" "main app" \
        VITE_TUNNEL_HOST="$main_host.$(tunnel_get_domain)" \
        VITE_PORT="$main_port" \
        "${server_cmd_parts[@]}"

    # Start plugin apps if plugin config exists
    if [ -n "$plugin_config" ] && [ -f "$plugin_config" ]; then
        local port_offset=0
        while IFS= read -r plugin; do
            local name
            name=$(echo "$plugin" | jq -r '.name')
            local tunnelHost
            tunnelHost=$(echo "$plugin" | jq -r '.tunnelHost')
            local is_ignored
            is_ignored=$(echo "$plugin" | jq -r '.ignore // false')

            if [ "$is_ignored" = "true" ]; then
                echo "Skipping ignored plugin '$name' (server start)"
                continue
            fi

            local plugin_dir="$plugins_base_dir/portal-plugin-$name"

            if [ ! -d "$plugin_dir" ]; then
                echo "Warning: Directory for plugin '$name' not found at '$plugin_dir'. Skipping."
                continue
            fi

            port_offset=$((port_offset + 1))
            local forwarding_port=$((main_port + port_offset))

            tunnel_start_server "$plugin_dir" "$forwarding_port" "'$name'" \
                VITE_TUNNEL_HOST="$tunnelHost" \
                VITE_PORT="$forwarding_port" \
                "${server_cmd_parts[@]}"
        done < <(jq -c '.[]' "$plugin_config")
    fi

    # Create piko tunnels
    tunnel_create_piko_tunnel "$main_host" "$main_port" "main app"

    if [ -n "$plugin_config" ] && [ -f "$plugin_config" ]; then
        local port_offset=0
        while IFS= read -r plugin; do
            local name
            name=$(echo "$plugin" | jq -r '.name')
            local tunnelHost
            tunnelHost=$(echo "$plugin" | jq -r '.tunnelHost')
            local is_ignored
            is_ignored=$(echo "$plugin" | jq -r '.ignore // false')
            local plugin_dir="$plugins_base_dir/portal-plugin-$name"

            if [ ! -d "$plugin_dir" ]; then
                continue
            fi

            if [ "$is_ignored" = "true" ]; then
                echo "Skipping ignored plugin '$name' (tunnel creation)"
                continue
            fi

            port_offset=$((port_offset + 1))
            local forwarding_port=$((main_port + port_offset))
            local endpoint_name
            endpoint_name=$(echo "$tunnelHost" | cut -d'.' -f1)

            tunnel_create_piko_tunnel "$endpoint_name" "$forwarding_port" "'$name'"
        done < <(jq -c '.[]' "$plugin_config")
    fi

    tunnel_monitor "All servers and tunnels are starting up."
}
