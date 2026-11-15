# COLLABRIX

COLLABRIX is a premium creative agency platform built around the idea: **Connect. Collaborate. Create.**

This repository contains the five planned delivery phases:

1. Public React/Vite frontend
2. Express API, Supabase database, validation, RLS, and authentication foundation
3. Protected role-aware dashboards
4. Deal lifecycle, proposals, messages, revisions, and private files
5. Notifications, reports, and deployment preparation

## Stack

- React, Vite, JavaScript
- Tailwind CSS, React Router DOM, Lucide React
- Express, Zod, Helmet, CORS, rate limiting
- Supabase PostgreSQL, Auth, RLS, and Storage
- Vercel frontend deployment preparation
- Render or Docker backend deployment preparation

## Local development

Requirements: Node.js 20+ and a Supabase project.

```powershell
cd "D:\collabrix website"
npm install
Copy-Item .env.example .env
npm run start:server
```

In a second terminal:

```powershell
cd "D:\collabrix website"
npm run dev
```

The frontend runs on `http://localhost:5173`. The API runs on `http://localhost:8787`.

Configure `.env` using [.env.example](./.env.example). Never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite or commit `.env`.

## Supabase setup

Run these SQL migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_dashboard_access.sql`
3. `supabase/migrations/003_deal_lifecycle.sql`
4. `supabase/migrations/004_notifications.sql`

Create Supabase Auth users, then assign their `profiles.role` values using a controlled admin workflow. Do not trust a role supplied by the browser.

## Validation

```powershell
npm run build
npm audit --omit=dev
```

Backend smoke checks:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
```

## Deployment

- Frontend: deploy the repository to Vercel. `vercel.json` preserves client-side routes. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the deployed API proxy/origin configuration.
- Backend: deploy with `render.yaml` or `server/Dockerfile`. Add the server-only Supabase variables and set `CLIENT_ORIGIN` to the exact frontend origin.
- Apply all Supabase migrations before enabling authenticated traffic.

See [docs/SETUP.md](./docs/SETUP.md) and [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Security notes

- Service-role credentials are server-only.
- Public enquiries are validated and rate-limited.
- Dashboard APIs require Supabase Auth.
- Deal access is checked on the server and protected by RLS.
- Negotiated amounts live in a separate admin-only table.
- Deal files use a private Storage bucket and signed upload URLs.

See [docs/KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) for what still needs production configuration or additional hardening.
