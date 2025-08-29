# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-bookworm-slim AS build
WORKDIR /app

# minimal OS tools (no rustc/cargo from apt — too old)
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git python3 pkg-config build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install modern Rust via rustup (needed to build lightningcss from source)
RUN curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustc --version && cargo --version

# Ensure npm scripts can run later; we skip them during npm ci
ENV npm_config_ignore_scripts=false
# IMPORTANT: tell napi-rs to build native addons from source
ENV NAPI_BUILD_FROM_SOURCE=1

# Better caching for deps: install WITHOUT scripts (scripts/ not copied yet)
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci --ignore-scripts

# Copy the rest
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------- DEBUG: Tailwind/PostCSS/LightningCSS --------------------
# Fail fast if key files are missing
RUN test -f postcss.config.js || (echo "ERROR: postcss.config.js missing" && exit 1)
RUN test -f src/index.css       || (echo "ERROR: src/index.css missing" && exit 1)

# Show versions & resolvable modules
RUN node -v && npm -v
RUN echo "npm ignore-scripts = $(npm config get ignore-scripts)"
RUN npm ls --depth=0 tailwindcss @tailwindcss/postcss postcss lightningcss || true
RUN node -e "console.log('platform=',process.platform,'arch=',process.arch,'node=',process.versions.node)"

# Print configs and the first lines of CSS entry
RUN echo '--- BEGIN postcss.config.js ---' && sed -n '1,120p' postcss.config.js && echo '--- END postcss.config.js ---'
RUN echo '--- BEGIN src/index.css (first 60 lines) ---' && sed -n '1,60p' src/index.css && echo '--- END src/index.css ---'
# ------------------------------------------------------------------------------

# -------- Build lightningcss from source & verify the native binary -----------
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

# tiny HTTP client for healthchecks
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