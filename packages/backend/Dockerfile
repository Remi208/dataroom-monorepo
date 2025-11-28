# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/backend ./packages/backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build TypeScript
WORKDIR /app/packages/backend
RUN pnpm run build 2>/dev/null || true

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/backend ./packages/backend

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000 || exit 1

# Start the server
WORKDIR /app/packages/backend
CMD ["node", "src/server.ts"]
