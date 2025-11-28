# Vercel Deployment Guide

Complete guide for deploying the Data Room application to Vercel.

## Overview

Vercel natively supports:
- ✅ Frontend (React/Vite) deployment
- ✅ Serverless backend (Node.js)
- ✅ Automatic git integration
- ✅ Environment variables
- ✅ Custom domains
- ✅ Auto-preview deployments
- ✅ Analytics and monitoring

This guide covers deploying both the frontend and backend to Vercel.

## Prerequisites

1. **Vercel Account** - https://vercel.com/signup
2. **Git Repository** - Push your code to GitHub, GitLab, or Bitbucket
3. **Node.js 18+** - Local development
4. **Vercel CLI** (optional) - `npm i -g vercel`

## Step 1: Prepare Repository for Vercel

### 1.1 Create Vercel Configuration Files

Create `vercel.json` in the root directory:

```bash
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "env": {
    "NODE_ENV": "production"
  },
  "projects": {
    "frontend": {
      "name": "dataroom-frontend",
      "alias": ["dataroom-app.vercel.app"],
      "public": true
    },
    "backend": {
      "name": "dataroom-backend",
      "alias": ["dataroom-api.vercel.app"]
    }
  }
}
EOF
```

### 1.2 Create Frontend Vercel Configuration

Create `packages/frontend/vercel.json`:

```bash
cat > packages/frontend/vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@dataroom-api-url"
  }
}
EOF
```

### 1.3 Create Backend Vercel Configuration

Create `packages/backend/vercel.json`:

```bash
cat > packages/backend/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 60
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
EOF
```

### 1.4 Update Backend Server for Vercel

The backend needs to export a handler for Vercel serverless functions.

Update `packages/backend/src/server.ts`:

```typescript
import express, { Express, Request, Response } from 'express'
import cors from 'cors'

const app: Express = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' })
})

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    })
})

// Export for Vercel
export default app

// Local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}
```

### 1.5 Update tsconfig.json for Backend (if needed)

Ensure `packages/backend/tsconfig.json` includes proper settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Step 2: Push to Git Repository

```bash
# Initialize if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Add Vercel configuration and deployment setup"

# Push to GitHub (create repo first at github.com)
git remote add origin https://github.com/your-username/my-dropbox.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Add New..."
3. Select "Project"
4. Choose your Git repository (GitHub, GitLab, Bitbucket)
5. Configure:
   - **Project Name**: `dataroom-frontend`
   - **Framework**: Vite
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd packages/frontend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Configure build settings
```

### Configuration for Frontend

In Vercel Dashboard → Project Settings:

**Environment Variables:**
```
VITE_API_URL=https://dataroom-api.vercel.app
NODE_ENV=production
```

**Build Settings:**
- Build Command: `pnpm install && pnpm run build`
- Output Directory: `dist`
- Root Directory: `packages/frontend`

**Domains:**
- Add custom domain (optional)
- Default: `https://dataroom-frontend.vercel.app`

## Step 4: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..."
3. Select "Project"
4. Choose the same Git repository
5. Configure:
   - **Project Name**: `dataroom-backend`
   - **Framework**: Other
   - **Root Directory**: `packages/backend`
   - **Build Command**: `pnpm install && npm run build`
   - **Output Directory**: (leave empty for serverless)
   - **Install Command**: `pnpm install`
6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Deploy backend
cd packages/backend
vercel

# Follow prompts
```

### Configuration for Backend

In Vercel Dashboard → Project Settings:

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
```

**Serverless Function Settings:**
- Max Duration: 60 seconds
- Memory: 1024 MB

**Domains:**
- Add custom domain (optional)
- Default: `https://dataroom-backend.vercel.app`

## Step 5: Configure Environment Variables

### Frontend Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://dataroom-backend.vercel.app
VITE_APP_NAME=Data Room
NODE_ENV=production
```

### Backend Environment Variables

```
NODE_ENV=production
CORS_ORIGIN=https://dataroom-frontend.vercel.app
DATABASE_URL=(if using database)
```

## Step 6: Update Frontend to Use API

Create `packages/frontend/src/api/config.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiConfig = {
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
}

export const apiEndpoints = {
    health: `${API_URL}/api/health`,
    datarooms: `${API_URL}/api/datarooms`,
    folders: `${API_URL}/api/folders`,
    files: `${API_URL}/api/files`
}
```

Create `.env.example`:

```bash
VITE_API_URL=http://localhost:5000
```

Create `.env.local` (for local development):

```bash
VITE_API_URL=http://localhost:5000
```

## Step 7: Update CORS Settings

Update `packages/backend/src/server.ts`:

```typescript
const corsOrigin = process.env.CORS_ORIGIN || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://dataroom-frontend.vercel.app')

app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## Step 8: Test Deployment

### Test Frontend
```bash
# Build locally
cd packages/frontend
pnpm build

# Preview
pnpm preview

# Test should work at http://localhost:4173
```

### Test Backend
```bash
# Build locally
cd packages/backend
pnpm build

# Start
NODE_ENV=production node dist/server.js

# Test endpoint
curl http://localhost:5000/api/health
```

## Step 9: Configure Auto-Deployments

In Vercel Dashboard:

1. **Frontend Project** → Settings → Git:
   - Auto-deploy on push to main: ✅
   - Preview deployments: ✅

2. **Backend Project** → Settings → Git:
   - Auto-deploy on push to main: ✅
   - Preview deployments: ✅

## Vercel-Specific Configuration Files

### Root `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Frontend `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "pnpm -F dataroom-frontend run build",
  "outputDirectory": "packages/frontend/dist"
}
```

### Backend `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/backend/src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "packages/backend/src/server.ts"
    }
  ]
}
```

## Deployment Checklist

- [ ] Create Vercel account at https://vercel.com
- [ ] Connect Git repository (GitHub/GitLab/Bitbucket)
- [ ] Create `vercel.json` files
- [ ] Update backend server.ts for Vercel
- [ ] Set environment variables in Vercel
- [ ] Configure CORS for frontend domain
- [ ] Test frontend deployment
- [ ] Test backend deployment
- [ ] Verify API communication
- [ ] Set custom domain (optional)
- [ ] Enable auto-deployments
- [ ] Configure monitoring

## Deployment URLs

After deployment, your application will be available at:

```
Frontend: https://dataroom-frontend.vercel.app
Backend: https://dataroom-backend.vercel.app
```

Or with custom domains:

```
Frontend: https://app.yourdomain.com
Backend: https://api.yourdomain.com
```

## Troubleshooting

### Build Fails

**Issue**: pnpm not found
```bash
# Solution: Update buildCommand to include pnpm install
# In vercel.json:
"buildCommand": "pnpm install && pnpm run build"
```

**Issue**: Dependencies not installed
```bash
# Solution: Use Root Directory setting
# Set Root Directory to: . (root)
```

### Frontend Can't Connect to Backend

**Issue**: CORS errors or connection refused
```bash
# Solution: Update VITE_API_URL environment variable
# Set to: https://dataroom-backend.vercel.app
```

**Issue**: Wrong API URL in production
```bash
# Solution: Check .env variables in Vercel dashboard
# Ensure VITE_API_URL is set correctly
```

### Backend Returns 502 Errors

**Issue**: Function timeout
```bash
# Solution: Increase Max Duration in Vercel settings
# Set to 60 seconds or higher
```

**Issue**: Memory limit exceeded
```bash
# Solution: Optimize code or increase memory
# Set to 3008 MB in settings (maximum)
```

### localStorage Not Persisting

**Issue**: Data lost on refresh in production
```bash
# Solution: localStorage works the same in production
# Check that your store is properly initializing
```

**Issue**: Domain differences (http vs https)
```bash
# Solution: Ensure both frontend and backend use HTTPS
# Enable automatic HTTPS redirects
```

## Advanced Configuration

### Custom Build Scripts

If you need custom build logic, create `build.sh`:

```bash
#!/bin/bash
set -e

# Install dependencies
pnpm install

# Run tests
pnpm test --run

# Build frontend
cd packages/frontend
pnpm build

# Build backend
cd packages/backend
pnpm build

echo "Build completed successfully"
```

### Monitoring and Analytics

1. **Vercel Analytics**:
   - Dashboard → Analytics
   - Monitor performance metrics
   - Track errors and issues

2. **Error Tracking**:
   - Vercel → Deployments → Logs
   - Check build and runtime logs
   - Monitor function invocations

3. **Performance**:
   - Monitor First Contentful Paint (FCP)
   - Track Largest Contentful Paint (LCP)
   - Monitor Cumulative Layout Shift (CLS)

### Scaling

**Frontend**:
- Vercel automatically scales static sites
- No additional configuration needed

**Backend**:
- Vercel scales serverless functions automatically
- Concurrent executions limited by plan
- Monitor usage in Analytics tab

## Cost Estimation

### Free Tier
- Includes: 100 deployments/month, 100 GB bandwidth
- Suitable for: Development, testing, low-traffic apps

### Pro Plan ($20/month)
- Includes: Unlimited deployments, 1 TB bandwidth
- Suitable for: Production applications

### Enterprise
- Custom pricing
- Dedicated support
- Advanced features

## Post-Deployment

### 1. Test Functionality
```bash
# Test frontend loads
curl https://dataroom-frontend.vercel.app

# Test API responds
curl https://dataroom-backend.vercel.app/api/health

# Test CORS
curl -H "Origin: https://dataroom-frontend.vercel.app" \
     https://dataroom-backend.vercel.app/api/health
```

### 2. Monitor Logs
```bash
# View build logs
vercel logs --follow

# View deployment logs
vercel deployments
```

### 3. Set Up DNS (if custom domain)
```
Nameservers to point to Vercel:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### 4. Enable Analytics

In Vercel Dashboard:
1. Go to Analytics tab
2. Enable Web Analytics
3. Track performance metrics

### 5. Configure Alerts

Set up alerts for:
- Build failures
- Error rate spikes
- Performance degradation
- Deployment issues

## Alternative: Deploy as Single Application

If you want to deploy as a single Vercel project:

1. **Create API routes** in frontend (`pages/api/`)
2. **Move backend logic** to API routes
3. **Deploy as single project**

```
vercel.json:
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "packages/frontend/dist"
}
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/runtimes/nodejs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Analytics](https://vercel.com/docs/analytics)

## Support

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://vercel.com/community
- Status: https://www.vercelstatus.com

### Next Steps

1. Deploy frontend first (static, easier)
2. Deploy backend next (serverless functions)
3. Test integration between services
4. Monitor logs and performance
5. Set up custom domain (optional)
6. Configure additional features as needed

---

**Created**: November 28, 2025  
**Status**: Ready for Vercel deployment  
**Framework**: React 18 + Express.js  
**Deployment Type**: Hybrid (Static + Serverless)
