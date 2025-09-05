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
ENV NODE_ENV=development
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

# ---- Show Prettier EOL & format to repo rules ------------------------------
# This makes lint happy regardless of host OS line endings.
RUN node -e "try{const p=require('prettier'); const c=p.resolveConfig.sync(process.cwd()); console.log('Prettier endOfLine:', (c&&c.endOfLine)||'(default) lf'); }catch(e){console.log('Prettier not found (will still try npx).')}"
RUN npx prettier --loglevel warn --write . || true

# ---- Quick presence checks -------------------------------------------------
RUN test -f postcss.config.js || (echo "ERROR: postcss.config.js missing" && exit 1)
RUN test -f src/index.css     || (echo "ERROR: src/index.css missing" && exit 1)

# ---- Print platform + Node/NAPI/glibc -------------------------------------
RUN node -e "const r=(process.report&&process.report.getReport&&process.report.getReport())||{}; console.log(['node '+process.version,'platform='+process.platform,'arch='+process.arch,'napi='+(process.versions.napi||'none'),'glibc='+(r.header?.glibcVersionRuntime||'n/a')].join(' | '))"

# ---- Install BOTH prebuilts in one shot -----------------------------------
# (Doing them together avoids the second install pruning the first as extraneous.)
RUN set -eux; \
  oxVer=$(node -p "require('./node_modules/@tailwindcss/oxide/package.json').version"); \
  lcVer=$(node -p "require('./node_modules/lightningcss/package.json').version"); \
  echo "Selecting prebuilts: oxide=${oxVer}, lightningcss=${lcVer}"; \
  npm i --no-save \
    "@tailwindcss/oxide-linux-x64-gnu@${oxVer}" \
    "lightningcss-linux-x64-gnu@${lcVer}"

# ---- Wire lightningcss’ .node to where its wrapper expects it --------------
RUN set -eux; \
  src="node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node"; \
  dst="node_modules/lightningcss/lightningcss.linux-x64-gnu.node"; \
  test -f "$src" || (echo "FATAL: missing $src after prebuilt install" && exit 37); \
  cp -f "$src" "$dst"; \
  ls -lh "$dst"

# ---- Assert that both natives really load (CJS requires) -------------------
RUN set -eux; \
  echo '--- ASSERT: require("@tailwindcss/oxide")'; \
  node -e "const ox=require('@tailwindcss/oxide'); console.log('OK oxide exports:', Object.keys(ox).slice(0,5))"; \
  echo '--- ASSERT: require("lightningcss")'; \
  node -e "const lc=require('lightningcss'); console.log('OK lightningcss transform:', typeof lc.transform)"; \
  echo '--- Paths'; \
  node -e "console.log('oxide pkg:', require.resolve('@tailwindcss/oxide/package.json'))"; \
  node -e "console.log('oxide prebuilt pkg:', require.resolve('@tailwindcss/oxide-linux-x64-gnu/package.json'))"; \
  node -e "console.log('lightningcss entry:', require.resolve('lightningcss'))"; \
  node -e "const p=require('path'),fs=require('fs');const base=p.dirname(require.resolve('lightningcss'));console.log('lightningcss .node exists:',fs.existsSync(p.join(base,'lightningcss.linux-x64-gnu.node')))"; \
  echo '--- Native .node files'; \
  /bin/sh -lc "find node_modules -maxdepth 4 -type f -name '*.node' -print -ls | grep -E 'oxide|lightningcss' || true"

# ---- Guard: if oxide prebuilt vanished, fail early with message ------------
RUN test -f node_modules/@tailwindcss/oxide-linux-x64-gnu/tailwindcss-oxide.linux-x64-gnu.node || \
    (echo 'FATAL: @tailwindcss/oxide prebuilt missing before build. This usually happens if an npm install removed an extraneous package. Ensure prebuilts are installed together or add them to optionalDependencies.' && exit 39)

# ---- Build (Tailwind runs here) -------------------------------------------
RUN npm run build

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
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["npm", "run", "start", "--", "-p", "3000"]