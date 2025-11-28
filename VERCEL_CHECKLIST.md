# Vercel Deployment: 5-Minute Checklist

## ✅ Pre-Deployment (Already Complete)

- [x] Configuration files created:
  - `vercel.json` (root)
  - `packages/frontend/vercel.json`
  - `packages/backend/vercel.json`
- [x] Environment variables templates created:
  - `packages/frontend/.env.example`
  - `packages/backend/.env.example`
- [x] Backend updated for Vercel serverless
  - `packages/backend/src/server.ts` exports app as default
  - Conditional server start for local development
- [x] Documentation created:
  - `VERCEL_DEPLOYMENT.md` (comprehensive)
  - `VERCEL_QUICK_START.md` (quick start)
  - `VERCEL_SETUP_COMPLETE.md` (setup summary)

---

## 🚀 Deployment Steps (Do This Now)

### Step 1: Push to GitHub (1 minute)
```bash
cd d:/work/my-dropbox
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Deploy Frontend to Vercel (2 minutes)

**Option A: Dashboard (Easiest)**
1. Go to https://vercel.com/new
2. Select your repository
3. Set **Root Directory**: `packages/frontend`
4. Click **Deploy**
5. Wait for deployment to complete
6. Note the URL: `https://dataroom-frontend.vercel.app`

**Option B: CLI**
```bash
npm install -g vercel
cd packages/frontend
vercel
```

### Step 3: Deploy Backend to Vercel (2 minutes)

**Option A: Dashboard**
1. Go to https://vercel.com/new
2. Select your repository again
3. Set **Root Directory**: `packages/backend`
4. Click **Deploy**
5. Wait for deployment to complete
6. Note the URL: `https://dataroom-backend.vercel.app`

**Option B: CLI**
```bash
cd packages/backend
vercel
```

---

## 🔧 Configuration (1 minute)

### Set Frontend Environment Variables

In **Vercel Dashboard** → Frontend Project → Settings → Environment Variables:

```
VITE_API_URL = https://dataroom-backend.vercel.app
NODE_ENV = production
```

Then **Redeploy Frontend** in Deployments tab.

### Set Backend Environment Variables

In **Vercel Dashboard** → Backend Project → Settings → Environment Variables:

```
NODE_ENV = production
CORS_ORIGIN = https://dataroom-frontend.vercel.app
```

Then **Redeploy Backend** in Deployments tab.

---

## ✨ Test Your Deployment

### Test Frontend Loads
```bash
curl https://dataroom-frontend.vercel.app
```
Should return HTML with React app.

### Test Backend API
```bash
curl https://dataroom-backend.vercel.app/api/health
```
Should return: `{"status":"ok","message":"Data Room API is running"}`

### Test in Browser
1. Open: https://dataroom-frontend.vercel.app
2. Should load without errors
3. Language switcher should work
4. Data should persist to localStorage
5. No CORS errors in console

---

## 📊 Verify in Dashboard

### Frontend Project
- Deployments tab: Should show successful build
- Logs: Should show build completed
- Analytics: Monitor performance metrics

### Backend Project
- Deployments tab: Should show successful build
- Logs: Check function logs for errors
- Analytics: Monitor API calls and response times

---

## 🆘 Troubleshooting

### Frontend Build Fails
**Issue**: "Command not found" or build error
**Solution**:
1. Check Root Directory is: `packages/frontend`
2. Check Build Command shows: `npm run build`
3. Check Output Directory shows: `dist`
4. Redeploy with correct settings

### Backend Returns 502
**Issue**: Function error or timeout
**Solution**:
1. Check `vercel.json` is in `packages/backend/`
2. Check `server.ts` has `export default app`
3. Check function logs for errors
4. May need to increase Max Duration (default: 60s)

### CORS Errors
**Issue**: Frontend can't connect to backend
**Solution**:
1. Verify `VITE_API_URL` is set in frontend
2. Verify `CORS_ORIGIN` is set in backend
3. Both URLs must use exact HTTPS format
4. Redeploy both projects after setting variables

### API URL Wrong
**Issue**: Data Room loads but can't reach API
**Solution**:
1. Check environment variable: `VITE_API_URL`
2. Should be: `https://dataroom-backend.vercel.app`
3. Update in Vercel dashboard
4. Redeploy frontend

---

## 📈 After Deployment

### Enable Auto-Deployments
1. **Frontend** → Settings → Git
   - Enable: "Auto-deploy on push to main"
2. **Backend** → Settings → Git
   - Enable: "Auto-deploy on push to main"

### Monitor Performance
1. **Frontend** → Analytics
   - Watch FCP, LCP, CLS metrics
2. **Backend** → Analytics
   - Monitor function invocations
   - Watch response times

### Set Up Custom Domain (Optional)
1. **Any Project** → Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Automatic HTTPS certificate created

---

## 🔗 Your Live URLs

```
Frontend:  https://dataroom-frontend.vercel.app
Backend:   https://dataroom-backend.vercel.app
```

Or with custom domain:
```
Frontend:  https://app.yourdomain.com
Backend:   https://api.yourdomain.com
```

---

## 📚 Documentation

- **Quick Start**: `VERCEL_QUICK_START.md`
- **Complete Guide**: `VERCEL_DEPLOYMENT.md`
- **Setup Summary**: `VERCEL_SETUP_COMPLETE.md`
- **All Docs**: See `DOCUMENTATION_INDEX.md`

---

## ✅ Final Verification Checklist

After deployment is complete:

- [ ] Frontend URL loads without errors
- [ ] Backend API `/api/health` returns 200
- [ ] Language switcher works
- [ ] Data persists to localStorage
- [ ] No CORS errors in browser console
- [ ] No 502 errors from backend
- [ ] Vercel dashboard shows successful deployments
- [ ] Environment variables set in both projects
- [ ] Auto-deployments enabled (optional)
- [ ] Custom domain configured (optional)

---

## 🎉 You're Done!

Your Data Room application is now live on Vercel. Every push to main will automatically deploy updates to production.

**Total deployment time**: ~10 minutes end-to-end

**Next steps** (optional):
1. Add custom domain
2. Enable analytics monitoring
3. Set up error tracking
4. Configure auto-scaling settings
5. Add team members

---

**Questions?** See `VERCEL_DEPLOYMENT.md` for complete documentation.
