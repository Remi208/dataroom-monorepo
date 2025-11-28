# Docker Deployment Guide

This document describes the Docker setup for the Data Room application.

## Overview

The application consists of two services:
- **Frontend**: React/Vite application served on port 3000
- **Backend**: Express.js server on port 5000

Both services are orchestrated using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Building and Running

### Using Docker Compose (Recommended)

From the root directory:

```bash
docker-compose up --build
```

This will:
1. Build both frontend and backend images
2. Start both services
3. Display logs from both containers

**Access the application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Stopping the Services

```bash
docker-compose down
```

To also remove volumes:

```bash
docker-compose down -v
```

## Building Individual Images

### Frontend Image

```bash
docker build -f packages/frontend/Dockerfile -t dataroom-frontend:latest .
```

Run the frontend container:

```bash
docker run -p 3000:3000 dataroom-frontend:latest
```

### Backend Image

```bash
docker build -f packages/backend/Dockerfile -t dataroom-backend:latest .
```

Run the backend container:

```bash
docker run -p 5000:5000 dataroom-backend:latest
```

## Docker Images

### Frontend Dockerfile

**Multi-stage build:**
- **Build stage**: Node 18 Alpine with pnpm
  - Installs dependencies
  - Builds the Vite application
  - Output: optimized production build in `/app/dist`

- **Production stage**: Node 18 Alpine + `serve` package
  - Minimal base image for serving static files
  - Uses `serve` for production-grade static file serving
  - Health check enabled
  - Exposed port: 3000

**Optimization:**
- Multi-stage build reduces final image size
- Only production dependencies included
- Alpine Linux for minimal image footprint

### Backend Dockerfile

**Multi-stage build:**
- **Build stage**: Node 18 Alpine with TypeScript compilation
  - Installs full dependencies (dev included)
  - Compiles TypeScript to JavaScript

- **Production stage**: Node 18 Alpine
  - Only production dependencies installed
  - TypeScript not included in final image
  - Exposed port: 5000

## Environment Variables

### Frontend
No environment variables required (uses localhost defaults).

### Backend

```env
NODE_ENV=production
PORT=5000
```

These are set in `docker-compose.yml`.

## Health Checks

Both services include health checks:

```yaml
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
```

**What this means:**
- Checks every 30 seconds
- Allows 3 seconds for response
- Waits 5 seconds before first check
- Marks unhealthy after 3 failed checks

## Networking

Services communicate via the `dataroom-network` bridge network:

```
┌─────────────────┐
│   dataroom-     │
│   network       │
├─────────────────┤
│  frontend:3000  │
├─────────────────┤
│  backend:5000   │
└─────────────────┘
```

Frontend can reach backend at: `http://backend:5000`

## Logs

View logs from all services:

```bash
docker-compose logs -f
```

View logs from specific service:

```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

## Common Issues

### Port Already in Use

If port 3000 or 5000 is already in use:

```bash
docker-compose down
# Or map to different ports in docker-compose.yml
```

### Build Fails

Clean and rebuild:

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Out of Memory

Increase Docker's memory limit in Docker Desktop settings.

## Production Deployment

### Using docker-compose.yml with scale

```bash
docker-compose up -d --scale backend=3
```

### Using Kubernetes

The images can be deployed to Kubernetes with appropriate ingress configuration.

### Registry Push

```bash
# Tag images
docker tag dataroom-frontend:latest myregistry.com/dataroom-frontend:1.0.0
docker tag dataroom-backend:latest myregistry.com/dataroom-backend:1.0.0

# Push to registry
docker push myregistry.com/dataroom-frontend:1.0.0
docker push myregistry.com/dataroom-backend:1.0.0
```

## Image Sizes

**Frontend**: ~300MB
- Base: Alpine (5MB) + Node runtime (150MB)
- Build: Vite app + dependencies (~145MB)

**Backend**: ~200MB
- Base: Alpine (5MB) + Node runtime (150MB)
- App: Express + dependencies (~45MB)

## Performance Tuning

### Frontend

```dockerfile
# Enable gzip compression for static assets
ENV SERVE_GZIP=true
```

### Backend

```dockerfile
# Enable clustering
ENV NODE_CLUSTER_NUMWORKERS=auto
```

## Security Considerations

1. **Non-root user** (recommended addition):
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

2. **Read-only filesystem** (production):
```yaml
read_only: true
tmpfs:
  - /tmp
```

3. **Resource limits**:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## Monitoring

### Using docker stats

```bash
docker stats dataroom-frontend dataroom-backend
```

### Accessing container shell

```bash
docker-compose exec frontend /bin/sh
docker-compose exec backend /bin/sh
```

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
