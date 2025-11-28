# Data Room MVP

A modern document management application for organizing and searching PDFs in virtual data rooms.

**[📚 Full Documentation](./DOCUMENTATION.md)** · **[🔍 Search Guide](./SEARCH_IMPLEMENTATION.md)** · **[🌐 i18n Setup](./I18N_SETUP.md)** · **[🐳 Docker Guide](./DOCKER_GUIDE.md)**

## ✨ Features

- 📁 **Data Rooms** - Create multiple isolated document collections
- 🗂️ **Folders** - Nested folder structures (up to 5 levels deep)
- 📄 **PDF Management** - Upload, view, rename, delete files
- 🔍 **Full-Text Search** - Search by filename and PDF content
- 🎯 **URL Persistence** - Share search results via URL parameters
- 🌍 **i18n** - English and Spanish support
- 🎨 **Responsive UI** - Built with Tailwind CSS
- 📦 **Local Storage** - No backend required (serverless)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers (Frontend: 5173, Backend: 3000)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Express.js, TypeScript |
| **Search** | pdfjs-dist (PDF text extraction) |
| **i18n** | i18next (EN, ES) |
| **State** | localStorage + React hooks |
| **Testing** | Vitest + React Testing Library |
| **Deploy** | Vercel, Docker |

## 📋 Project Structure

```
src/
├── features/              # Business features
│   ├── files/            # File operations
│   ├── folders/          # Folder management
│   └── search/           # PDF search
│
├── shared/               # Reusable code
│   ├── constants/app.ts  # Configuration
│   ├── utils/            # Utilities (url, file, format)
│   └── hooks/            # Custom hooks
│
├── components/           # UI components
├── i18n/                 # Internationalization
├── store.ts              # State management
└── types.ts              # TypeScript types
```

**For complete structure, see [DOCUMENTATION.md](./DOCUMENTATION.md#frontend-structure)**

## 📖 Documentation

- **[📚 Full Documentation](./DOCUMENTATION.md)** - Complete guide with all sections
- **[🔍 Search Implementation](./SEARCH_IMPLEMENTATION.md)** - Search architecture details
- **[🌐 i18n Setup](./I18N_SETUP.md)** - Internationalization guide
- **[🐳 Docker Guide](./DOCKER_GUIDE.md)** - Docker deployment
- **[✅ Testing Guide](./TESTING_GUIDE.md)** - Testing setup and examples
- **[🏗️ Architecture Refactoring](./REFACTORING_SUMMARY.md)** - Code organization changes

## 🌐 Deployment

### Deploy to Vercel (Recommended)
```bash
# Frontend
cd packages/frontend && vercel

# Backend
cd packages/backend && vercel
```

See [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for step-by-step instructions.

### Deploy with Docker
```bash
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT

## 👤 Author

Remi208
