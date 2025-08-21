# syntax=docker/dockerfile:1

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy only package manifests first (for better caching)
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci

# Copy the rest of the project and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 2) Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js listens on 3000 by default
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy node_modules and built app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["npm","run","start"]