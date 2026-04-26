# EventSync Completed Work

This file tracks work that is verified as complete. Open work belongs in `TODO.md`.

Last updated: 2026-04-27

## Verified Baseline

1. The landing page at `/` loads featured events and opportunities from live APIs.
2. The events pages at `/events` and `/events/[id]` work with filtering, detail rendering, perks, and coordinator display.
3. The opportunity pages at `/opportunity` and `/opportunity/[id]` work with filtering, detail rendering, and contact parsing.
4. The admin dashboard at `/admin` supports create, edit, and delete flows for both events and opportunities.
5. Event coordinator CRUD works through the admin event create and edit flows.
6. Public detail CTAs use stored registration links or contact fallbacks where applicable.
7. Supabase is connected for reads and writes across `events`, `event_coordinators`, `opportunities`, and `users`.
8. Admin access is enforced with signed HttpOnly cookies and server-side role checks for both `/admin` and `/api/admin/*`.
9. The `/api/health` endpoint checks Supabase connectivity.
10. `npm run lint` passes.
11. `npm run build` passes.

## Completed Fixes

1. `API` | `Security: Yes`: Protected all `/api/admin/*` routes with real server-side auth and role checks.
2. `Backend` | `Security: Yes`: Replaced the old localStorage-only admin session model with HttpOnly cookie-based server validation.
3. `UI + API` | `Security: No`: Wired public event and opportunity detail CTAs to registration links and contact fallbacks.
4. `UI` | `Security: No`: Normalized category values such as `Technical` and `Tech` across the app.
5. `API + Database` | `Security: No`: Made event deletion deterministic with coordinator cleanup fallback before retrying delete.
6. `UI` | `Security: No`: Fixed the `bg-ehitle` typo in `src/components/admin/CreateEventPanel.tsx`.
7. `Codebase` | `Security: No`: Resolved lint issues so the quality gate passes.
8. `UI` | `Security: No`: Replaced or removed placeholder footer links.
9. `API` | `Security: No`: Upgraded `/api/health` from a static response to a real Supabase connectivity check.
10. `UI + API` | `Security: No`: Surfaced coordinator partial-success warnings clearly in the admin event edit flow.
11. `API` | `Security: No`: Removed duplicate opportunity API aliases so the canonical API surface stays plural.
12. `API` | `Security: No`: Enforced required admin event and opportunity fields on the backend instead of relying only on form attributes.
13. `UI` | `Security: No`: Fixed homepage featured-event selection so it shows the next upcoming events consistently.

## Baseline Note

The current baseline is stable for demo-grade discovery and admin CRUD flows. Remaining work is tracked only in `TODO.md`.
