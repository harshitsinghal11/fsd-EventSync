# EventSync — UI/UX Specification

## Design Principles

- **Campus-first clarity:** Content (events and opportunities) is the focus; chrome stays minimal.
- **Fast scanning:** Cards, badges, and filters help users compare listings quickly.
- **Progressive disclosure:** List pages for browse; detail pages for full context and CTAs.
- **Consistent admin workspace:** Dark sidebar + light content panel for management tasks.
- **Motion with purpose:** Subtle entrance/hover animations via `motion/react`, not decorative overload.
- **Resilient UI:** Loading skeletons, empty states, and retry affordances on data-driven sections.

## Brand Guidelines

- **Product name:** EventSync
- **Logo treatment:** Calendar icon in primary blue square + wordmark `Event` + blue `Sync`
- **Tone:** Friendly, campus-oriented, professional
- **Tagline usage:** "Campus Event Hub", "Your campus hub for discovering events, opportunities, and connections"
- **Footer credit:** "Engineered By Harshit Singhal"

Formal brand book / logo assets beyond inline UI usage: **Project not Supported**.

## Color System

Defined in `app/globals.css` as CSS custom properties and mapped into Tailwind via `@theme inline`.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#f8fafc` | Page background base |
| `--foreground` | `#0f172a` | Primary text |
| `--primary` | `#2563eb` | Brand blue, buttons, accents |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#e2e8f0` | Secondary surfaces |
| `--muted` | `#eef2ff` | Muted backgrounds |
| `--muted-foreground` | `#64748b` | Secondary text |
| `--accent` | `#dbeafe` | Accent highlights |
| `--destructive` | `#dc2626` | Errors, logout |
| `--border` | `#e2e8f0` | Borders |
| `--ring` | `#60a5fa` | Focus rings |

**Additional UI colors in pages:**

- Hero/footer dark surfaces: `slate-900`, `slate-800`
- Stats band: `#1447E6`
- Category/type badge palettes in `lib/event-categories.ts` and opportunity type maps
- Admin sidebar: `slate-950` with `blue-600` active item

## Typography

- **Primary font:** `Arial, Helvetica, sans-serif` (set on `body` in `globals.css`)
- **Theme font tokens:** `--font-geist-sans`, `--font-geist-mono` declared in theme but Geist is not wired in root layout
- **Headings:** `font-extrabold` / `font-bold`, tight tracking on hero titles
- **Body:** `text-sm` / `text-base` with `text-slate-500`/`600` hierarchy
- **Admin labels:** `text-sm font-semibold text-slate-700`

## Spacing & Layout

- **Container:** `container mx-auto px-4` on major sections
- **Header height:** `h-16`, sticky top with backdrop blur
- **Section rhythm:** `py-20` on homepage sections; `py-12`/`py-24` on detail pages
- **Card spacing:** `p-5`/`p-6`, `rounded-2xl`, `gap-6` grids
- **Admin layout:** Sidebar `w-72` + flexible content area, `min-h-[calc(100vh-4rem)]`
- **Grid patterns:** `grid-cols-1 md:grid-cols-3` for card listings; `lg:grid-cols-3` on detail pages

## Design Tokens

| Category | Implementation |
|----------|----------------|
| Colors | CSS variables in `:root` + Tailwind `@theme inline` |
| Radius | `rounded-xl`, `rounded-2xl`, `rounded-3xl` for cards/forms |
| Shadows | `shadow-sm`, `shadow-lg`, colored shadows on primary buttons |
| Focus | `focus:ring-4 focus:ring-blue-500/10` on admin inputs |
| Motion | `fadeUp` variants, `whileHover` card lift |

Centralized design-token package (Style Dictionary, Figma tokens): **Project not Supported**.

## Component Library

Built on shadcn-style Radix primitives under `src/components/ui/`:

| Component | Used in core flows |
|-----------|-------------------|
| `button` | Auth pages, admin forms |
| `input` | Auth, admin forms |
| `label` | Auth, admin forms |
| `card` | Available in library |
| `dialog`, `sheet`, `tabs`, etc. | Available; not all used in primary flows |

**App-specific components:**

| Component | Purpose |
|-----------|---------|
| `Header` | Global nav + session actions |
| `Footer` | Site links and branding |
| `AdminDashboard` | Admin shell and panel routing |
| `CreateEventPanel` / `ManageEventsPanel` | Event admin CRUD |
| `CreateOpportunityPanel` / `ManageOpportunitiesPanel` | Opportunity admin CRUD |
| `Spinner` | Present but not integrated in layout |
| `ProtectedRoute` | Present but not used (server redirect used instead) |
| `CookieBanner` / `CookieBannerErrorBoundary` | Present but not mounted in layout |
| `DemoContent` | Present but unused in routes |

## Page Inventory

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Homepage hero, stats, featured events/opportunities |
| `/events` | Public | Searchable/filterable events grid |
| `/events/[id]` | Public | Event detail |
| `/opportunity` | Public | Searchable/filterable opportunities grid |
| `/opportunity/[id]` | Public | Opportunity detail |
| `/auth/login` | Public | Admin login form |
| `/auth/signup` | Public | Account registration form |
| `/auth` | Public | Auth landing |
| `/admin` | Protected | Admin dashboard |
| `not-found` | System | 404 page |

## Page Specifications

### Homepage (`/`)

- Dark hero with gradient blobs, CTA to events and opportunities.
- Live stats row for total events and opportunities.
- Featured events: 3 upcoming cards with category badge and gradient header.
- Top opportunities: 3 cards with deadline and "Closing soon" pulse when < 7 days.
- Per-section loading skeletons and retryable errors.

### Events list (`/events`)

- Search input, category chips, date filter dropdown.
- Animated card grid with category color badges and venue/date metadata.
- Empty state when filters yield no results.

### Event detail (`/events/[id]`)

- Hero with category styling from `EVENT_CATEGORY_BACKGROUNDS`.
- Main column: description, perks list.
- Sidebar: date, time, venue, duration, coordinators, registration button.

### Opportunities list (`/opportunity`)

- Search, type chips, deadline filter.
- Cards with type color bar and expiring-soon indicator.

### Opportunity detail (`/opportunity/[id]`)

- Hero with organization and type.
- Eligibility, description, stipend (if present in data).
- Sidebar: deadline, parsed contact, apply CTA.

### Login (`/auth/login`)

- Centered card on dark gradient background.
- Email/password fields, link to signup, error alert animation.

### Signup (`/auth/signup`)

- Name, email, password, confirm password.
- Success/error feedback; link back to login.

### Admin (`/admin`)

- Dark sidebar grouped by Events / Opportunities.
- Active panel title breadcrumb in content header.
- Session info badge with admin email/name.

## Responsive Design Rules

- **Navigation:** Desktop horizontal nav; mobile hamburger menu with stacked links.
- **Grids:** Single column on mobile → 3 columns on `md+` for cards.
- **Hero typography:** `text-5xl md:text-7xl` scaling.
- **CTA rows:** `flex-wrap` for buttons on small screens.
- **Admin sidebar:** Hidden below `md`; mobile admin navigation is not a separate drawer — sidebar is `hidden md:flex` only.

## Loading States

| Surface | Pattern |
|---------|---------|
| Homepage sections | Pulsing skeleton cards |
| List pages | `Loader2` spinner or skeleton grid |
| Detail pages | Full-page skeleton mimicking hero + two-column layout |
| Header session | `animate-pulse` placeholder bar |
| Admin submit | Button disabled + `Loader2` inline icon |

## Empty States

- Homepage: icon + message when no events/opportunities.
- List pages: centered message when filters exclude all items.
- Admin manage panels: message when no records exist.
- Copy is contextual (e.g. "No upcoming events right now" vs "No events yet").

## Error States

- **Inline banners:** Red bordered boxes with `AlertCircle`, message, and Retry on homepage/lists.
- **Detail errors:** Centered error card with back navigation link.
- **Auth errors:** Animated red alert inside form card.
- **Admin panels:** Red text alert above form on API failure.
- **API JSON errors:** Surfaced as user-readable strings from `error` field.

## Accessibility Guidelines

**Currently implemented:**

- `lang="en"` on `<html>`
- `aria-label` on mobile menu toggle
- Semantic headings and form labels via `Label` component
- Focus ring styles on interactive admin inputs
- Color contrast generally strong on primary buttons and dark hero/footer

**Project not Supported / gaps:**

- No documented WCAG audit or accessibility test suite.
- No skip-to-content link.
- Some pages use inline `<title>` / `<meta>` in client components instead of Next Metadata API.
- Keyboard trap testing for mobile menu not documented.
- No `prefers-reduced-motion` handling for animations.
