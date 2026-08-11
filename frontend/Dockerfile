# ============================================================
# Frontend Dockerfile — EduPilot AI (Node 20 + Nginx)
# ============================================================
# Multi-stage build:
#   Stage 1 (builder): npm ci + vite build → static dist/
#   Stage 2 (runtime): nginx:alpine serves the static files
# ============================================================

# ---- Stage 1: Build the React/Vite app ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (cache layer)
COPY package.json package-lock.json ./

# Install dependencies (clean install from lockfile)
RUN npm ci

# Copy source code
COPY . .

# Build-time env: API calls go through the nginx proxy (relative path)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build


# ---- Stage 2: Serve with Nginx ----
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our SPA-aware nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
