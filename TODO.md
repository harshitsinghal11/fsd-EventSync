# EventSync Open Work

This file only contains work that is still pending.
Completed and verified items have been moved to `completed.md`.

Generated on: 2026-04-17
Last updated: 2026-04-24

Area meaning:
- `UI` means the issue is mainly in the frontend experience or presentation.
- `Backend` means the issue is mainly in application logic or server-side behavior.
- `API` means the issue is mainly in request, response, validation, or route design.
- `Database` means the issue is mainly in schema, migrations, or stored data structure.
- `Testing` means the issue is mainly about missing verification coverage.
- `Codebase` means the issue is mainly cleanup, unused code, or maintainability work.

Security meaning:
- `Security: Yes` means the task is mainly about authentication, authorization, or hardening.
- `Security: No` means the task is mainly about functionality, stability, UI, or maintainability.

## Current Problems To Fix

1. Area: `UI + API`. Security: `No`.
The admin event edit screen still needs to show coordinator save warnings clearly when the backend returns a partial-success response.

2. Area: `API`. Security: `No`.
The app still has duplicate route aliases such as `opportunity` and `opportunities`, and these should be standardized so the API surface stays consistent.

3. Area: `API`. Security: `No`.
The backend still needs stronger validation for required fields so it does not depend only on frontend `required` attributes.

4. Area: `UI`. Security: `No`.
The homepage featured-events logic still needs review because the current comment and the actual slicing behavior do not fully match.

## Cleanup And Maintainability

1. Area: `Database`. Security: `No`.
The project still needs explicit database schema and migration files in the repository so future changes are tracked properly.

2. Area: `Codebase`. Security: `No`.
The project still has unused or not-yet-integrated components such as `CookieBanner`, `CookieBannerErrorBoundary`, `DemoContent`, `ProtectedRoute`, and `Spinner`, and these should either be integrated properly or removed.

3. Area: `UI`. Security: `No`.
Per-page `<title>` and `<meta>` tags still need to be moved to the Next.js metadata APIs for consistency.

4. Area: `Testing`. Security: `No`.
The project still needs tests for the core API flows, especially events CRUD, opportunities CRUD, auth flows, and edge cases.

5. Area: `Codebase`. Security: `No`.
The dependency list still needs cleanup because packages such as `express` and `react-router-dom` may no longer be needed.

## Planned Functional Features

1. Area: `UI + API`. Security: `No`.
The app still needs a real user registration and application flow for events and opportunities, including forms, APIs, and database tables.

2. Area: `UI + Backend`. Security: `No`.
The app still needs an admin dashboard for tracking registrations and applications after that flow exists.

3. Area: `API`. Security: `No`.
The app still needs backend-side search and filtering so it scales better than pure client-side filtering.

4. Area: `UI + API`. Security: `No`.
The app still needs pagination or infinite loading for events and opportunities once the dataset grows.

5. Area: `UI + Backend`. Security: `No`.
The app still needs media and image upload support for events and opportunities.

6. Area: `UI`. Security: `No`.
The app still needs analytics and consent integration because the cookie banner exists but is not mounted in the layout.

## Deferred Security Work

1. Area: `Backend`. Security: `Yes`.
Password handling still needs to be replaced with secure hashing such as `argon2` or `bcrypt`, and login should verify the hash instead of comparing plain text.

2. Area: `Backend`. Security: `Yes`.
Admin mutations still need to move to server-only privileged database access so public reads and privileged writes are properly separated.

3. Area: `Database`. Security: `Yes`.
The project still needs Row Level Security policies and clear documentation of the auth assumptions.

4. Area: `Backend`. Security: `Yes`.
The app still needs a proper public user role model such as `student` and `admin`, along with clear authorization rules.

## Current Focus

The current focus is functional correctness first.
`completed.md` should be used for features and fixes that are already verified.
This file should only contain work that is still pending.
