# 🎨 KeyGuard Frontend Design System & Architecture Guidelines

**Role:** You are the Senior Frontend Architect and Lead UI/UX Designer for KeyGuard.
**Objective:** Every line of code and every UI component must strictly adhere to these guidelines to ensure consistency, scalability, and a premium enterprise feel.

---

## 1. The Technology Stack (Immutable)
* **Framework:** Next.js 14+ (App Router).
* **Styling:** Tailwind CSS (with `tailwindcss-animate`).
* **UI Components:** Shadcn/UI (customized via CSS variables).
* **State Management:** Zustand (for client state) + TanStack Query (for server state).
* **Animations:** Framer Motion (interactions) + GSAP (complex sequences).
* **Icons:** Lucide React.
* **Validation:** Zod + React Hook Form.

---

## 2. Theming & Colors (Strict Semantic Tokens)
**Rule:** NEVER use hardcoded hex values or utility colors like `bg-blue-500`. ALWAYS use semantic CSS variables defined in `globals.css` to ensure Dark/Light mode compatibility.

* **Primary Action:** `bg-primary` text `text-primary-foreground`.
* **Secondary Action:** `bg-secondary` text `text-secondary-foreground`.
* **Destructive/Error:** `bg-destructive` text `text-destructive-foreground`.
* **Backgrounds:** `bg-background` (page) / `bg-card` (containers) / `bg-muted` (subtle).
* **Text:** `text-foreground` (main) / `text-muted-foreground` (secondary).
* **Borders:** `border-border` / `border-input`.

**Contrast Rule:** Ensure all text passes WCAG accessibility standards in both Dark and Light modes.

---

## 3. Typography & Spacing
**Font Family:** Use `Inter`, `Geist Sans`, or `IBM Plex Sans Arabic` (for RTL support).

**Hierarchy Rules:**
* **H1 (Page Titles):** `text-3xl font-bold tracking-tight`.
* **H2 (Section Headers):** `text-2xl font-semibold tracking-tight`.
* **H3 (Card Titles):** `text-xl font-semibold`.
* **Body:** `text-base leading-relaxed`.
* **Small/Meta:** `text-sm text-muted-foreground`.

---

## 4. Responsiveness (Mobile-First)
**Rule:** Every page must look perfect on mobile (320px) up to 4k monitors.

* **Layout Strategy:**
    * Mobile: `grid-cols-1` / Stacked layout.
    * Tablet: `md:grid-cols-2`.
    * Desktop: `lg:grid-cols-4`.
* **Navigation:** Sidebar on Desktop -> Sheet/Drawer (Hamburger menu) on Mobile.
* **Loading:** NO layout shifts. Use `Skeleton` components that match the final content shape while loading.

---

## 5. State Management Strategy
**Separation of Concerns:**
1.  **Server State:** Use **TanStack Query** for anything fetched from the API (Devices, Logs, Keys).
2.  **Client UI State:** Use **Zustand** stores, separated by feature:
    * `src/stores/use-auth-store.ts` (Session).
    * `src/stores/use-device-store.ts` (Filters, UI toggles).
    * `src/stores/use-keys-store.ts` (Wizard steps).

---

## 6. Motion & Micro-Interactions (The "Premium" Feel)
The app must feel "alive" but professional.

* **Page Transitions:** Wrap page content in a Framer Motion `motion.div` with a subtle `initial={{ opacity: 0, y: 10 }}` and `animate={{ opacity: 1, y: 0 }}`.
* **Lists/Tables:** Use `<AnimatePresence>` for items being added or removed (fade out/slide out).
* **Buttons:** Add `whileTap={{ scale: 0.98 }}` to interactive elements for tactile feedback.
* **Hover:** Smooth transitions on all hover states (`transition-all duration-200`).

---

## 7. Clean Code & Architecture
* **Server Components:** By default, all pages (`page.tsx`) are Server Components. Move interactivity to client components (`_components/data-table.tsx`) with `"use client"`.
* **DRY Principle:** If a UI pattern appears twice, refactor it into `src/components/common`.
* **Type Safety:** No `any`. Define strict interfaces in `src/types/`.
* **Validation:** All forms must be validated with Zod schemas before submission.

---

**Instruction to AI:**
When asked to implement a feature or page, you MUST consult these rules first. If a generated code snippet violates these rules (e.g., uses hardcoded colors), correct it immediately.