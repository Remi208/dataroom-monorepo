# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/frontend ./packages/frontend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
WORKDIR /app/packages/frontend
RUN pnpm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install a lightweight HTTP server
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/packages/frontend/dist /app/dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]
