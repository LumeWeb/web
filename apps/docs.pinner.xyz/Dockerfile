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

# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Install pnpm + Go (for pinner-cli)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y --no-install-recommends golang-go && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy workspace manifests and patches first (layer cache)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches/ patches/
COPY apps/docs.pinner.xyz/package.json apps/docs.pinner.xyz/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Install pinner-cli (provides `pinner generate-docs json` for CLI ref generation)
RUN go install go.lumeweb.com/pinner-cli/cmd/pinner@latest
ENV PATH="/root/go/bin:${PATH}"

# Copy source and build
COPY apps/docs.pinner.xyz/ apps/docs.pinner.xyz/
COPY libs/pinner/src/ libs/pinner/src/
COPY libs/pinner/tsconfig.json libs/pinner/tsconfig.json
COPY libs/pinner/tsconfig.typedoc.json libs/pinner/tsconfig.typedoc.json

# build script runs generate (TypeDoc + CLI ref) then vocs build
RUN pnpm --filter @lumeweb/docs.pinner.xyz build

# Bundle the server with tsdown/Rolldown
RUN pnpm --filter @lumeweb/docs.pinner.xyz exec tsdown

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
