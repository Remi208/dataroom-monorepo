# Vercel Deployment Quick Start

## Deploy to Vercel in 5 Minutes

### Prerequisites
- ✅ Code pushed to GitHub/GitLab/Bitbucket
- ✅ Vercel account created (free tier available)

### Quick Deploy Steps

#### 1. **Deploy Frontend** (2 minutes)
```bash
# Option A: Via Dashboard
# 1. Go to https://vercel.com/new
# 2. Select your repository
# 3. Set Root Directory: packages/frontend
# 4. Click Deploy
# Done! Your frontend is live at: https://dataroom-frontend.vercel.app

# Option B: Via CLI
npm install -g vercel
cd packages/frontend
vercel
```

#### 2. **Deploy Backend** (2 minutes)
```bash
# Option A: Via Dashboard
# 1. Go to https://vercel.com/new
# 2. Select same repository
# 3. Set Root Directory: packages/backend
# 4. Click Deploy
# Done! Your backend is live at: https://dataroom-backend.vercel.app

# Option B: Via CLI
cd packages/backend
vercel
```

#### 3. **Connect Frontend to Backend** (1 minute)
```bash
# In Vercel Dashboard → Frontend Project → Settings → Environment Variables
# Add:
# VITE_API_URL = https://dataroom-backend.vercel.app

# Then redeploy frontend:
vercel --prod
```

### Vercel Configuration Files (Already Created)
```
✅ vercel.json (root)
✅ packages/frontend/vercel.json
✅ packages/backend/vercel.json
✅ packages/frontend/.env.example
✅ packages/backend/.env.example
```

### What Each Config Does

**`vercel.json` (Root)**
- Sets pnpm workspace support
- Configures build and install commands
- Enables monorepo detection

**`packages/frontend/vercel.json`**
- Build command: `npm run build`
- Output: `dist` directory
- Sets API URL environment variable

**`packages/backend/vercel.json`**
- Configures serverless Node.js function
- Routes all requests to Express server
- Sets max duration and memory limits

### Environment Variables

**Frontend (Development)**
```env
VITE_API_URL=http://localhost:5000
```

**Frontend (Production on Vercel)**
```env
VITE_API_URL=https://dataroom-backend.vercel.app
```

**Backend (Development)**
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**Backend (Production on Vercel)**
```env
NODE_ENV=production
CORS_ORIGIN=https://dataroom-frontend.vercel.app
```

### Testing Your Deployment

```bash
# Test Frontend
curl https://dataroom-frontend.vercel.app

# Test Backend Health
curl https://dataroom-backend.vercel.app/api/health

# Test CORS
curl -H "Origin: https://dataroom-frontend.vercel.app" \
     https://dataroom-backend.vercel.app/api/health
```

### Deploy from Git (CI/CD)

Every push to `main` automatically deploys:

```bash
# Development branch → Preview deployment
git push origin feature/my-feature

# Main branch → Production deployment
git push origin main
```

### Rollback a Deployment

```bash
# Via CLI
vercel rollback

# Or in Dashboard:
# Deployments → Select previous version → Promote to Production
```

### View Logs

```bash
# Real-time logs
vercel logs --follow

# List recent deployments
vercel deployments

# Get deployment details
vercel deployments --json
```

### Add Custom Domain

**In Vercel Dashboard:**
1. Project → Settings → Domains
2. Add Domain
3. Point DNS to Vercel nameservers
4. Automatic HTTPS certificate

### Monitor Performance

**In Vercel Dashboard:**
1. Analytics tab
2. View Web Vitals:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
3. View errors and slowest endpoints

### Troubleshooting

**Frontend build fails:**
```bash
# Check build logs in Dashboard → Deployments → Build Logs
# Ensure Root Directory is: packages/frontend
# Ensure Build Command is: npm run build
```

**Backend returns 502:**
```bash
# Check function logs in Dashboard
# Ensure vercel.json is in packages/backend/
# Increase Max Duration if needed (60 seconds recommended)
```

**Frontend can't reach API:**
```bash
# Verify VITE_API_URL environment variable in Dashboard
# Should be: https://dataroom-backend.vercel.app
# Redeploy frontend: vercel --prod
```

**CORS Errors:**
```bash
# Update CORS_ORIGIN in backend environment variables
# Should be: https://dataroom-frontend.vercel.app
# Redeploy backend: vercel --prod
```

### Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Node.js Runtime](https://vercel.com/docs/runtimes/nodejs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Status Page](https://www.vercelstatus.com)

### Free Tier Benefits

✅ Unlimited static site deployments  
✅ 100 GB bandwidth/month  
✅ Unlimited serverless functions  
✅ Automatic HTTPS  
✅ Custom domains  
✅ Git integration  
✅ Preview deployments  

### Pro Tips

1. **Use preview deployments** - Each git branch gets a unique URL
2. **Enable analytics** - Track performance in production
3. **Set up error tracking** - Monitor issues automatically
4. **Enable auto-deployments** - Push to main, deploy automatically
5. **Use environment variables** - Never commit secrets

### Upgrade to Pro ($20/month)

- Unlimited bandwidth
- Advanced analytics
- Priority support
- Team collaboration
- Custom git branches

---

## Next Steps

1. ✅ Configuration files created
2. ⏳ Push to Git: `git push origin main`
3. ⏳ Deploy frontend to Vercel
4. ⏳ Deploy backend to Vercel
5. ⏳ Set environment variables
6. ⏳ Test integration
7. ⏳ Add custom domain (optional)

**Total time: ~5-10 minutes to full deployment**
