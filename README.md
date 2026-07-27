# PERTAGAS HC Operation Dashboard

A production-oriented Human Capital operations application for PERTAGAS. Authenticated users maintain employee, TNA, budget, training, competency, audit-readiness, and document records. Dashboard indicators, charts, reports, and empty states are calculated exclusively from records stored in Supabase.

## Technology

- React and Vite
- JavaScript (no TypeScript)
- Tailwind CSS
- React Router
- Supabase Database and Authentication
- React Hook Form and Zod
- Recharts, Lucide React, date-fns, and Sonner

## Local installation

Requirements: Node.js 22.22+ and a Supabase project.

```bash
npm install
cp .env.example .env.local
```

Set both values in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Only use the browser-safe anonymous key. Never add a service-role key to this application.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste the complete contents of `supabase/schema.sql`, and run it once.
3. In **Authentication → Providers**, enable Email.
4. Configure the Site URL and allowed redirect URLs for local and deployed environments.
5. Add the environment variables above.

The schema creates all nine tables, validation constraints, indexes, `updated_at` triggers, a registration trigger, and Row Level Security policies. Authenticated users can read operational data. Editors can insert and update it. Only admins can delete records or change application settings.

### Create the first admin

Register through the application, obtain the user UUID from **Authentication → Users**, then run:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_UUID';
```

Use the same approach with `editor` to grant operational edit access. New registrations default to `viewer`.

## Branding

The included Pertamina Gas image is located at `src/assets/company-logo.png`. If the organisation supplies a newer approved master file at `src/assets/pertagas-logo.png`, update `src/components/common/BrandLogo.jsx` to reference it. Do not commit an unofficial redraw.

## Run and build

```bash
npm run dev
npm run build
npm run preview
```

The app intentionally shows a configuration message on the login screen when Supabase variables are absent. It never falls back to demo accounts or mock operational records.

## Using the application

1. Sign in or register.
2. Ask an administrator to assign the appropriate role.
3. Use each module’s **Add Data** action to enter operational records.
4. Edit records as an admin or editor; delete records as an admin.
5. Dashboard cards and visualisations refresh from the database.
6. Use Reports to filter summaries, export visible rows to CSV, or print.
7. Admins can update vision and organisation defaults in Settings.

Documents use validated external HTTP/HTTPS links for the initial release. Links open in a new browser tab; Supabase Storage is not required.

## Vercel deployment

1. Import the repository into Vercel.
2. Keep the Vite framework preset and `npm run build` build command.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings → Environment Variables.
4. Deploy.
5. Add the production URL to Supabase Authentication’s allowed redirect URLs.

`vercel.json` routes client-side paths back to `index.html`, so protected routes work after a browser refresh.

## Implementation notes

- Operational services live in `src/services`; pages do not contain direct Supabase queries.
- Supabase RLS remains enabled on every table.
- No operational seed data is included.
- KPI values return `0` or `0%` when relevant records do not exist.
- Charts and tables show explicit empty states instead of fabricated values.
- Currency is formatted in the application and constrained to non-negative values in both forms and SQL.
