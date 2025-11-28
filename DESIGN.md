# Data Room MVP - Design Decisions & Architecture

## Overview

This document outlines the key architectural decisions, design patterns, and technical choices made for the Data Room MVP project.

## 1. Monorepo Structure

### Decision: pnpm Workspaces

**Choice**: pnpm workspaces (monorepo)

**Rationale**:
- Single source of truth for dependencies
- Faster installations and better performance
- Shared TypeScript configuration and types
- Native monorepo support with workspace protocol
- Efficient disk usage (content-addressable store)
- Better for small teams and MVPs

**Why pnpm over npm workspaces?**
- ✅ Faster installations (parallel + caching)
- ✅ Disk efficient (hard links instead of copies)
- ✅ Stricter dependency resolution
- ✅ Better workspace commands (filtering, recursive)
- ✅ Production-ready for scaling

**Alternative Considered**: Separate repositories
- ❌ More complex dependency management
- ❌ Harder to keep types in sync
- ❌ Redundant configuration

## 2. Frontend Architecture

### 2.1 State Management

**Choice**: Client-side Store class with localStorage

```typescript
class DataRoomStore {
  private state: StorageState = {...}
  private saveToStorage(): void { ... }
  private loadFromStorage(): void { ... }
}
```

**Rationale**:
- Simple and straightforward for MVP
- No external state management library needed
- Persistent across page refreshes
- Easy to migrate to Redux/Zustand later
- Single source of truth

**Data Flow**:
```
React Component
    ↓ (calls store methods)
DataRoomStore (in-memory + localStorage)
    ↓ (notifies via callback)
Component re-renders
```

### 2.2 Component Hierarchy

```
App
├── DataRoomList (sidebar)
│   └── [DataRoom items with actions]
└── DataRoomView (main content)
    └── FolderView (tree structure)
        └── [Folder/File items with actions]
            └── FilePreview (modal)
```

**Design Principles**:
- **Single Responsibility**: Each component handles one concern
- **Prop Drilling**: Acceptable for MVP, can refactor with Context API later
- **Controlled Components**: All state in store, UI reflects store state
- **Granular Updates**: Each action refreshes only affected parts

### 2.3 Data Structures

#### Folder Model
```typescript
interface Folder {
  id: string
  name: string
  parentFolderId: string | null
  createdAt: number
  updatedAt: number
  children: (Folder | FileMetadata)[]  // Recursive
}
```

**Why recursive children array?**
- Mirrors file system hierarchy
- Enables tree view component easily
- Supports nested folders naturally
- Solves the nested folder requirement

#### FileMetadata Model
```typescript
interface FileMetadata {
  id: string
  name: string
  parentFolderId: string | null
  size: number
  type: string
  createdAt: number
  updatedAt: number
}
```

**Note**: Actual file data stored separately in `StoreFile` to allow metadata-only queries

### 2.4 Key Implementation Details

#### Folder Operations

**Create Folder**:
```typescript
createFolder(parentFolderId, name) {
  const folder = { id, name, parentFolderId, children: [] }
  this.folders.set(id, folder)
  parentFolder.children.push(folder)
}
```
✅ O(1) creation time
✅ Children array keeps parent-child link

**Delete Folder Recursively**:
```typescript
deleteFolderRecursive(id) {
  folder.children.forEach(child => {
    if (isFolder) deleteFolderRecursive(child.id)
    else deleteFile(child.id)
  })
}
```
✅ Handles cascading deletes
✅ Cleans up all references

#### File Upload

```typescript
uploadFile(parentFolderId, name, data, type) {
  const file = { id, name, parentFolderId, data, ... }
  this.files.set(id, file)
  parentFolder.children.push(metadata)  // Only metadata in folder
}
```
✅ Separates metadata from blob data
✅ Enables quick folder operations
✅ Memory efficient

## 3. Styling Approach

### Choice: Tailwind CSS

**Rationale**:
- Rapid UI development
- Consistent spacing and colors
- No custom CSS needed
- Easy to maintain
- Great for MVPs

**Color System**:
- CSS variables for theming
- Light/dark mode support (future)
- Semantic color names (primary, destructive, muted)

**Component Styling**:
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90" />
```
✅ Utility-first approach
✅ Responsive breakpoints available
✅ No CSS bloat

## 4. UI/UX Patterns

### 4.1 Inline Editing

**Decision**: Inline edit mode instead of modals

```tsx
{isEditing ? (
  <input value={editName} onChange={...} />
) : (
  <span onClick={() => startEdit()}>{name}</span>
)}
```

**Why**:
- Less modal fatigue
- Clearer context
- Faster workflow
- Matches modern apps (Google Drive, Notion)

### 4.2 Hover Actions

**Pattern**: Actions appear on hover

```tsx
<div className="group">
  <div>Item content</div>
  <div className="hidden group-hover:flex">Edit/Delete buttons</div>
</div>
```

**Benefits**:
- Clean, minimal UI
- Familiar interaction pattern
- Reduces visual clutter
- Easy to discover via exploration

### 4.3 Confirmation Dialogs

```tsx
if (confirm(`Delete "${name}"?`)) {
  deleteItem()
}
```

**Why**:
- Prevents accidental destructive actions
- Simple and effective for MVP
- Can upgrade to custom modals later

### 4.4 Tree View Implementation

```tsx
{expandedFolders.has(id) && (
  folder.children.map(child => 
    <FolderItem key={child.id} depth={depth+1} />
  )
)}
```

**Features**:
- Expand/collapse folders
- Visual hierarchy with indentation
- Lazy rendering (only visible items)
- Works with very deep nesting

## 5. Error Handling & Edge Cases

### Handled Scenarios

**1. Duplicate Filenames**
```typescript
// Each file gets unique ID regardless of name
uploadFile(folder, "document.pdf", data)  // file1
uploadFile(folder, "document.pdf", data)  // file2
// Both exist with same name but different IDs
```

**2. Cascading Deletes**
```typescript
deleteFolder(folder) {
  // Recursively deletes all nested folders and files
}
```

**3. Invalid File Types**
```typescript
if (file.type !== 'application/pdf') {
  alert('Only PDF files supported')
}
```

**4. Empty Folders**
```tsx
{folder.children.length === 0 ? (
  <p>This folder is empty...</p>
) : (...)}
```

**5. File Upload Failure**
- FileReader.readAsArrayBuffer error handling
- Type validation before storage

## 6. Backend Architecture

### 6.1 Express.js Setup

**Minimal API Structure**:
```
/api/health          - Health check
/api/datarooms       - List/create rooms
/api/datarooms/:id/* - Room operations
```

**Why minimal for MVP?**
- Data currently stored client-side
- Backend primarily serves static frontend
- Ready for expansion
- Demonstrates full-stack thinking

### 6.2 CORS Configuration

```typescript
app.use(cors())
```

**Allows**:
- Frontend on 5173 to call backend on 3000
- Future mobile app integration
- Proper API architecture

### 6.3 API Response Format

```typescript
{
  message: "Operation description",
  note: "Currently data stored in browser"
}
```

Signals MVP status while documenting future implementation.

## 7. Performance Considerations

### Frontend

**Tree View Rendering**:
```tsx
{folder.children.map(item => renderItem(item, depth))}
```
✅ Only renders visible items
✅ Depth tracking for indentation
✅ Efficient re-renders

**State Updates**:
- Minimal re-renders via selective store updates
- localStorage debouncing (saves on every operation)
- Can add batching if performance issues arise

**File Storage**:
- ArrayBuffer for efficient binary storage
- No base64 encoding bloat
- Suitable for PDF files

### Backend

**Stateless Design**:
- No session management for MVP
- Easy to scale horizontally
- Each request independent

## 8. Testing Strategy

### Unit Tests (Planned)
```typescript
describe('DataRoomStore', () => {
  it('creates dataroom with root folder', () => {})
  it('cascades delete for nested items', () => {})
  it('persists to localStorage', () => {})
})
```

### Component Tests (Planned)
```typescript
describe('FolderView', () => {
  it('expands and collapses folders', () => {})
  it('uploads PDF files', () => {})
  it('deletes items with confirmation', () => {})
})
```

## 9. Security & Privacy (MVP Limitations)

### Current State
- ❌ No authentication
- ❌ No encryption
- ❌ Client-side only
- ⚠️ Data visible in localStorage

### Production Roadmap

**Phase 1: Authentication**
- OAuth 2.0 (Google, Microsoft)
- JWT token management
- Session handling

**Phase 2: Encryption**
- End-to-end encryption for files
- Encryption at rest
- HTTPS required

**Phase 3: Authorization**
- Role-based access control
- File sharing with permissions
- Audit logging

## 10. Deployment Architecture

### Frontend Deployment

**Option 1: Vercel (Recommended)**
```
- Zero-config deployment
- Automatic builds from Git
- Preview deployments
- Edge functions support
```

**Option 2: Netlify**
```
- Similar to Vercel
- Good for static sites
- Form handling
```

**Option 3: Self-hosted**
```
- Docker container
- Any Node.js hosting
- Full control
```

### Backend Deployment

**Option 1: Vercel (Serverless)**
```
- Scalable
- Pay-per-use
- Cold start considerations
```

**Option 2: Heroku**
```
- Simple deployment
- Always-on dyos
- Cost-effective for MVP
```

**Option 3: Self-hosted**
```
- Full control
- Traditional Node.js server
- More DevOps work
```

## 11. Database Migration Path

### Current: localStorage (In-Memory + Persistence)
```
Browser → localStorage → File System
```

### Phase 2: Backend Database
```
Browser → Backend API → PostgreSQL/MongoDB
                     → Cloud Storage (S3/Blob)
```

**No breaking changes needed** because:
- Store methods remain same interface
- Can add DB calls internally
- Gradual migration possible
- Cache layer for performance

## 12. Lessons Learned & Recommendations

### ✅ What Worked Well
1. Simple state management without Redux
2. Recursive folder structure for nesting
3. Tailwind CSS for rapid UI development
4. TypeScript for type safety
5. Monorepo for shared types

### ⚠️ Future Improvements
1. Add React Context for prop drilling
2. Implement infinite scroll for large folders
3. Add virtual scrolling for performance
4. Extract custom hooks (useDataRoom, useFolder)
5. Add comprehensive error boundaries

### 🚀 Scaling Considerations
1. Lazy load folder contents
2. Paginate file listings
3. Add search/filter functionality
4. Implement undo/redo (history)
5. Add batch operations

## 13. Code Organization Principles

### Separation of Concerns
```
store.ts      - All state logic
types.ts      - Shared interfaces
components/   - UI layer only
  DataRoomList.tsx
  FolderView.tsx
  ui/Button.tsx
```

### Import Patterns
```typescript
// ✅ Good: Import from appropriate layers
import { store } from '@/store'
import { DataRoom } from '@/types'
import { Button } from '@/components/ui/Button'

// ❌ Avoid: Circular imports, index.ts re-exports
```

## Conclusion

This architecture prioritizes:
1. **Simplicity** - Easy to understand and extend
2. **Pragmatism** - MVP-ready but production-capable
3. **Scalability** - Foundation for future growth
4. **User Experience** - Modern, intuitive interface
5. **Code Quality** - TypeScript, proper patterns

The design allows this MVP to be deployed immediately while maintaining a clear path to production-grade features like authentication, real-time collaboration, and cloud storage integration.
