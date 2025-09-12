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
ENV NEXT_DISABLE_ESLINT=1
ENV NODE_ENV=development
# keep optional deps on (silences the warn and ensures optional deps flow)
ENV npm_config_optional=true
# We'll install prebuilts explicitly; avoid running install scripts up front
ENV npm_config_ignore_scripts=true

# ---- NPM install (base deps) ----------------------------------------------
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci --no-audit --no-fund --ignore-scripts

# ---- App code --------------------------------------------------------------
COPY . .

# ---- Normalize filenames for Linux (rename only, no repo changes) ----------
RUN set -eux; \
  # mainNavigation entity -> Uppercase file used by imports
  if [ -f src/components/widgets/mainNavigation/mainNavigation.entity.ts ]; then \
    if [ -f src/components/widgets/mainNavigation/MainNavigation.entity.ts ]; then \
      rm -f src/components/widgets/mainNavigation/MainNavigation.entity.ts; \
    fi; \
    mv src/components/widgets/mainNavigation/mainNavigation.entity.ts \
       src/components/widgets/mainNavigation/MainNavigation.entity.ts; \
  fi; \
  # MainNavigationClient -> Uppercase file used by imports
  if [ -f src/components/widgets/mainNavigation/mainNavigationClient.tsx ]; then \
    if [ -f src/components/widgets/mainNavigation/MainNavigationClient.tsx ]; then \
      rm -f src/components/widgets/mainNavigation/MainNavigationClient.tsx; \
    fi; \
    mv src/components/widgets/mainNavigation/mainNavigationClient.tsx \
       src/components/widgets/mainNavigation/MainNavigationClient.tsx; \
  fi; \
  # Breadcrumb -> lowercase file used by imports
  if [ -f src/components/widgets/breadcrumb/BreadcrumbCustom.tsx ]; then \
    if [ -f src/components/widgets/breadcrumb/breadcrumbCustom.tsx ]; then \
      rm -f src/components/widgets/breadcrumb/breadcrumbCustom.tsx; \
    fi; \
    mv src/components/widgets/breadcrumb/BreadcrumbCustom.tsx \
       src/components/widgets/breadcrumb/breadcrumbCustom.tsx; \
  fi; \
  # SupportInfoBox directory -> lowercase dir used by imports
  if [ -d src/components/widgets/SupportInfoBox ]; then \
    if [ -e src/components/widgets/supportInfoBox ]; then \
      rm -rf src/components/widgets/supportInfoBox; \
    fi; \
    mv src/components/widgets/SupportInfoBox \
       src/components/widgets/supportInfoBox; \
  fi; \
  # TwoColumnLayout -> Uppercase file used by imports
  if [ -f src/components/widgets/layouts/twoColumnLayout.tsx ]; then \
    if [ -f src/components/widgets/layouts/TwoColumnLayout.tsx ]; then \
      rm -f src/components/widgets/layouts/TwoColumnLayout.tsx; \
    fi; \
    mv src/components/widgets/layouts/twoColumnLayout.tsx \
       src/components/widgets/layouts/TwoColumnLayout.tsx; \
  fi; \
  # ContactSubscription.entity -> Uppercase file used by imports
  if [ -f src/components/widgets/contactSubscription/contactSubscription.entity.ts ]; then \
    if [ -f src/components/widgets/contactSubscription/ContactSubscription.entity.ts ]; then \
      rm -f src/components/widgets/contactSubscription/ContactSubscription.entity.ts; \
    fi; \
    mv src/components/widgets/contactSubscription/contactSubscription.entity.ts \
       src/components/widgets/contactSubscription/ContactSubscription.entity.ts; \
  fi; \
  # FullPageLoader -> Uppercase file used by imports
  if [ -f src/components/atoms/fullPageLoader/fullPageLoader.tsx ]; then \
    if [ -f src/components/atoms/fullPageLoader/FullPageLoader.tsx ]; then \
      rm -f src/components/atoms/fullPageLoader/FullPageLoader.tsx; \
    fi; \
    mv src/components/atoms/fullPageLoader/fullPageLoader.tsx \
       src/components/atoms/fullPageLoader/FullPageLoader.tsx; \
  fi; \
  # ContentWithoutImage -> Uppercase file used by imports
  if [ -f src/components/widgets/highlightBlock/contentWithoutImage.tsx ]; then \
    if [ -f src/components/widgets/highlightBlock/ContentWithoutImage.tsx ]; then \
      rm -f src/components/widgets/highlightBlock/ContentWithoutImage.tsx; \
    fi; \
    mv src/components/widgets/highlightBlock/contentWithoutImage.tsx \
       src/components/widgets/highlightBlock/ContentWithoutImage.tsx; \
  fi
  # FullPageLoader alias (import expects Uppercase file, file is lowercase)
  if [ -f src/components/atoms/fullPageLoader/fullPageLoader.tsx ] && [ ! -f src/components/atoms/fullPageLoader/FullPageLoader.tsx ]; then \
    printf "export { default } from './fullPageLoader';\n" > src/components/atoms/fullPageLoader/FullPageLoader.tsx; \
  fi; \
  # ContentWithoutImage alias (import expects Uppercase file, file is lowercase)
  if [ -f src/components/widgets/highlightBlock/contentWithoutImage.tsx ] && [ ! -f src/components/widgets/highlightBlock/ContentWithoutImage.tsx ]; then \
    printf "export { default } from './contentWithoutImage';\n" > src/components/widgets/highlightBlock/ContentWithoutImage.tsx; \
  fi

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

# ---- Rebuild sharp (optional) ---------------------------------------------
RUN set -eux; \
  if [ -f node_modules/sharp/package.json ]; then \
    npm_config_ignore_scripts= npm rebuild sharp --foreground-scripts --no-audit --no-fund; \
  else \
    echo 'sharp wrapper not present; skipping rebuild'; \
  fi

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

# Start Next.js directly to ensure host/port are honored
CMD ["sh", "-lc", "node node_modules/next/dist/bin/next start -H 0.0.0.0 -p ${PORT:-9097}"]
