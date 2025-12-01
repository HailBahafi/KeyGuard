# Quick Start Commands

## Development

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Visit: http://localhost:3000 (redirects to /en)

## Testing Locales

- English: http://localhost:3000/en
- Arabic (RTL): http://localhost:3000/ar

## Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Adding Shadcn Components

```bash
# Examples:
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add switch
npx shadcn@latest add tabs
```

## Project Highlights

### ✅ What's Included

- **i18n**: English + Arabic with automatic RTL
- **State**: Zustand with DevTools + LocalStorage
- **UI**: Shadcn components (Button, Dropdown, Card)
- **Themes**: Light/Dark mode with CSS variables
- **Utils**: cn(), zod, lucide-react

### 📂 Key Files

- `middleware.ts` - Locale routing
- `i18n/routing.ts` - Locale config
- `src/app/[locale]/layout.tsx` - Root layout with RTL
- `src/stores/use-app-store.ts` - Demo Zustand store
- `src/components/common/*` - Language switcher, theme toggle, counter

### 🎨 Customizing Theme

Edit `src/app/globals.css`:
```css
:root {
  --primary: oklch(0.6 0.2 250);    /* Your brand color */
  --background: oklch(1 0 0);       /* Background */
}
```

### 🌍 Adding a Language

1. Add to `i18n/routing.ts`: `locales: ['en', 'ar', 'fr']`
2. Create `src/i18n/messages/fr.json`
3. Update `src/components/common/language-switcher.tsx`

## Troubleshooting

### Build fails with "baseUrl not set"
✅ Fixed - `tsconfig.json` has `"baseUrl": "."`

### Import errors with @/ paths
✅ Configured - Path aliases work correctly

### Zustand state not persisting
Check browser localStorage for `app-storage` key

## Next Development Steps

1. **Auth**: Add NextAuth.js or Clerk
2. **Forms**: Implement with React Hook Form + Zod
3. **API**: Create client in `src/lib/api.ts`
4. **DB**: Add Prisma or Drizzle ORM
5. **Tests**: Set up Playwright + Vitest
