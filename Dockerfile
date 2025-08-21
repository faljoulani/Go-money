# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-alpine AS build
WORKDIR /app

# Better caching for deps
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci

# Copy the rest and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
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

# Probe the cheap health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

# Run the server
CMD ["npm", "run", "start", "--", "-p", "3000"]