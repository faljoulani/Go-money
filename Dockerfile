# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Minimal OS tools + toolchain to build native addons from source (for lightningcss)
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git python3 pkg-config build-essential rustc cargo \
    && rm -rf /var/lib/apt/lists/*

# We'll skip scripts during npm ci (scripts/ not copied yet), but allow them later
ENV npm_config_ignore_scripts=false
# If prebuilt binaries are blocked, build native modules from source
ENV npm_config_build_from_source=true

# ---- install deps WITHOUT running postinstall (scripts) yet
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci --ignore-scripts

# ---- copy the rest of the sources (now scripts/ exists)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------- DEBUG: Tailwind/PostCSS/LightningCSS --------------------
RUN test -f postcss.config.js || (echo "ERROR: postcss.config.js missing" && exit 1)
RUN test -f src/index.css       || (echo "ERROR: src/index.css missing" && exit 1)
RUN node -v && npm -v
RUN echo "npm ignore-scripts = $(npm config get ignore-scripts)"
RUN npm ls --depth=0 tailwindcss @tailwindcss/postcss postcss lightningcss || true
# ------------------------------------------------------------------------------

# -------- ALWAYS rebuild lightningcss and verify the native binary ------------
# Rebuild (downloads prebuilt or compiles from source via cargo, depending on env)
RUN npm rebuild lightningcss --foreground-scripts

# Verify native .node exists; fail fast if missing
RUN ls -la node_modules/lightningcss || true
RUN ls -la node_modules/lightningcss/*.node || (echo 'ERROR: lightningcss native binary still missing' && exit 1)

# Also confirm it loads
RUN node -e "try{require('lightningcss');console.log('lightningcss OK')}catch(e){console.error('lightningcss load failed:',e);process.exit(1)}"
# ------------------------------------------------------------------------------

# Build (Tailwind v4 + PostCSS run here)
RUN npm run build

# Optional: slim dependencies for runtime
RUN npm prune --omit=dev

########################
# 2) Runtime stage
########################
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy only what runtime needs
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["npm", "run", "start", "--", "-p", "3000"]