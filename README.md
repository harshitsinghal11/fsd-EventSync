# EventSync

EventSync is a Next.js campus discovery app for browsing events and opportunities, with an admin dashboard for CRUD management.

## Current Scope

- Public pages for the home feed, event discovery, event details, opportunity discovery, and opportunity details.
- Admin pages for creating, editing, and deleting events and opportunities.
- Login and signup flows backed by the app's `users` table.
- Admin-only access enforced through a signed HttpOnly session cookie.
- REST APIs for public reads, auth, health checks, and protected admin mutations.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Radix UI, `lucide-react`, and `motion/react`
- Supabase for data access

## Local Development

1. Install dependencies with `npm install`.
2. Configure the required environment variables.
3. Start the dev server with `npm run dev`.

Useful scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Environment Variables

Required:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SESSION_SECRET`

Accepted session-secret fallbacks:

- `EVENTSYNC_SESSION_SECRET`
- `AUTH_SESSION_SECRET`
- `JWT_SECRET`

## Routing Notes

- Public opportunity pages use `/opportunity` and `/opportunity/[id]`.
- Opportunity APIs are standardized on plural routes: `/api/opportunities` and `/api/admin/opportunities`.
- Admin event APIs live under `/api/admin/events`.

## Current Limitations

- Real end-user event registration and opportunity application storage is not implemented yet.
- Password hashing is still pending; current password handling needs hardening.
- Database schema and migration files are not yet committed in the repository.

## Project Docs

- `DOCUMENTATION.md`: architecture, auth model, and current product status
- `TODO.md`: open work only
- `completed.md`: verified completed work
