# EventSync

## Overview

EventSync is a campus discovery platform built with Next.js and Supabase. It helps students browse campus events and opportunities in one place, while giving administrators a protected dashboard to publish and manage that content.

The app has two primary experiences:

- **Public discovery** — homepage, events, and opportunities (no login required).
- **Admin management** — authenticated admins create, edit, and delete events and opportunities from `/admin`.

All dynamic data flows through Next.js API routes, which read and write Supabase tables (`events`, `event_coordinators`, `opportunities`, `users`).

## Key Features

### Public

- Homepage with featured upcoming events and top opportunities
- Events listing with client-side search, category filter, and date filter
- Event detail pages with coordinators, perks, and registration links
- Opportunities listing with search, type filter, and deadline filter
- Opportunity detail pages with eligibility, contact parsing, and apply CTAs

### Authentication

- Admin login with email and password (roles: `admin`, `superadmin`)
- User signup (creates account; does not grant admin access)
- Signed HttpOnly session cookie (`eventsync_admin_session`)
- Logout and session-aware header navigation

### Admin Dashboard

- Create and manage events with coordinators, perks, categories, and registration links
- Create and manage opportunities with organization, deadline, type, eligibility, and contact info
- Server-protected `/admin` page and `/api/admin/*` mutation routes

### API & Health

- Public REST APIs for events and opportunities
- Auth APIs for login, logout, signup, and session
- `/api/health` endpoint for Supabase connectivity checks

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Primitives | Radix UI |
| Icons | lucide-react |
| Animation | motion/react |
| Database | Supabase (PostgreSQL) |
| Auth | Custom HMAC-signed HttpOnly cookie |

## Screenshots (Optional)

_Screenshots not included in this repository. Add images to a `screenshots/` folder and link them here if needed._

## Project Structure

```
eventsync/
├── app/                          # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── admin/events/         # Protected event mutations
│   │   ├── admin/opportunities/  # Protected opportunity mutations
│   │   ├── auth/                 # login, logout, signup, session
│   │   ├── events/               # Public event reads
│   │   ├── opportunities/        # Public opportunity reads
│   │   ├── config/supabase/      # Supabase config route
│   │   └── health/               # Health check
│   ├── admin/                    # Admin dashboard (server-protected)
│   ├── auth/                     # Login and signup pages
│   ├── events/                   # Events list and detail
│   ├── opportunity/              # Opportunities list and detail
│   ├── layout.tsx                # Root layout with Header/Footer
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Theme tokens and base styles
├── lib/
│   ├── server/
│   │   ├── auth.ts               # Session cookie helpers
│   │   ├── supabase.ts           # Supabase client factory
│   │   └── validation.ts         # Request validation helpers
│   ├── session.ts                # AdminSession type
│   ├── event-categories.ts       # Category constants
│   └── utils.ts                  # Shared utilities
├── src/components/
│   ├── admin/                    # Admin dashboard panels
│   ├── layout/                   # Header, Footer
│   └── ui/                       # Radix UI components
├── docs/                         # Project documentation
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

**Path aliases**

- `@/*` → project root
- `@/components/*` → `src/components/*`

## Documentation

Detailed project documentation lives in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [docs/01_PRD.md](docs/01_PRD.md) | Product vision, requirements, roles, features, and constraints |
| [docs/02_TRD.md](docs/02_TRD.md) | Tech stack, architecture, auth, API standards, and deployment |
| [docs/03_AppFlow.md](docs/03_AppFlow.md) | Navigation, auth flows, feature workflows, and user journeys |
| [docs/04_UI_UX.md](docs/04_UI_UX.md) | Design system, pages, components, and UI states |
| [docs/05_BackendSchema.md](docs/05_BackendSchema.md) | Database tables, relationships, and API models |

## Getting Started

### Prerequisites

- **Node.js** 20+ recommended
- **npm** (or compatible package manager)
- A **Supabase** project with `users`, `events`, `event_coordinators`, and `opportunities` tables
- An **admin user** in the `users` table with role `admin` or `superadmin`

### Installation

```bash
git clone <repository-url>
cd eventsync
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (either pair works)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Or use NEXT_PUBLIC_ variants
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Session signing (required for admin auth)
SESSION_SECRET=your_long_random_secret
```

**Accepted session secret fallbacks:** `EVENTSYNC_SESSION_SECRET`, `AUTH_SESSION_SECRET`, `JWT_SECRET`

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Key routes**

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/events` | Events listing |
| `/events/[id]` | Event detail |
| `/opportunity` | Opportunities listing |
| `/opportunity/[id]` | Opportunity detail |
| `/auth/login` | Admin login |
| `/auth/signup` | User signup |
| `/admin` | Admin dashboard (protected) |

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js development server |
| Build | `npm run build` | Create production build |
| Start | `npm run start` | Run production server |
| Lint | `npm run lint` | Run ESLint |

## Deployment

EventSync is a standard Next.js application and can be deployed to any Node-compatible host (e.g. Vercel).

1. Set environment variables on your hosting platform (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SESSION_SECRET`).
2. Ensure your Supabase project is accessible from the deployment environment.
3. Build and start:

```bash
npm run build
npm run start
```

4. Verify deployment health at `/api/health`.

**Notes**

- No CI/CD, Docker, or infrastructure-as-code files are included in this repository.
- Database schema and migration files are not committed; manage schema in Supabase directly.
- Use `SESSION_SECRET` in production; admin cookies are `Secure` when `NODE_ENV=production`.

## Project Status

**Current baseline (stable for demo-grade use)**

- Public discovery for events and opportunities
- Admin CRUD for events and opportunities
- Event coordinator management
- Admin session auth with HttpOnly cookies
- Client-side search and filtering
- Health check endpoint

**Known limitations**

- No in-app event registration or opportunity application storage
- Passwords are compared in plaintext (hashing not implemented)
- No backend pagination, search, or media upload
- No Row Level Security policies in the repository
- Signup creates users but does not provide a student dashboard
- Database migrations not tracked in-repo

**Planned enhancements** (see [docs/01_PRD.md](docs/01_PRD.md))

- Student registration and application flows
- Password hashing and privileged database access
- RLS policies and fuller role model
- Backend search, filtering, and pagination
- Image/media upload support
- Automated tests and metadata API cleanup

## Contributing (Optional)

Contributions are welcome. Before opening a pull request:

1. Read the documentation in `docs/`.
2. Run `npm run lint` and `npm run build` to verify your changes.
3. Keep changes focused and aligned with the existing project conventions.

## License

This project is marked `private` in `package.json`. No open-source license file is included in the repository.

## Contact (Optional)

**Engineered by Harshit Singhal**

For questions about this project, reach out to the repository maintainer.
