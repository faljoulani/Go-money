# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-bookworm-slim AS build
WORKDIR /app

# minimal OS tools
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Ensure npm scripts are allowed (defensive)
ENV npm_config_ignore_scripts=false

# Better caching for deps
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci

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

# -------- Attempt to ensure Lightning CSS native binary is present ------------
# 1) Can we resolve the JS wrapper?
RUN node -e "try{console.log('resolve lightningcss =>', require.resolve('lightningcss'))}catch(e){console.error('resolve lightningcss failed:', e.message); process.exit(1)}"

# 2) Is the native .node file there?
RUN ls -la node_modules/lightningcss || true
RUN ls -la node_modules/lightningcss/*.node || true

# 3) If missing, re-run postinstall to fetch the native binary (needs scripts enabled)
RUN npm rebuild lightningcss --foreground-scripts || true

# 4) Verify again
RUN ls -la node_modules/lightningcss || true
RUN ls -la node_modules/lightningcss/*.node || (echo 'ERROR: lightningcss native binary still missing' && exit 1)
# ------------------------------------------------------------------------------

# Build (now the CSS pipeline should find lightningcss)
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