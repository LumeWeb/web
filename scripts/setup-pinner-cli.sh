#!/usr/bin/env bash
#
# Setup pinner-cli binary for local development.
#
# If `pinner` is already on PATH, does nothing.
# Otherwise, installs it via `go install go.lumeweb.com/pinner-cli/cmd/pinner@latest`
# and ensures the GOPATH/bin directory is on PATH.
#
# This mirrors the CI composite action at .github/actions/setup-pinner-cli/action.yml.
#
set -euo pipefail

if command -v pinner &>/dev/null; then
  exit 0
fi

if ! command -v go &>/dev/null; then
  echo "error: 'go' is not installed and 'pinner' binary not found on PATH." >&2
  echo "       Install Go or place the pinner binary on PATH manually." >&2
  exit 1
fi

VERSION="${PINNER_CLI_VERSION:-latest}"
echo "Installing pinner-cli@${VERSION} via go install..."
GOTOOLCHAIN="${GOTOOLCHAIN:-auto}" go install go.lumeweb.com/pinner-cli/cmd/pinner@"${VERSION}"

GOPATH_BIN="$(go env GOPATH)/bin"
if [[ ":${PATH}:" != *":${GOPATH_BIN}:"* ]]; then
  echo "export PATH=\"${GOPATH_BIN}:\${PATH}\""
  export PATH="${GOPATH_BIN}:${PATH}"
fi

echo "pinner-cli installed to ${GOPATH_BIN}/pinner"
pinner version
