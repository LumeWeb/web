#!/usr/bin/env bash
#
# Setup pinner-cli binary for local development.
#
# If `pinner` is already on PATH, does nothing.
# Otherwise, installs it via `go install go.lumeweb.com/pinner-cli/cmd/pinner@latest`
# and emits a PATH export for the caller to eval.
#
# Usage in package.json scripts:
#   "setup:pinner": "eval \"$(bash ../../scripts/setup-pinner-cli.sh)\""
#
# This mirrors the CI composite action at .github/actions/setup-pinner-cli/action.yml.
#
set -euo pipefail

# If pinner is already on PATH, nothing to do.
if command -v pinner &>/dev/null; then
  exit 0
fi

if ! command -v go &>/dev/null; then
  echo "error: 'go' is not installed and 'pinner' binary not found on PATH." >&2
  echo "       Install Go or place the pinner binary on PATH manually." >&2
  exit 1
fi

VERSION="${PINNER_CLI_VERSION:-latest}"
echo "Installing pinner-cli@${VERSION} via go install..." >&2
GOTOOLCHAIN="${GOTOOLCHAIN:-auto}" go install go.lumeweb.com/pinner-cli/cmd/pinner@"${VERSION}" >&2

GOPATH_BIN="$(go env GOPATH)/bin"
if [[ ":${PATH}:" != *":${GOPATH_BIN}:"* ]]; then
  # Emit the PATH export to stdout so `eval "$(...)"` in the caller picks it up.
  echo "export PATH=\"${GOPATH_BIN}:\${PATH}\""
  export PATH="${GOPATH_BIN}:${PATH}"
fi

echo "pinner-cli installed to ${GOPATH_BIN}/pinner" >&2
pinner version >&2
