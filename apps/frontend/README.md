# Next.js 14 Enterprise Boilerplate

A production-ready Next.js 14 starter with **internationalization** (Arabic/English with RTL), **Zustand** state management, **Shadcn/UI** components, and comprehensive **theming**.

## 🚀 Features

- ✅ **Next.js 14+** with App Router and Turbopack
- ✅ **TypeScript** for type safety
- ✅ **Internationalization** with next-intl (English/Arabic)
- ✅ **RTL Support** automatic direction switching
- ✅ **Zustand** state management with DevTools & persistence
- ✅ **Shadcn/UI** component library with CSS variables
- ✅ **Tailwind CSS v4** for styling
- ✅ **Dark/Light Mode** theme switching
- ✅ **Lucide React** icons
- ✅ **Zod** for validation

## 📁 Project Structure

```
frontend/
├── i18n/                      # i18n configuration
├── middleware.ts              # Locale routing
├── src/
│   ├── app/[locale]/         # Locale-based routes
│   ├── components/
│   │   ├── ui/               # Shadcn components
│   │   ├── providers/        # Theme provider
│   │   └── common/           # Shared components
│   ├── stores/               # Zustand stores
│   ├── i18n/messages/        # Translation files
│   └── lib/                  # Utilities
```

## 🏃 Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (redirects to `/en` or `/ar`)

### Production Build

```bash
npm run build
npm start
```

## 🌍 Internationalization

### Supported Locales

- English (`/en`)
- Arabic (`/ar`) with RTL layout

### Adding a New Language

1. Add locale to `i18n/routing.ts`
2. Create translation file in `src/i18n/messages/{locale}.json`
3. Update `LanguageSwitcher` component

## 🎨 Theming

### Customizing Colors

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.6 0.2 250);
  --background: oklch(1 0 0);
  /* ... */
}
```

### Theme Modes

- Light mode
- Dark mode
- System preference

## 🧩 Adding Components

### Shadcn Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

### Creating a Zustand Store

```typescript
// src/stores/use-example-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ExampleState {
  value: string;
  setValue: (value: string) => void;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        value: '',
        setValue: (value) => set({ value }),
      }),
      { name: 'example-storage' }
    )
  )
);
```

## 📦 Tech Stack

- **Framework**: Next.js 16.0.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **State Management**: Zustand
- **i18n**: next-intl
- **Theme**: next-themes
- **Icons**: Lucide React
- **Validation**: Zod

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 📝 Example Components

### Language Switcher

Located in `src/components/common/language-switcher.tsx`

### Theme Toggle

Located in `src/components/common/theme-toggle.tsx`

### Demo Counter (Zustand)

Located in `src/components/common/demo-counter.tsx`

## 🔧 Configuration Files

- `middleware.ts` - Locale routing middleware
- `i18n/routing.ts` - Locale configuration
- `next.config.ts` - Next.js + next-intl config
- `tsconfig.json` - TypeScript configuration
- `components.json` - Shadcn/UI configuration

## 📚 Documentation

For detailed implementation walkthrough, see the [walkthrough document](/.gemini/antigravity/brain/74b7c0c9-b140-4276-aeb8-1bd4cde8b13e/walkthrough.md).

## 🎯 Next Steps

1. Add authentication (NextAuth.js, Clerk, etc.)
2. Set up API client
3. Add form handling (React Hook Form + Zod)
4. Implement dashboard layout
5. Add testing (Playwright + Vitest)
6. Set up database (Prisma/Drizzle)

## 📄 License

MIT

---

**Built with** ❤️ **using Next.js 14, TypeScript, and modern best practices**
