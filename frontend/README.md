# 🖥️ KeyGuard Dashboard

Enterprise-grade admin dashboard for managing device bindings, API keys, and monitoring security events.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-cyan.svg" alt="Tailwind">
</p>

---

## ✨ Features

- 🔐 **Authentication** - Secure JWT-based login with token refresh
- 📱 **Device Management** - View, approve, suspend, and revoke enrolled devices
- 🔑 **API Key Management** - Create, rotate, and manage LLM API keys
- 📊 **Audit Logs** - Comprehensive activity logging with filtering and export
- ⚙️ **Settings** - Configure security policies, notifications, and preferences
- 🌍 **Internationalization** - English and Arabic with RTL support
- 🌓 **Dark/Light Mode** - System-aware theme switching
- 📱 **Responsive Design** - Works on desktop and mobile devices

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 with App Router |
| **Language** | TypeScript 5 |
| **UI Components** | Shadcn/UI with Radix Primitives |
| **Styling** | Tailwind CSS v4 |
| **State Management** | Zustand with DevTools |
| **Data Fetching** | TanStack React Query |
| **Forms** | React Hook Form + Zod validation |
| **Internationalization** | next-intl |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
frontend/
├── i18n/                      # i18n configuration
│   └── routing.ts             # Locale routing setup
├── middleware.ts              # Locale routing middleware
├── src/
│   ├── app/
│   │   ├── [locale]/          # Locale-based routes
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   ├── login/         # Authentication
│   │   │   └── layout.tsx     # Root layout
│   │   └── globals.css        # Global styles & CSS variables
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── providers/         # Context providers
│   │   ├── common/            # Shared components
│   │   └── dashboard/         # Dashboard-specific components
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand state stores
│   ├── lib/                   # Utilities (cn, api client)
│   ├── services/              # API service layer
│   ├── types/                 # TypeScript interfaces
│   └── i18n/
│       └── messages/          # Translation files (en.json, ar.json)
├── public/                    # Static assets
├── components.json            # Shadcn/UI configuration
├── next.config.ts             # Next.js configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (see [Backend README](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your NEXT_PUBLIC_API_URL
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

### Development

```bash
# Start development server with Turbopack
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) (redirects to `/en` or `/ar`)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🌍 Internationalization

### Supported Locales

| Locale | Language | Direction |
|--------|----------|-----------|
| `en` | English | LTR |
| `ar` | Arabic | RTL |

### Adding a New Language

1. Add locale to `i18n/routing.ts`:
   ```typescript
   export const routing = {
     locales: ['en', 'ar', 'fr'], // Add new locale
     defaultLocale: 'en',
   };
   ```

2. Create translation file `src/i18n/messages/{locale}.json`

3. Update `LanguageSwitcher` component

### Translation Usage

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Dashboard');
  
  return <h1>{t('title')}</h1>;
}
```

---

## 🎨 Theming

### Theme Modes

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes
- **System** - Follows OS preference

### Customizing Colors

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.6 0.2 250);
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
  /* ... */
}

.dark {
  --primary: oklch(0.7 0.2 250);
  --background: oklch(0.1 0 0);
  --foreground: oklch(0.98 0 0);
}
```

---

## 🧩 Adding Components

### Shadcn/UI Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add table
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

---

## 📡 API Integration

### API Client

The API client is configured in `src/lib/api.ts`:

```typescript
import { apiClient } from '@/lib/api';

// GET request
const devices = await apiClient.get('/api/v1/devices');

// POST request
const result = await apiClient.post('/api/v1/devices/enrollment-code', {
  expiresInMinutes: 60
});
```

### React Query Usage

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['devices'],
  queryFn: () => apiClient.get('/api/v1/devices')
});

// Mutate data
const mutation = useMutation({
  mutationFn: (id: string) => apiClient.delete(`/api/v1/devices/${id}`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  }
});
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📱 Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Authentication page |
| **Overview** | `/dashboard` | Dashboard home with stats |
| **Devices** | `/dashboard/devices` | Device management |
| **API Keys** | `/dashboard/api-keys` | API key management |
| **Audit Logs** | `/dashboard/audit-logs` | Activity logs |
| **Settings** | `/dashboard/settings` | Configuration |

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Locale routing middleware |
| `i18n/routing.ts` | Locale configuration |
| `next.config.ts` | Next.js configuration |
| `components.json` | Shadcn/UI configuration |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS/Tailwind configuration |

---

## 🤝 Contributing

1. Follow the existing code style
2. Add translations for new text
3. Test in both light and dark modes
4. Ensure RTL support for new components

---

## 📝 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Part of the KeyGuard Platform</strong>
</p>

<p align="center">
  <a href="../README.md">Main Docs</a> •
  <a href="../backend/README.md">Backend</a> •
  <a href="../packages/sdk/README.md">SDK</a>
</p>
