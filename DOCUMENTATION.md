# EventSync Documentation

Last updated: 2026-04-27

## Summary

EventSync is a campus discovery application for surfacing events and opportunities to students while giving admins a protected dashboard for CRUD operations. The current product is strongest in public discovery, admin content management, and API-connected detail pages.

## Stack

- Framework: Next.js 16 App Router with React 19
- Styling: Tailwind CSS 4
- UI: Radix UI primitives, `lucide-react`, and `motion/react`
- Data layer: Supabase
- Language: TypeScript

## App Surface

Public pages:

- `/`
- `/events`
- `/events/[id]`
- `/opportunity`
- `/opportunity/[id]`
- `/auth/login`
- `/auth/signup`

Admin pages:

- `/admin`

Public APIs:

- `/api/events`
- `/api/events/[id]`
- `/api/opportunities`
- `/api/opportunities/[id]`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/session`
- `/api/auth/signup`
- `/api/health`

Protected admin APIs:

- `/api/admin/events`
- `/api/admin/events/[id]`
- `/api/admin/opportunities`
- `/api/admin/opportunities/[id]`

## Data And Auth Model

- Supabase access is created from `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`, plus `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Login and signup currently read and write directly against the `users` table.
- Admin access is enforced with a signed HttpOnly cookie named `eventsync_admin_session`.
- Session signing uses `SESSION_SECRET`, with fallbacks for `EVENTSYNC_SESSION_SECRET`, `AUTH_SESSION_SECRET`, or `JWT_SECRET`.
- Admin APIs perform server-side role checks before allowing mutations.

## Verified Capabilities

- Landing page loads live event and opportunity data.
- Homepage event curation now shows the next upcoming events instead of stale rows.
- Events pages support search, category filtering, and date filtering.
- Opportunity pages support search, type filtering, and deadline filtering.
- Event detail pages show coordinators and registration links when present.
- Opportunity detail pages resolve contact fallbacks from stored data.
- Admin users can create, edit, and delete both events and opportunities.
- Admin event flows support coordinator CRUD and partial-success warning display.
- Backend validation now enforces required admin event and opportunity fields.
- `npm run lint` and `npm run build` both pass in the current baseline.

## Known Remaining Work

See `TODO.md` for the authoritative open-work list. The main remaining areas are:

- Database schema and migration tracking in-repo
- Metadata cleanup across routes
- Automated tests for core flows
- Dependency cleanup for no-longer-used packages
- Real student registration and application workflows
- Password hashing, privileged-write separation, RLS, and a fuller role model

## Source Of Truth

- Open work: `TODO.md`
- Verified completed work: `completed.md`
