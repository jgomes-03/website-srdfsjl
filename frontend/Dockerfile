# ── Stage 1: Build ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# 💡 FIX: Copy package.json and optionally copy any lockfile if it exists
COPY package.json yarn.lock* package-lock.json* ./

# 💡 FIX: Fallback to regular yarn install if a frozen lockfile isn't possible
RUN yarn install --frozen-lockfile || yarn install

COPY . .

# Public env vars are baked in at build time (React limitation).
# Pass via --build-arg from CI.
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_AZURE_TENANT_ID
ARG REACT_APP_AZURE_CLIENT_ID
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL \
    REACT_APP_AZURE_TENANT_ID=$REACT_APP_AZURE_TENANT_ID \
    REACT_APP_AZURE_CLIENT_ID=$REACT_APP_AZURE_CLIENT_ID \
    GENERATE_SOURCEMAP=false \
    CI=false

RUN yarn build

# ── Stage 2: Serve via Nginx ────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# SPA fallback + gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]