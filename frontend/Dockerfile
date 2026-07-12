# ── Stage 1: Build ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# Copy lockfiles and run install
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn install --frozen-lockfile || yarn install

# ── 💡 FIX: Moved ARGs before copying code to break Docker cache ──
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_AZURE_TENANT_ID
ARG REACT_APP_AZURE_CLIENT_ID

ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL \
    REACT_APP_AZURE_TENANT_ID=$REACT_APP_AZURE_TENANT_ID \
    REACT_APP_AZURE_CLIENT_ID=$REACT_APP_AZURE_CLIENT_ID \
    GENERATE_SOURCEMAP=false \
    CI=false

# Copy remaining source files and compile
COPY . .
RUN yarn build

# ── Stage 2: Serve via Nginx ────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# SPA fallback + gzip config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]