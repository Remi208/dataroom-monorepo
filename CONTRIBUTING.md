# Contributing Guide

Thank you for your interest in contributing to the Data Room MVP! This document explains how to contribute effectively.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/my-dropbox.git
cd my-dropbox
git remote add upstream https://github.com/Remi208/my-dropbox.git
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code improvements
- `test/` - Adding tests

### 3. Install & Develop
```bash
pnpm install
pnpm dev
```

## Development Guidelines

### Code Style

**TypeScript**:
- Use strict mode (enabled in tsconfig.json)
- Avoid `any` types
- Use meaningful variable names
- Add JSDoc comments for complex functions

```typescript
/**
 * Creates a new folder in the data room
 * @param parentId - Parent folder ID or null for root
 * @param name - Folder name
 * @returns Created folder object
 */
function createFolder(parentId: string | null, name: string): Folder {
  // Implementation
}
```

**React Components**:
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic
- Use meaningful prop names

```tsx
interface FileItemProps {
  file: FileMetadata
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function FileItem({ file, onRename, onDelete }: FileItemProps) {
  // Implementation
}
```

**CSS/Tailwind**:
- Use Tailwind utilities, avoid custom CSS
- Follow mobile-first approach
- Use semantic spacing classes
- Prefer composition over nesting

```tsx
// ✅ Good
<div className="flex items-center gap-2 p-4 bg-accent rounded-md">

// ❌ Avoid
<div style={{display: 'flex', gap: '8px', padding: '16px'}}>
```

### File Organization

```
packages/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataRoomList.tsx
│   │   │   ├── DataRoomView.tsx
│   │   │   ├── FolderView.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       └── index.ts (exports)
│   │   ├── types.ts (interfaces)
│   │   ├── store.ts (state)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── ...
└── backend/
    ├── src/
    │   ├── server.ts (entry point)
    │   ├── routes/
    │   ├── middleware/
    │   └── utils/
    └── ...
```

### Import Organization

```typescript
// 1. External packages
import { useState } from 'react'
import { Button } from './ui/Button'

// 2. Local types
import { Folder, FileMetadata } from './types'

// 3. Local utilities
import { store } from './store'

// 4. CSS/styles (last)
import './styles.css'
```

## Commit Guidelines

### Message Format
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting (not functional)
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Dependencies, tooling

### Examples
```
feat: add file preview modal for PDFs

- Implement FilePreview component
- Add modal styling with Tailwind
- Support PDF rendering with iframe

Closes #123
```

```
fix: handle duplicate filenames in upload

When uploading files with the same name, generate unique IDs
to prevent overwrites. User sees both files in folder.

Fixes #456
```

### Best Practices
- Commit logically related changes together
- Write clear commit messages (present tense)
- Reference issues when relevant
- Keep commits atomic (do one thing)

## Testing

### Run Tests
```bash
pnpm test
```

### Write Tests
```typescript
import { describe, it, expect } from 'vitest'
import { store } from './store'

describe('DataRoomStore', () => {
  it('creates a dataroom with root folder', () => {
    const room = store.createDataRoom('Test Room')
    expect(room.name).toBe('Test Room')
    expect(room.rootFolderId).toBeDefined()
  })

  it('cascades deletes nested items', () => {
    const room = store.createDataRoom('Test')
    const folder = store.createFolder(room.rootFolderId, 'Folder')
    store.deleteFolderRecursive(folder.id)
    expect(store.getFolder(folder.id)).toBeUndefined()
  })
})
```

## Pull Request Process

### Before Submitting
1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   pnpm test
   ```

3. **Check linting**
   ```bash
   pnpm lint
   ```

4. **Build to verify**
   ```bash
   pnpm build
   ```

### Create Pull Request
1. Push to your fork
   ```bash
   git push origin feature/your-feature
   ```

2. Open PR on GitHub with:
   - Clear title describing changes
   - Description of what/why/how
   - Link related issues (#123)
   - Screenshots if UI changes
   - Checklist of changes

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Performance improvement

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add images showing UI changes

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Changes verified locally
```

### Review Process
- At least 1 review required
- Address review comments
- Request re-review after changes
- Squash commits before merging

## Documentation

### Update Docs When
- Adding new features
- Changing API/interface
- Fixing confusing code
- Adding complex logic

### Documentation Files
- `README.md` - Main overview
- `QUICKSTART.md` - Getting started
- `DESIGN.md` - Architecture decisions
- `ROADMAP.md` - Features & timeline
- Code comments - Implementation details

### JSDoc Comments
```typescript
/**
 * Renames a file in the data room
 * 
 * @param fileId - The file ID to rename
 * @param newName - New file name (without path)
 * @throws Error if file not found
 * 
 * @example
 * store.updateFileName('file-123', 'new-document.pdf')
 */
export function updateFileName(fileId: string, newName: string): void {
  // Implementation
}
```

## Common Tasks

### Add a New Component
1. Create file: `src/components/YourComponent.tsx`
2. Add interface for props
3. Export from component
4. Add to exports (optional index.ts)
5. Use in parent component
6. Add Storybook story (future)

### Add a New Route (Backend)
1. Create in `src/routes/`
2. Add to main server.ts
3. Update API documentation
4. Add tests

### Update Types
1. Edit `src/types.ts`
2. Update store methods if needed
3. Update components using type
4. Update tests

### Add Dependencies
1. Run `pnpm add package-name` or `pnpm add -D package-name`
2. Add to appropriate workspace: `pnpm -F frontend add package-name`
3. Update pnpm-lock.yaml (automatic)
4. Document why needed in PR

## Performance Tips

### Frontend
- Use React DevTools Profiler
- Avoid unnecessary re-renders
- Lazy load large components
- Memoize expensive calculations

### Backend
- Use query indexing
- Add caching layer
- Monitor response times
- Profile bottlenecks

## Accessibility

### Checklist
- [ ] Semantic HTML tags
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast ≥ 4.5:1
- [ ] Screen reader friendly
- [ ] Focus management

### Testing
- Test with keyboard only
- Test with screen reader (NVDA, JAWS)
- Check with contrast analyzer
- Use axe DevTools extension

## Security

### Best Practices
- Never commit secrets
- Validate all inputs
- Use environment variables
- Follow OWASP guidelines
- Report vulnerabilities privately

### Reporting Security Issues
Email: security@example.com (before public disclosure)

## Troubleshooting

### TypeScript Errors
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Port Conflicts
```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :3000  # Backend

# Use different port
pnpm -F frontend dev -- --port 5174
```

### Git Issues
```bash
# Sync fork with upstream
git fetch upstream
git rebase upstream/main

# Undo local changes
git checkout -- .

# Reset to upstream
git reset --hard upstream/main
```

## Getting Help

- **Issues**: Check existing issues first
- **Discussions**: Use GitHub Discussions
- **Slack**: Join community Slack (TBD)
- **Email**: Open an issue with `[QUESTION]` tag

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Recognized in release notes
- Acknowledged in README
- Invited to contributor meetings

## License

By contributing, you agree your contributions are licensed under MIT license.

---

**Thank you for contributing!** 🎉

We appreciate your time and effort in making Data Room MVP better. Questions? Ask in an issue!
