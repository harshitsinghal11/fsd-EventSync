# EventSync — Product Requirements Document (PRD)

## Project Vision

EventSync is a campus discovery platform that helps students find campus events and opportunities in one place, while giving administrators a protected dashboard to publish and manage that content.

## Problem Statement

Campus events and opportunities are often scattered across notices, social channels, and department pages. Students struggle to discover what is happening or what is open to apply for. Campus organizers need a single place to publish listings that students can browse without hunting across multiple sources.

## Goals & Objectives

- Provide a public-facing hub for browsing campus events and opportunities.
- Surface upcoming events and near-deadline opportunities on the homepage.
- Allow admins to create, edit, and delete events and opportunities.
- Support event coordinator details and external registration/contact links.
- Enforce admin-only access for dashboard and mutation APIs.
- Keep the app deployable as a standard Next.js application with Supabase as the data store.

## Target Audience

- **Students / campus visitors** — browse events and opportunities without logging in.
- **Campus administrators** — manage listings through the admin dashboard after authenticating with an admin account.
- **Developers / maintainers** — extend discovery features, harden auth, and add registration workflows later.

## User Roles & Permissions

| Role | Access |
|------|--------|
| **Public (unauthenticated)** | View home, events list/detail, opportunities list/detail; sign up for a basic account |
| **Registered user (signup)** | Account is created in `users`; no dedicated student dashboard in the current app |
| **Admin / Superadmin** | Login, access `/admin`, call `/api/admin/*` mutation routes, view session in header |

Login only issues an admin session when the stored user role is `admin` or `superadmin`. Signup creates a user record but does not grant dashboard access by itself.

## Core Features

### Public discovery

- Homepage with featured upcoming events and top opportunities.
- Events listing with client-side search, category filter, and date filter.
- Event detail page with description, schedule, venue, perks, coordinators, and registration CTA.
- Opportunities listing with client-side search, type filter, and deadline filter.
- Opportunity detail page with organization, eligibility, deadline, contact parsing, and apply CTA.

### Authentication

- Admin login with email and password.
- User signup with name, email, password, and confirm password.
- Logout clears the HttpOnly admin session cookie.
- Header reflects active admin session and links to dashboard.

### Admin dashboard

- Create event with coordinators, perks, category, and registration link.
- Manage events: edit and delete with coordinator replacement.
- Create opportunity with organization, deadline, type, eligibility, contact info, and registration link.
- Manage opportunities: edit and delete.

## Functional Requirements

### Events

- FR-E1: Public API returns all events ordered by date ascending.
- FR-E2: Public API returns a single event with related coordinators.
- FR-E3: Admin can create an event; `title` and `date` are required.
- FR-E4: Admin can update an event and replace its coordinator list.
- FR-E5: Admin can delete an event; coordinator cleanup is attempted when foreign-key deletion blocks the event delete.
- FR-E6: Event categories are normalized across the UI (`Technical`, `Academic`, `Cultural`, `Sports`, `Workshop`, `Social`, `Other`).

### Opportunities

- FR-O1: Public API returns all opportunities ordered by deadline ascending.
- FR-O2: Public API returns a single opportunity by id.
- FR-O3: Admin can create an opportunity; `title` and `contact_info` are required.
- FR-O4: Admin can update and delete opportunities.

### Auth

- FR-A1: Login validates email/password against the `users` table.
- FR-A2: Successful admin login sets signed HttpOnly cookie `eventsync_admin_session`.
- FR-A3: `/admin` redirects unauthenticated users to `/auth/login`.
- FR-A4: All `/api/admin/*` routes require a valid admin session.
- FR-A5: Signup rejects duplicate emails and mismatched passwords.

### Health

- FR-H1: `/api/health` reports Supabase connectivity status.

## Non-Functional Requirements

- **Performance:** Listing pages fetch full datasets and filter on the client; acceptable for demo-scale data.
- **Security:** Admin session cookie is HttpOnly, `SameSite=Lax`, and `Secure` in production.
- **Availability:** Health endpoint exposes degraded states when Supabase is misconfigured or unreachable.
- **Maintainability:** TypeScript across app and API routes; ESLint configured.
- **Compatibility:** Responsive layout for mobile and desktop navigation patterns.

## Business Rules

- Only users with role `admin` or `superadmin` may access the admin dashboard.
- Event creation/update requires non-empty `title` and `date`.
- Opportunity creation/update requires non-empty `title` and `contact_info`.
- Coordinators without a name are ignored on create/update.
- Perks may be stored as comma-separated text or normalized to arrays in API responses.
- Public CTAs prefer `registration_link`; opportunity contact fallbacks are parsed from `contact_info`.
- Homepage featured events show the next three upcoming events from today onward.

## Assumptions

- Supabase project exists with `events`, `event_coordinators`, `opportunities`, and `users` tables.
- Environment variables for Supabase URL/key and session secret are configured in deployment.
- Admin users are provisioned in the database with appropriate roles.
- External registration happens outside EventSync via provided links or contact details.

## Constraints

- No in-app event registration or opportunity application storage yet.
- Passwords are compared in plaintext against stored values; hashing is not implemented.
- Database schema and migration files are not committed in the repository.
- No backend search, pagination, or media upload in the current codebase.
- Supabase anon key is used for both public reads and admin writes from API routes.

## Future Enhancements

- Student registration and application flows with dedicated tables and admin review views.
- Password hashing (`bcrypt` / `argon2`) and privileged server-side database access.
- Row Level Security policies and a fuller role model (`student`, `admin`).
- Backend search, filtering, and pagination for large datasets.
- Image/media upload for events and opportunities.
- Metadata migration to Next.js Metadata API on all routes.
- Automated tests for auth, CRUD, and edge cases.
- Analytics and cookie-consent integration (`CookieBanner` exists but is not mounted).
