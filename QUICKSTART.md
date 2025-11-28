# Quick Start Guide

Get the Data Room MVP running in 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **pnpm 9+** - [Install](https://pnpm.io/installation) or `npm install -g pnpm@latest`
- **Git** - [Download](https://git-scm.com)

> **Why pnpm?** pnpm is faster, more efficient, and has better monorepo support than npm.

## Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Remi208/my-dropbox.git
cd my-dropbox
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for both frontend and backend in parallel.

### 3. Start Development Servers

```bash
pnpm dev
```

You'll see:
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

### 4. Open in Browser

Click: **http://localhost:5173**

## First Time Usage

### Create Your First Data Room

1. Click **"New Data Room"** button (left sidebar)
2. Enter a name: `"My First Data Room"`
3. Click **"Create"**

### Create Folders

1. Select your data room
2. Click **"New Folder"**
3. Enter folder name: `"Q4 Documents"`
4. Click **"Create"**
5. Repeat to create nested folders

### Upload PDFs

1. Click **"Upload PDF"**
2. Select PDF files from your computer
3. Files appear in the current folder
4. Click file name to preview

### Manage Items

- **Rename**: Hover over item → Click edit icon → Type new name
- **Delete**: Hover over item → Click trash icon → Confirm
- **Preview**: Click any file name to open in modal
- **Download**: Click download icon to save file

## Keyboard Shortcuts

- **Enter** - Confirm (in edit mode or forms)
- **Escape** - Cancel editing

## Folder Structure

```
/packages/frontend/  - React SPA
/packages/backend/   - Express API
/scripts/            - Utility scripts
```

## Development Commands

```bash
# Start both servers
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Clean all (node_modules + lock files)
pnpm clean
```

## Work Individually on Frontend or Backend

**Terminal 1: Frontend only**
```bash
pnpm -F frontend dev
```

**Terminal 2: Backend only**
```bash
pnpm -F backend dev
```

## Troubleshooting

### Install pnpm
```bash
npm install -g pnpm@latest
# or
corepack enable pnpm
```

### Port Already in Use
```bash
# Change frontend port
cd packages/frontend
pnpm dev -- --port 5174

# Change backend port
cd packages/backend
PORT=3001 pnpm dev
```

### Dependencies Won't Install
```bash
pnpm clean
pnpm install
```

### TypeScript Errors
These are normal during development. The project still runs with warnings.

## What to Try Next

1. ✅ Create multiple data rooms
2. ✅ Build deep folder hierarchies
3. ✅ Upload PDF files
4. ✅ Test renaming and deletion
5. ✅ Refresh page - data persists!
6. ✅ Open DevTools → Application → Local Storage → "dataroom_store"

## Next Steps

- Read [DESIGN.md](./DESIGN.md) for architecture overview
- Read [README.md](./README.md) for full documentation
- Check code comments for implementation details
- Explore TypeScript types in `packages/frontend/src/types.ts`

## Need Help?

1. Check terminal for error messages
2. Open browser DevTools (F12) for JavaScript errors
3. Verify Node.js version: `node --version`
4. Verify npm version: `npm --version`

## Time Estimates

| Task | Time |
|------|------|
| Clone & Install | 2-3 min |
| Start servers | 1 min |
| Create data room | 30 sec |
| Upload PDF | 30 sec |
| **Total** | **~5 min** ✅ |

---

**You're all set!** 🎉 Start exploring the Data Room MVP.
