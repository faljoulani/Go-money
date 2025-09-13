# syntax=docker/dockerfile:1

########################
# 1) Build stage
########################
FROM node:20-bookworm-slim AS build
WORKDIR /app

# ---- OS deps ---------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl findutils \
    && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# keep optional deps on (silences the warn and ensures optional deps flow)
ENV npm_config_optional=true
# oxide/lightningcss helpers can run; we also add prebuilts explicitly
ENV npm_config_ignore_scripts=false

# ---- NPM install (base deps) ----------------------------------------------
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --ignore-scripts

# ---- App code --------------------------------------------------------------
COPY . .

# (no Linux filename normalization; code imports fixed to correct casing)

# ---- Show Prettier EOL & format to repo rules ------------------------------
# This makes lint happy regardless of host OS line endings.
RUN node -e "try{const p=require('prettier'); const c=p.resolveConfig.sync(process.cwd()); console.log('Prettier endOfLine:', (c&&c.endOfLine)||'(default) lf'); }catch(e){console.log('Prettier not found (will still try npx).')}"
RUN npx prettier --loglevel warn --write . || true

# ---- Quick presence checks -------------------------------------------------
RUN test -f postcss.config.js || (echo "ERROR: postcss.config.js missing" && exit 1)
RUN test -f src/index.css     || (echo "ERROR: src/index.css missing" && exit 1)

# ---- Print platform + Node/NAPI/glibc -------------------------------------
RUN node -e "const r=(process.report&&process.report.getReport&&process.report.getReport())||{}; console.log(['node '+process.version,'platform='+process.platform,'arch='+process.arch,'napi='+(process.versions.napi||'none'),'glibc='+(r.header?.glibcVersionRuntime||'n/a')].join(' | '))"

# ---- Install oxide/lightningcss prebuilts if present ----------------------
# Tailwind v4 uses @tailwindcss/oxide (optional), lightningcss is used by many setups.
# We detect which wrappers exist in node_modules and install matching prebuilts.
RUN set -eux; \
  oxPkg=""; lcPkg=""; \
  if [ -f node_modules/@tailwindcss/oxide/package.json ]; then \
    oxVer=$(node -p "require('./node_modules/@tailwindcss/oxide/package.json').version"); \
    oxPkg="@tailwindcss/oxide-linux-x64-gnu@${oxVer}"; \
  fi; \
  if [ -f node_modules/lightningcss/package.json ]; then \
    lcVer=$(node -p "require('./node_modules/lightningcss/package.json').version"); \
    lcPkg="lightningcss-linux-x64-gnu@${lcVer}"; \
  fi; \
  echo "Selected prebuilts: ${oxPkg:-none} ${lcPkg:-none}"; \
  if [ -n "$oxPkg$lcPkg" ]; then \
    npm i --no-audit --no-fund --no-save $oxPkg $lcPkg; \
  else \
    echo "No oxide/lightningcss wrappers found; skipping prebuilt install"; \
  fi

# ---- Wire lightningcss .node to wrapper path (if installed) ---------------
RUN set -eux; \
  if [ -f node_modules/lightningcss/package.json ]; then \
    src="node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node"; \
    dst="node_modules/lightningcss/lightningcss.linux-x64-gnu.node"; \
    if [ -f "$src" ]; then \
      cp -f "$src" "$dst"; \
      ls -lh "$dst"; \
    else \
      echo "WARN: missing $src after prebuilt install; continuing"; \
    fi; \
  else \
    echo "lightningcss wrapper not present; skipping .node wiring"; \
  fi

# ---- Assert natives load (when present) -----------------------------------
RUN set -eux; \
  echo '--- ASSERT: require("@tailwindcss/oxide") (warn if missing)'; \
  node -e "try{const ox=require('@tailwindcss/oxide');console.log('oxide OK:',Object.keys(ox).slice(0,5));}catch(e){console.log('WARN: @tailwindcss/oxide not installed (ok if Tailwind v3 or optional dep omitted):',e.code||e.message)}"; \
  echo '--- ASSERT: require("lightningcss") (warn if missing)'; \
  node -e "try{const lc=require('lightningcss');console.log('lightningcss transform:',typeof lc.transform);}catch(e){console.log('WARN: lightningcss not installed:',e.code||e.message)}"; \
  echo '--- Native .node files (oxide/lightningcss)'; \
  /bin/sh -lc "find node_modules -maxdepth 4 -type f -name '*.node' -print -ls | grep -E 'oxide|lightningcss' || true"

# (no sharp rebuild step)

# ---- Build (Tailwind runs here) -------------------------------------------
RUN NODE_ENV=production npm run build

# ---- Slim prod deps --------------------------------------------------------
RUN npm prune --omit=dev


########################
# 2) Runtime stage
########################
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9097
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

EXPOSE 9097
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["npm", "run", "start", "--", "-p", "9097"]
