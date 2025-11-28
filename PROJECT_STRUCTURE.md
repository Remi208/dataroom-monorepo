# Project Structure Summary

Complete monorepo setup for Data Room MVP with React frontend and Node.js backend.

## Root Level Files

```
my-dropbox/
├── package.json              # Monorepo root with pnpm workspaces
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── .npmrc                    # pnpm settings
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore patterns
├── README.md                 # Main documentation
├── QUICKSTART.md             # 5-minute setup guide
├── DESIGN.md                 # Architecture & design decisions
├── ROADMAP.md                # Features & development phases
├── CONTRIBUTING.md           # Contribution guidelines
└── scripts/
    └── dev.sh                # Development helper script
```

## Frontend Package

```
packages/frontend/
├── package.json              # Frontend dependencies
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript Node config
├── vite.config.ts            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── index.html                # Entry HTML file
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Root component
    ├── types.ts              # TypeScript interfaces
    ├── store.ts              # State management store
    ├── index.css             # Global styles with Tailwind
    └── components/
        ├── DataRoomList.tsx  # Data room sidebar
        ├── DataRoomView.tsx  # Main data room view
        ├── FolderView.tsx    # Tree view for folders/files
        └── ui/
            └── Button.tsx    # Reusable button component
```

## Backend Package

```
packages/backend/
├── package.json              # Backend dependencies
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
└── src/
    └── server.ts             # Express server entry point
```

## Key Features

### Data Structures (types.ts)
- `Folder` - Recursive folder structure with children
- `FileMetadata` - File metadata without blob data
- `StoreFile` - File with ArrayBuffer data
- `DataRoom` - Container for organized documents

### State Management (store.ts)
- `DataRoomStore` class with methods for:
  - Create/read/update/delete data rooms
  - Create/update/delete folders (with cascading)
  - Upload/rename/delete files
  - Persistent localStorage storage

### Components
1. **DataRoomList** - Sidebar listing all data rooms
   - Create new data room
   - Select current data room
   - Edit/delete data room
   - Inline editing with confirmation

2. **DataRoomView** - Main view for selected data room
   - Shows data room header
   - Loads root folder structure
   - Displays folder/file tree

3. **FolderView** - Tree view for folder navigation
   - Expand/collapse folders
   - Create nested folders
   - Upload PDF files
   - Rename/delete items
   - Preview PDF files
   - Download files

4. **Button** - Reusable UI component
   - Multiple variants (default, outline, ghost)
   - Multiple sizes (sm, default, lg)
   - Tailwind styling

### Backend API
- `/api/health` - Health check
- `/api/datarooms` - List/create data rooms (placeholder)
- `/api/datarooms/:id/folders` - Folder operations (placeholder)
- `/api/datarooms/:id/upload` - File upload (placeholder)

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin support
- **dotenv** - Environment config

### Development Tools
- **pnpm 9** - Fast, efficient package manager for monorepo
- **Vitest** - Testing framework
- **ESLint** - Code quality
- **TypeScript** - Static typing

## Development Workflow

### Start Development
```bash
pnpm install                   # Install all dependencies
pnpm dev                       # Start frontend + backend
```

### Build for Production
```bash
pnpm build                     # Build both packages
```

### Running Individually
```bash
pnpm -F frontend dev           # Frontend only
pnpm -F backend dev            # Backend only
```

## File Organization Principles

### By Concern
- **types.ts** - All TypeScript interfaces
- **store.ts** - All state logic
- **components/** - All UI components
- **src/index.css** - All global styles

### Naming Conventions
- **Components** - PascalCase.tsx
- **Types** - types.ts (single file)
- **Utilities** - camelCase.ts
- **CSS** - index.css or component-specific

### Import Paths
```typescript
import { DataRoom, Folder } from '@/types'
import { store } from '@/store'
import { DataRoomList } from '@/components/DataRoomList'
import { Button } from '@/components/ui/Button'
```

## Configuration Files

### TypeScript (tsconfig.json)
- ES2020 target with DOM lib
- Strict mode enabled
- JSX React mode
- Path aliases for clean imports
- Module resolution with bundler strategy

### Tailwind (tailwind.config.js)
- Scans src/ for usage
- Extended color system with CSS variables
- Semantic color names (primary, destructive, muted)
- Rounded corners configuration
- Dark mode support ready

### Vite (vite.config.ts)
- React plugin for JSX/TSX
- Path alias (@/ for src)
- Dev server on port 5173
- Proxy to backend API on :3000

### Express (server.ts)
- CORS enabled
- JSON body parser
- Health check endpoint
- Placeholder routes for future API

## Git Structure

### Branches
- `main` - Production-ready code
- `develop` - Development integration
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commits
- Semantic commit messages
- Linked to issues when relevant
- Squashed before merge
- Meaningful commit history

## Storage Architecture

### Current Implementation
```
Browser
├── localStorage (persistent)
│   └── Metadata + folder structure
├── Memory (session)
│   └── File ArrayBuffers
└── URL.createObjectURL (temp)
    └── PDF preview/download
```

### Future Path
```
Browser → Backend API → Database → Cloud Storage
```

No breaking changes when migrating because store methods stay the same.

## Performance Considerations

### Frontend
- Tree view with expand/collapse (lazy rendering)
- File data separate from metadata (fast queries)
- localStorage for persistence (instant startup)
- Efficient re-renders via store methods

### Backend
- Stateless design (scalable)
- CORS headers for browser requests
- Minimal footprint for MVP
- Ready to scale with database/cache layers

## Accessibility Features

- Semantic HTML (div, button, section)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management for modals
- Color contrast compliance
- Responsive design

## Documentation Structure

1. **README.md** - Overview & features
2. **QUICKSTART.md** - 5-minute setup
3. **DESIGN.md** - Architecture deep dive
4. **ROADMAP.md** - Future features
5. **CONTRIBUTING.md** - How to contribute
6. **Code comments** - Implementation details
7. **JSDoc comments** - Function documentation

## Testing Strategy

### Unit Tests (store.ts)
```typescript
- Create/read/update/delete data rooms
- Create/delete folders recursively
- Upload/rename/delete files
- localStorage persistence
```

### Component Tests (planned)
```typescript
- Folder expand/collapse
- File upload flow
- Inline editing
- Delete confirmation
```

## Security Baseline

### MVP (Current)
- ✅ No sensitive data exposure
- ⚠️ Client-side storage
- ❌ No authentication
- ❌ No encryption

### Roadmap
- Authentication (OAuth 2.0)
- Encryption at rest
- Encryption in transit (HTTPS)
- Server-side storage
- Access control

## Deployment Ready

### Frontend (Vercel/Netlify)
- `pnpm build` → `dist/` directory
- Automatically served
- Preview deployments
- Environment variables support

### Backend (Vercel/Heroku/Self-hosted)
- `pnpm build` → `dist/` directory
- Start with `pnpm start`
- PORT environment variable
- CORS configured

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Start dev servers: `pnpm dev`
3. ✅ Open browser: http://localhost:5173
4. ✅ Create first data room
5. ✅ Try uploading PDFs
6. 📖 Read DESIGN.md for architecture
7. 🚀 Follow ROADMAP.md for features
8. 🤝 See CONTRIBUTING.md to help
9. 📚 Check PNPM_GUIDE.md for pnpm details

---

**Project Status**: MVP Complete ✅
**Ready for**: Deployment & User Testing
**Next Phase**: Authentication & Backend Integration

Created: November 2025
