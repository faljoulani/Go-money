# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-alpine AS build
WORKDIR /app

# Better caching for deps
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci

# Copy the rest
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------- DEBUG: Tailwind/PostCSS presence --------------------
# Fail fast if key files are missing
RUN test -f postcss.config.js || (echo "ERROR: postcss.config.js missing" && exit 1)
RUN test -f src/index.css       || (echo "ERROR: src/index.css missing" && exit 1)

# Show Node/NPM and installed libs (do not fail pipeline on npm ls warnings)
RUN node -v && npm -v
RUN npm ls --depth=0 @tailwindcss/postcss tailwindcss postcss || true

# Show we can resolve the plugins at runtime
RUN node -e "console.log('RESOLVE @tailwindcss/postcss =>', require.resolve('@tailwindcss/postcss'))"
RUN node -e "console.log('RESOLVE tailwindcss =>', require.resolve('tailwindcss'))"
RUN node -e "console.log('postcss version =>', require('postcss/package.json').version)"

# Show config files and the first lines of the CSS entry
RUN ls -l postcss.config.* tailwind.config.* || true
RUN echo '--- BEGIN postcss.config.js ---' && sed -n '1,120p' postcss.config.js && echo '--- END postcss.config.js ---'
RUN echo '--- BEGIN src/index.css (first 60 lines) ---' && sed -n '1,60p' src/index.css && echo '--- END src/index.css ---'
# -------------------------------------------------------------------------

# Build (this is where Webpack/PostCSS will fail if anything is wrong)
RUN npm run build

# Optional: slim dependencies for runtime
RUN npm prune --omit=dev

########################
# 2) Runtime stage
########################
FROM node:20-alpine AS runtime
WORKDIR /app

# Add a tiny HTTP client for health checks
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Next listens on all interfaces
ENV HOSTNAME=0.0.0.0

# Copy only what runtime needs
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

EXPOSE 3000

# Probe the cheap h
