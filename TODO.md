# EventSync Open Work

This file tracks only open work. Verified items should be moved to `completed.md`.

Last updated: 2026-04-27

## Functional Status

No open functional-correctness bugs are currently tracked.

## Cleanup And Maintainability

1. `Database` | `Security: No`: Add explicit database schema and migration files to the repository so future changes are tracked properly.
2. `Codebase` | `Security: No`: Remove or properly integrate currently unused pieces such as `CookieBanner`, `CookieBannerErrorBoundary`, `DemoContent`, `ProtectedRoute`, and `Spinner`.
3. `UI` | `Security: No`: Move per-page `<title>` and `<meta>` usage to the Next.js metadata APIs for consistency.
4. `Testing` | `Security: No`: Add tests for the core API flows, especially events CRUD, opportunities CRUD, auth flows, and edge cases.
5. `Codebase` | `Security: No`: Clean up unused dependencies such as `express` and `react-router-dom` if they are no longer needed.

## Planned Features

1. `UI + API` | `Security: No`: Build a real user registration and application flow for events and opportunities, including forms, APIs, and database tables.
2. `UI + Backend` | `Security: No`: Add an admin dashboard view for registrations and applications after the registration flow exists.
3. `API` | `Security: No`: Add backend-side search and filtering so the app scales beyond client-side filtering.
4. `UI + API` | `Security: No`: Add pagination or infinite loading for events and opportunities as the dataset grows.
5. `UI + Backend` | `Security: No`: Add media and image upload support for events and opportunities.
6. `UI` | `Security: No`: Integrate analytics and consent handling; the cookie banner exists but is not mounted in the layout.

## Deferred Security Work

1. `Backend` | `Security: Yes`: Replace plaintext password handling with secure hashing such as `argon2` or `bcrypt`, and verify hashes on login.
2. `Backend` | `Security: Yes`: Move admin mutations to server-only privileged database access so public reads and privileged writes are clearly separated.
3. `Database` | `Security: Yes`: Add Row Level Security policies and document the auth assumptions clearly.
4. `Backend` | `Security: Yes`: Introduce a proper public user role model such as `student` and `admin`, with explicit authorization rules.
