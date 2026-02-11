# Stage 1: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy API source
COPY apps/api/ apps/api/

# Generate Prisma client
RUN pnpm --filter api db:generate

# Build TypeScript
RUN pnpm --filter api build

# Create standalone deployment
RUN pnpm --filter api deploy /app/deploy --prod

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy deployed app
COPY --from=builder /app/deploy ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Regenerate Prisma client for production
RUN npx prisma generate

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
