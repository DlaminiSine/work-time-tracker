# Clockwise

Clockwise is a production-oriented personal time-tracking application for recording work by company and project. The data model is:

User -> Company -> Project -> Work Session

Phase 3 establishes the core clock-in workflow on top of the Phase 1 and Phase 2 foundation: timezone-aware reporting utilities, company CRUD, project CRUD, archive/restore flows, database-backed clock-in/out, active timer reconstruction, and timer summary totals.

## Features

Implemented through Phase 3:

- Sign up, login, logout, and forgot-password flows through Supabase Auth.
- Persistent session refresh through Next.js middleware.
- Protected application routes under the main workspace layout.
- Responsive navigation with desktop sidebar and mobile bottom tabs.
- Light and dark mode support.
- Supabase migration for `profiles`, `companies`, `projects`, and `work_sessions`.
- RLS policies that scope all table access to the signed-in user.
- A partial unique PostgreSQL index that allows only one active work session per user.
- TypeScript database entity types matching the migration.
- PWA manifest and mobile metadata.
- Timezone-aware reporting ranges using the user's configured profile timezone.
- Company management with create, edit, archive, restore, active lists, and optional archived visibility.
- Project management with create, edit, archive, restore, company filtering, weekly targets, hourly rates, currencies, and optional archived visibility.
- Reusable active company -> active project query for Timer selectors.
- Database-backed clock-in and clock-out server actions.
- Active session reconstruction from `work_sessions.clock_out is null`.
- Live active timer UI derived from the persisted `clock_in` timestamp with no localStorage authority.
- Timer summary totals for today, this week, and this month using the profile timezone and week-start preference.
- Today completed-session list filtered by local reporting boundaries.
- Active project weekly target progress while a session is running.
- Unit tests for duration, active elapsed time, timezone boundaries, DST behavior, validation, timer selectors, weekly targets, timer summaries, decimal hours, earnings, and formatting.

Planned next:

- Phase 4: History editing, manual sessions, filters, reports, charts, CSV export, and full settings editing.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-compatible local components
- Supabase Auth
- Supabase PostgreSQL
- React Hook Form
- Zod
- date-fns
- date-fns-tz
- Recharts
- Vitest
- Vercel-compatible deployment

## Architecture

The project keeps product logic out of route files:

- `src/app` contains route groups for authentication and protected app screens.
- `src/components` contains reusable UI, auth forms, management forms, provider, and layout components.
- `src/lib/companies` contains company validation, queries, and server actions.
- `src/lib/projects` contains project validation, queries, and server actions.
- `src/lib/profiles` contains profile preference lookups used by timezone-aware screens.
- `src/lib/supabase` contains typed Supabase server helpers and database types.
- `src/lib/validations` contains Zod schemas shared by forms and server actions.
- `src/lib/time` contains timezone-aware calculation helpers and tests.
- `src/lib/timer` contains reusable timer selector, summary, and page-data helpers.
- `src/lib/work-sessions` contains work-session validation, queries, and server actions.
- `supabase/migrations` contains database schema and security policy changes.

Major decisions:

- Supabase PostgreSQL is the source of truth. Work sessions are never stored in localStorage as authoritative data.
- Durations are calculated from `clock_out - clock_in`; duration is not stored as authoritative database data.
- Timestamps use `timestamptz`. PostgreSQL stores absolute instants, while reporting boundaries are calculated in the user's profile timezone.
- The one-active-session rule is enforced with a partial unique index on `work_sessions(user_id)` where `clock_out is null`.
- The app renders an explicit setup state when Supabase environment variables are missing. This keeps local development runnable without faking backend behavior.
- Midnight, day, week, and month calculations are isolated in `src/lib/time/duration.ts` and use `date-fns-tz` so daylight-saving changes are handled by IANA timezone data instead of hard-coded offsets.
- Company and project writes go through server actions and reusable query modules. UI filters improve usability, but RLS and user-scoped queries remain the security boundary.
- Clock-in validates the selected company and project server-side, checks for an existing active session, inserts a server timestamp, and lets the partial unique index remain the final concurrency guard.
- Clock-out updates only the authenticated user's active session by id, leaves archived project/company records usable for finishing old work, and revalidates Timer, History, and Reports paths.
- Active timer display is client-side only for ticking; it is reconstructed from the database `clock_in` timestamp after refresh and never writes authoritative timer state to localStorage.
- The `dev` and `build` scripts use Next's supported webpack flag because the current Turbopack path hit host-level port-binding restrictions during verification.

## Database Schema

`profiles`

- `id`
- `full_name`
- `timezone`
- `time_format`
- `week_starts_on`
- `default_currency`
- `created_at`
- `updated_at`

`companies`

- `id`
- `user_id`
- `name`
- `description`
- `color`
- `is_archived`
- `created_at`
- `updated_at`

`projects`

- `id`
- `user_id`
- `company_id`
- `name`
- `description`
- `weekly_target_minutes`
- `hourly_rate`
- `currency`
- `color`
- `is_archived`
- `created_at`
- `updated_at`

`work_sessions`

- `id`
- `user_id`
- `project_id`
- `task_description`
- `notes`
- `clock_in`
- `clock_out`
- `created_at`
- `updated_at`

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the Supabase project root URL for `NEXT_PUBLIC_SUPABASE_URL`, not a REST API path. For this project, that root URL is:

```text
https://fcdytpnxpjdqeyhycixc.supabase.co
```

Real environment values should be supplied through one of these places:

- Local `.env.local`, which must stay untracked.
- GitHub Codespaces secrets.
- Vercel environment variables.

Do not commit real Supabase values to `.env.example` or any other tracked env file.

When running in GitHub Codespaces, access the app through the forwarded `.app.github.dev` URL and keep real Supabase values in Codespaces secrets. Next.js Server Actions validate request origins, so `next.config.ts` explicitly allows `*.app.github.dev` alongside local development hosts instead of disabling the origin check.

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Copy the project root URL and anon key into local `.env.local`, GitHub Codespaces secrets, or Vercel environment variables.
3. Apply the migration in `supabase/migrations/20260905010000_phase_1_schema.sql`.
4. In Supabase Auth settings, configure the local redirect URL:

```text
http://localhost:3000/auth/callback
```

For production, also add the Vercel deployment callback URL.

## Environment Variables

`NEXT_PUBLIC_SUPABASE_URL`

The Supabase project URL used by server and browser clients.

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase anon key. RLS policies protect user data; never expose a service-role key in the browser.

`NEXT_PUBLIC_SITE_URL`

The canonical app URL used for auth redirects.

## Database Migrations

The Phase 1 migration:

- Creates all required tables.
- Adds UTC-safe timestamp columns with `timestamptz`.
- Creates update timestamp triggers.
- Creates a registration trigger that inserts a profile for each new auth user.
- Enables RLS on every table.
- Adds select, insert, update, and delete policies scoped to `auth.uid()`.
- Adds indexes for user-scoped lists and active session lookup.

No Phase 3 migration is required. The existing `work_sessions` table and partial unique index already support the timer workflow.

## Development Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Testing

Run unit tests:

```bash
pnpm test
```

Current tests cover timezone-aware reporting boundaries, DST behavior, company validation, project validation, timer clock-in validation, dependent selector behavior, active timer formatting, weekly target conversion, summary totals that include active sessions, duration formatting, decimal-hour conversion, and earnings.

## Deployment To Vercel

1. Create a Vercel project from this repository.
2. Add the same environment variables used locally, with `NEXT_PUBLIC_SITE_URL` set to the production URL.
3. Add the production auth callback URL in Supabase.
4. Deploy with Vercel's standard Next.js build.

The project uses no Node-only server state and is compatible with the App Router deployment model.

## PWA Installation

The app includes a web manifest, mobile viewport metadata, theme colors, and Apple web-app metadata. After deployment, users can add the app to an iPhone Home Screen from Safari's share menu.

## Seed And Demo Data

Demo data should only be inserted manually in development accounts. Suggested examples for later seed work:

- Companies: Northeastern University, Personal Projects.
- Projects: Research Assistant, Portfolio Website, Premier League Analytics.

## Current Status

- Timezone-aware reporting utilities are implemented and tested.
- Company CRUD and archive/restore are implemented.
- Project CRUD, company filtering, weekly targets, hourly rates, currency defaults, and archive/restore are implemented.
- The Timer page records database-backed sessions, reconstructs active timers after refresh, clocks out safely, and summarizes today, this week, and this month.

## Known Limitations

- History and Reports pages are still placeholders for Phase 4.
- Settings values are created with defaults and are not editable yet.
- Manual session editing and full report pages are not built yet.
- The PWA does not attempt offline work-session synchronization in V1.

## Future Improvements

- Manual session creation and editing.
- CSV export with safe escaping.
- Recharts summaries for company, project, and day-level reporting.
- Richer profile settings for timezone, clock format, week start, and default currency.
