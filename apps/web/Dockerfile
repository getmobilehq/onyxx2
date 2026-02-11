# Stage 1: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy web source
COPY apps/web/ apps/web/

# Build args for environment
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the app
RUN pnpm --filter web build

# Stage 2: Nginx
FROM nginx:1.25-alpine AS runner

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
