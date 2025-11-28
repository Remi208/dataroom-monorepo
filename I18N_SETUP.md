# Internationalization (i18n) Setup

This document describes the i18n implementation added to the Data Room application.

## Installation

The following packages were installed:
- `i18next` (25.6.3) - Core i18n framework
- `react-i18next` (16.3.5) - React integration for i18next
- `i18next-browser-languagedetector` (8.2.0) - Automatic language detection from browser

```bash
pnpm add i18next react-i18next i18next-browser-languagedetector
```

## Structure

### Configuration Files
- **`src/i18n/config.ts`** - Main i18n configuration
  - Sets up i18next with React
  - Configures language detection (browser language detection + localStorage fallback)
  - Defines fallback language as English
  - Loads translation files for EN and ES

### Translation Files
- **`src/i18n/locales/en.json`** - English translations
- **`src/i18n/locales/es.json`** - Spanish translations

Both files contain translated strings organized by category:
- `app` - Application title and subtitle
- `folder` - Folder-related UI labels
- `file` - File-related UI labels
- `dataroom` - Data room UI labels
- `buttons` - Generic button labels
- `messages` - Alert messages and confirmations

### Components
- **`src/components/LanguageSwitcher.tsx`** - Language switcher component
  - Displays two buttons: English and Español
  - Allows users to switch between EN and ES
  - Shows currently selected language with blue highlighting
  - Persists language preference to localStorage

## Usage

### In Components
```typescript
import { useTranslation } from 'react-i18next'

export function MyComponent() {
    const { t } = useTranslation()
    
    return <button>{t('buttons.create')}</button>
}
```

### Language Detection
The app automatically:
1. Detects browser language preference
2. Falls back to localStorage if previously set
3. Falls back to English if neither available
4. Persists user's language choice to localStorage when changed

## Updated Components

The following components have been updated to use i18n:

### App.tsx
- Added LanguageSwitcher component in top-right corner
- Wrapped main content area with flex column to accommodate language switcher

### FolderView.tsx
Updated all user-facing strings:
- "New Folder" → `t('folder.newFolder')`
- "Create" → `t('buttons.create')`
- "Cancel" → `t('buttons.cancel')`
- "Upload" → `t('file.upload')`
- "Max depth reached" → `t('folder.maxDepthReached')`
- Alert messages for depth restrictions
- Delete confirmation message

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Alternative language

## Adding New Languages

To add a new language:

1. Create a new JSON file in `src/i18n/locales/[lang].json`
2. Update `src/i18n/config.ts` to import and include the new language:
   ```typescript
   import fr from './locales/fr.json'
   
   resources: {
       en: { translation: en },
       es: { translation: es },
       fr: { translation: fr }
   }
   ```
3. Update the LanguageSwitcher component to add a button for the new language

## Browser Support

Works in all modern browsers that support:
- localStorage API
- ES6+ JavaScript features
