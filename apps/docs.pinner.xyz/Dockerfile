# Pinner Docs Backend
# Multi-stage build: tsdown-bundled standalone server (no node_modules at runtime)
# Static frontend is built separately and deployed to IPFS
#
# Result: ~40MB runtime image with zero node_modules
# tsdown bundles all npm deps (hono, vocs, etc.) via Rolldown.
# Only Node.js built-ins remain external (platform: 'node').
#
# Layout at runtime:
#   /app/server/serve-node.mjs  (entry + chunks, ~25MB)
#   /app/vocs.config.js         (compiled config, 12KB)
#   /app/assets/                (Vocs config definition, 6MB)
#
# vocs.config.js is placed one dir above server/ because the
# config resolver does: path.resolve(import.meta.dirname, "../vocs.config.js")

# ── Stage 1a: Build pinner-cli ────────────────────────────────────────────
FROM golang:1.26 AS pinner-cli
RUN go install go.lumeweb.com/pinner-cli/cmd/pinner@latest

# ── Stage 1b: Build docs ──────────────────────────────────────────────────
FROM node:22-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

# Copy workspace manifests and patches first (layer cache)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches/ patches/
COPY apps/docs.pinner.xyz/package.json apps/docs.pinner.xyz/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy pinner-cli binary from golang stage
COPY --from=pinner-cli /go/bin/pinner /usr/local/bin/pinner

# Copy source and build
COPY apps/docs.pinner.xyz/ apps/docs.pinner.xyz/
COPY libs/pinner/src/ libs/pinner/src/
COPY libs/pinner/tsconfig.json libs/pinner/tsconfig.json
COPY libs/pinner/tsconfig.typedoc.json libs/pinner/tsconfig.typedoc.json
COPY tsconfig.base.json tsconfig.base.json

# Build: inline the build chain to avoid pnpm's runDepsStatusCheck
# (pnpm v11 re-runs install before every pnpm script invocation, which
# fails on workspace-level unused patches)
# pinner binary is already copied from the golang stage, so setup-pinner-cli.sh
# is a no-op (it exits early when pinner is on PATH)
WORKDIR /build/apps/docs.pinner.xyz
RUN mkdir -p reference-sources \
    && pinner generate-docs json > reference-sources/cli-ref.json \
    && npx tsx scripts/generate-cli-ref.ts \
    && npx typedoc \
    && npx tsx scripts/generate-sdk-ref.ts \
    && npx vocs build

# Bundle the server with tsdown/Rolldown
RUN npx tsdown

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM node:22-slim AS runtime

# Non-root user
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

# Server bundle + chunks
COPY --from=builder /build/apps/docs.pinner.xyz/dist-bundle/ /app/server/

# Compiled Vocs config (placed one dir above server/ for path resolution)
COPY --from=builder /build/apps/docs.pinner.xyz/dist/server/vocs.config.js /app/vocs.config.js

# Vocs config definition module (imported by vocs.config.js)
COPY --from=builder /build/apps/docs.pinner.xyz/dist/server/assets/ /app/assets/

RUN chown -R app:app /app

USER app
WORKDIR /app/server

ENV HOST=0.0.0.0
ENV PORT=5173
ENV VOCS_RENDER_STRATEGY=dynamic

EXPOSE 5173

CMD ["node", "serve-node.mjs"]
