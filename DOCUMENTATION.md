# 📚 Complete Documentation

This document serves as the authoritative guide for the Data Room MVP project.

---

## 🚀 Quick Start (5 minutes)

### Installation
```bash
git clone https://github.com/Remi208/my-dropbox.git
cd my-dropbox
pnpm install
pnpm dev
```

**Servers**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📖 Table of Contents

1. [Architecture](#architecture)
2. [Frontend Structure](#frontend-structure)
3. [Features](#features)
4. [Development](#development)
5. [Deployment](#deployment)
6. [Search Feature](#search-feature)
7. [Internationalization](#internationalization)
8. [Testing](#testing)
9. [Docker](#docker)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Design
```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌──────────────────────────────────────────────┐  │
│  │           React Application                  │  │
│  │  ┌──────────────────────────────────────┐   │  │
│  │  │      Features (Search, Files)        │   │  │
│  │  ├──────────────────────────────────────┤   │  │
│  │  │    Shared (Utils, Hooks, Constants)  │   │  │
│  │  ├──────────────────────────────────────┤   │  │
│  │  │         Components (UI Layer)        │   │  │
│  │  └──────────────────────────────────────┘   │  │
│  │                    ↓↑                       │  │
│  │              Store (localStorage)           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Flow
1. User interacts with UI → Component event handler
2. Event handler calls Store methods
3. Store updates localStorage
4. Component state updates
5. UI re-renders

---

## Frontend Structure

### Refactored Architecture (Feature-Based)

```
src/
├── app/                          # Application entry
│   └── App.tsx
│
├── features/                     # Feature modules
│   ├── files/
│   │   └── components/
│   │       └── FilePreview.tsx  # Modal PDF viewer
│   ├── folders/
│   │   └── components/
│   │       └── FolderItem.tsx   # Tree item
│   └── search/
│       └── search.ts             # PDF search
│
├── shared/                       # Reusable code
│   ├── constants/app.ts         # All magic values
│   ├── utils/                   # Helper functions
│   │   ├── url.ts
│   │   ├── file.ts
│   │   └── format.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useClickOutside.ts
│   │   ├── useAsync.ts
│   │   └── useLocalStorage.ts
│   └── components/ui/
│       └── Button.tsx
│
├── components/                   # Page components
│   ├── DataRoomList.tsx
│   ├── DataRoomView.tsx
│   ├── FolderView.tsx
│   ├── SearchBar.tsx
│   └── SearchResults.tsx
│
├── i18n/                        # Multi-language
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       └── es.json
│
├── App.tsx
├── types.ts
├── store.ts
└── main.tsx
```

### Key Improvements from Refactoring
- **Shared Constants**: All magic numbers/strings in one place
- **Shared Utilities**: Reusable functions (URL, file, format)
- **Shared Hooks**: Custom React hooks for common patterns
- **Feature Modules**: Organized by business feature
- **Component Extraction**: FilePreview, FolderItem extracted

---

## Features

### Core Features

#### 1. **Data Room Management**
- Create multiple data rooms
- View all data rooms in sidebar
- Select data room to browse
- Delete data room (cascading delete)

#### 2. **Folder Management**
- Create nested folders (max 5 levels)
- Rename folders
- Delete folders (cascading)
- Drag & drop folders
- Expand/collapse folders

#### 3. **File Management**
- Upload PDF files
- View PDF in-browser modal
- Download PDF
- Rename files
- Delete files
- Drag & drop files

#### 4. **Search**
- Search by filename (case-insensitive)
- Search by PDF content (text extraction)
- Filter results (by name, by content)
- URL-based persistence
- Recent search history

#### 5. **Internationalization**
- English (EN)
- Spanish (ES)
- Language switcher
- All UI text translated

### Advanced Features

#### Search Implementation

**How it works**:
1. User enters query in SearchBar
2. Query is debounced (300ms)
3. Async search triggered
4. For each PDF file:
   - Extract text using pdfjs-dist
   - Search for query (case-insensitive)
   - Return matches with context
5. Results deduplicated
6. Results cached in state
7. URL updated with search parameters

**Search by Name**:
```typescript
- Case-insensitive substring matching
- Returns all matching files
- Sorted by recency
```

**Search by Content**:
```typescript
- PDF text extraction with pdfjs-dist
- Full-text searching
- Context snippet (50 chars around match)
- Only searches if enabled in filters
```

**URL Parameters**:
```
?search=query&searchInNames=true&searchInContent=true
```

#### Drag & Drop

**Files/Folders**:
- Drag item from tree
- Drop into folder
- JSON transferred via dataTransfer
- Validates destination folder

**Depth Checking**:
- Max 5 level nesting
- Prevents invalid drops
- Shows visual feedback

---

## Development

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Start dev servers
pnpm dev

# Frontend URL
http://localhost:5173

# Backend URL
http://localhost:3000
```

### Code Style

#### Using Constants
```typescript
// ❌ BAD
if (depth >= 5) { ... }

// ✅ GOOD
import { CONSTANTS } from './shared/constants'
if (depth >= CONSTANTS.MAX_FOLDER_DEPTH) { ... }
```

#### Using Utilities
```typescript
// ❌ BAD
const bytes = 1024 * 1024
const formatted = bytes + ' MB'

// ✅ GOOD
import { formatFileSize } from './shared/utils'
const formatted = formatFileSize(1024 * 1024)
```

#### Using Hooks
```typescript
// ❌ BAD
const [value, setValue] = useState('')
useEffect(() => {
  const timer = setTimeout(() => {
    setValue(debouncedValue)
  }, 300)
  return () => clearTimeout(timer)
}, [debouncedValue])

// ✅ GOOD
import { useDebounce } from './shared/hooks'
const debouncedValue = useDebounce(value, 300)
```

### Building

```bash
# Build both packages
pnpm build

# Build specific package
pnpm --filter frontend build
pnpm --filter backend build
```

### Linting

```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint --fix
```

---

## Deployment

### Deploy to Vercel (Recommended)

**Frontend**:
```bash
cd packages/frontend
vercel
```

**Backend**:
```bash
cd packages/backend
vercel
```

**Environment Variables** (set in Vercel dashboard):
```
BACKEND_URL=https://backend-url.vercel.app
```

### Deploy with Docker

**Build**:
```bash
docker-compose build
```

**Run**:
```bash
docker-compose up
```

**Individual Services**:
```bash
# Frontend
docker build -f packages/frontend/Dockerfile -t frontend:latest .
docker run -p 3000:80 frontend:latest

# Backend
docker build -f packages/backend/Dockerfile -t backend:latest .
docker run -p 3001:3000 backend:latest
```

---

## Search Feature

### Architecture

#### Components
- **SearchBar.tsx**: Input with filters
- **SearchResults.tsx**: Display results
- **features/search/search.ts**: Algorithms

#### State Flow
```
SearchBar Input
    ↓
Debounce 300ms
    ↓
performSearch() called
    ↓
Two parallel searches:
  1. Search by name
  2. Search by content (async PDF extraction)
    ↓
Deduplicate results
    ↓
Store results in state
    ↓
Update URL parameters
    ↓
Display SearchResults
```

#### PDF Text Extraction

Uses **pdfjs-dist**:
1. Copy buffer to avoid "detached ArrayBuffer" errors
2. Load PDF document
3. For each page:
   - Get text content
   - Extract text items
   - Join into page text
4. Combine all pages

Worker Setup:
```typescript
pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs'
```

### Usage Examples

#### Basic Search
```typescript
import { performSearch } from './features/search'

const results = await performSearch(
  { query: 'invoice', searchInNames: true, searchInContent: true },
  filesMap,
  foldersMap,
  dataRooms
)
```

#### Search with Filters
```typescript
const results = await performSearch(
  {
    query: 'contract',
    searchInNames: true,
    searchInContent: false,
    dateFrom: Date.now() - 30 * 24 * 60 * 60 * 1000,  // Last 30 days
    sizeMax: 10 * 1024 * 1024  // Max 10MB
  },
  filesMap,
  foldersMap,
  dataRooms
)
```

---

## Internationalization

### Setup

i18next configuration: `src/i18n/config.ts`

```typescript
i18next
  .use(HttpBackend)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enJSON },
      es: { translation: esJSON }
    }
  })
```

### Adding Translations

1. Add key to `src/i18n/locales/en.json`:
```json
{
  "button.save": "Save"
}
```

2. Add Spanish translation to `src/i18n/locales/es.json`:
```json
{
  "button.save": "Guardar"
}
```

3. Use in component:
```typescript
import { useTranslation } from 'react-i18next'

export function Component() {
  const { t } = useTranslation()
  return <button>{t('button.save')}</button>
}
```

### Current Translations
- **UI Labels**: All button, menu, dialog texts
- **Placeholders**: Search, input fields
- **Messages**: Error, success, confirmation messages
- **Labels**: Data room, folder, file labels

Languages:
- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)

---

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Test Files
- `frontend/__tests__/`: Frontend tests
- `backend/__tests__/`: Backend tests

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { performSearch } from './search'

describe('performSearch', () => {
  it('should find files by name', async () => {
    const results = await performSearch(
      { query: 'test' },
      filesMap,
      foldersMap,
      dataRooms
    )
    expect(results.length).toBeGreaterThan(0)
  })
})
```

---

## Docker

### Development with Docker

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Build

```bash
docker build --target production -t dataroom:prod .
```

### Docker Compose Services

```yaml
services:
  frontend:
    build: ./packages/frontend
    ports: ["3000:80"]
  
  backend:
    build: ./packages/backend
    ports: ["3001:3000"]
```

---

## Troubleshooting

### Frontend Issues

#### Port 5173 already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use different port
pnpm dev --port 3001
```

#### PDF viewer not loading
- Check worker path: `/public/js/pdf.worker.min.mjs`
- Verify browser console for errors
- Ensure PDF is valid

#### Search not working
- Check browser console for errors
- Verify PDF files are loading
- Check localStorage is not disabled
- Try a different browser

#### Styling issues
- Clear Tailwind cache: `rm -rf .next`
- Rebuild: `pnpm build`

### Backend Issues

#### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

#### CORS errors
- Check backend CORS configuration
- Verify frontend URL in allowed origins

### General Issues

#### pnpm install fails
```bash
pnpm install --force
pnpm install --shamefully-hoist
```

#### TypeScript errors
```bash
pnpm tsc --noEmit
```

#### Clean reinstall
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev
- **Tailwind**: https://tailwindcss.com
- **Express**: https://expressjs.com
- **pdfjs-dist**: https://mozilla.github.io/pdf.js
- **i18next**: https://www.i18next.com

---

## License

MIT

## Author

Remi208
