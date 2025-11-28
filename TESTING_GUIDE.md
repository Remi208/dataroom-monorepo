# Testing Guide

Comprehensive guide for running tests in the Data Room application.

## Overview

The project uses **Vitest** for unit testing:
- **Frontend**: React component testing with `@testing-library/react`
- **Backend**: Express API testing

## Frontend Testing

### Running Tests

Run all frontend tests:

```bash
cd packages/frontend
pnpm test
```

Run tests in watch mode:

```bash
pnpm test --watch
```

Run tests with UI:

```bash
pnpm test --ui
```

Run tests with coverage:

```bash
pnpm test --coverage
```

### Test Files

Frontend tests are located in `packages/frontend/src/__tests__/`:

- **`store.test.ts`** - State management and data persistence tests
- **`LanguageSwitcher.test.tsx`** - Component rendering and i18n tests

### Store Tests

Tests for the data store (`src/store.ts`) covering:

#### Data Room Operations
- ✅ Create data room
- ✅ Retrieve all data rooms
- ✅ Retrieve specific data room
- ✅ Update data room name
- ✅ Delete data room

```typescript
it('should create a new data room', () => {
    const dataRoom = store.createDataRoom('Test Room')
    expect(dataRoom.name).toBe('Test Room')
})
```

#### Folder Operations
- ✅ Create folder
- ✅ Retrieve folder structure
- ✅ Update folder name
- ✅ Create nested folders (depth testing)

```typescript
it('should create nested folders up to max depth', () => {
    // Tests maximum nesting depth of 5 levels
})
```

#### File Operations
- ✅ Upload file
- ✅ Retrieve file
- ✅ Update file name
- ✅ Delete file
- ✅ Get all files in folder

```typescript
it('should upload a file', () => {
    const file = store.uploadFile(
        folderId,
        'test.pdf',
        new ArrayBuffer(8),
        'application/pdf'
    )
    expect(file.name).toBe('test.pdf')
})
```

#### Advanced Operations
- ✅ Move file to another folder
- ✅ Move folder to another folder
- ✅ Delete folder recursively with contents

```typescript
it('should move a file to another folder', () => {
    store.moveFile(file.id, folder2.id)
    expect(store.getFile(file.id).parentFolderId).toBe(folder2.id)
})
```

#### Persistence
- ✅ Persist data to localStorage
- ✅ Load data from localStorage

```typescript
it('should persist data to localStorage', () => {
    const savedData = localStorage.getItem('dataRoomsData')
    expect(savedData).toBeDefined()
})
```

### LanguageSwitcher Component Tests

Tests for the language switcher component covering:

- ✅ Render language switcher buttons
- ✅ Highlight English button when selected
- ✅ Highlight Spanish button when selected
- ✅ Change language when button clicked
- ✅ Switch between languages

```typescript
it('should render language switcher buttons', () => {
    render(
        <I18nextProvider i18n={i18n}>
            <LanguageSwitcher />
        </I18nextProvider>
    )
    expect(screen.getByText('English')).toBeDefined()
    expect(screen.getByText('Español')).toBeDefined()
})
```

### Test Coverage

Coverage targets:
- Store functions: 100%
- Components: 90%+
- Utilities: 95%+

Generate coverage report:

```bash
pnpm test --coverage
```

Coverage report location: `coverage/index.html`

## Backend Testing

### Running Tests

Run all backend tests:

```bash
cd packages/backend
pnpm test
```

Run tests in watch mode:

```bash
pnpm test --watch
```

### Test Files

Backend tests are located in `packages/backend/src/__tests__/`:

- **`server.test.ts`** - Express server configuration and API endpoint tests

### Server Tests

Tests for the Express server covering:

#### Basic Setup
- ✅ Express module export
- ✅ Create Express app
- ✅ Add middleware
- ✅ Set up routes
- ✅ CORS support
- ✅ JSON parsing

```typescript
it('should create an Express app', () => {
    const app = express()
    expect(typeof app.use).toBe('function')
})
```

#### Health Check
- ✅ Health check endpoint exists

```typescript
it('should have a health check endpoint', () => {
    app.get('/health', (req, res) => {
        res.json({ status: 'healthy' })
    })
})
```

#### Error Handling
- ✅ Graceful error handling
- ✅ Return 404 for unknown routes

```typescript
it('should return 404 for unknown routes', () => {
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' })
    })
})
```

#### API Endpoints
- ✅ POST /api/datarooms (create)
- ✅ GET /api/datarooms (list)
- ✅ DELETE /api/datarooms/:id (delete)
- ✅ POST /api/upload (file uploads)

```typescript
it('should accept POST /api/datarooms', () => {
    app.post('/api/datarooms', (req, res) => {
        res.status(201).json({ id: 'test' })
    })
})
```

## Running All Tests

From the root directory, run tests for all packages:

```bash
# Frontend tests
cd packages/frontend && pnpm test

# Backend tests
cd packages/backend && pnpm test

# Or use pnpm workspaces
pnpm -r test
```

## Test Configuration

### Frontend (vitest.config.ts)

```typescript
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            reporter: ['text', 'json', 'html']
        }
    }
})
```

**Configuration details:**
- `globals: true` - Global test functions without imports
- `environment: 'jsdom'` - Browser environment simulation
- `coverage` - Code coverage reporting

### Backend (vitest.config.ts)

```typescript
export default defineConfig({
    test: {
        globals: true,
        environment: 'node'
    }
})
```

## Writing Tests

### Frontend Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../store'

describe('Store', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('should create a data room', () => {
        const room = store.createDataRoom('Test')
        expect(room.name).toBe('Test')
    })
})
```

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

it('should render buttons', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText('English')).toBeDefined()
})
```

### Backend Example

```typescript
import { describe, it, expect } from 'vitest'
import express from 'express'

describe('API', () => {
    it('should create app', () => {
        const app = express()
        expect(app).toBeDefined()
    })
})
```

## Debugging Tests

### Using console.log

```typescript
it('should work', () => {
    const result = store.createDataRoom('Test')
    console.log(result) // Will appear in test output
    expect(result).toBeDefined()
})
```

### Using debugger

```bash
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### VS Code Integration

1. Add to `.vscode/launch.json`:

```json
{
    "type": "node",
    "request": "launch",
    "name": "Vitest",
    "runtimeExecutable": "pnpm",
    "runtimeArgs": ["test", "--inspect-brk"],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

2. Set breakpoints and press F5 to debug

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm -r test
```

## Performance Metrics

### Test Execution Time

Frontend tests: ~2-3 seconds
Backend tests: ~1-2 seconds

### Memory Usage

Average: ~200MB
Peak: ~500MB

## Troubleshooting

### Tests Not Running

```bash
# Clear cache
rm -rf node_modules/.vitest

# Reinstall
pnpm install
```

### Module Not Found

```bash
# Ensure imports are correct
# Use relative paths: ../store
# Not absolute: /store
```

### Timeout Issues

```typescript
it('should work', async () => {
    // Increase timeout for slow tests
}, { timeout: 10000 })
```

## Best Practices

1. **Test one thing per test**
   ```typescript
   // ✅ Good
   it('should create folder', () => { ... })
   it('should delete folder', () => { ... })
   
   // ❌ Bad
   it('should create and delete folder', () => { ... })
   ```

2. **Use meaningful descriptions**
   ```typescript
   // ✅ Good
   it('should move file to another folder')
   
   // ❌ Bad
   it('should work')
   ```

3. **Clean up after tests**
   ```typescript
   afterEach(() => {
       localStorage.clear()
   })
   ```

4. **Mock external dependencies**
   ```typescript
   vi.mock('../api', () => ({
       fetchData: vi.fn()
   }))
   ```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Express Testing](https://expressjs.com/en/resources/middleware/cors.html)
