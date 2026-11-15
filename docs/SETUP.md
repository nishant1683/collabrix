# COLLABRIX setup

## 1. Install

Use Node.js 20 or newer:

```powershell
cd "D:\collabrix website"
npm install
```

## 2. Configure environment

```powershell
Copy-Item .env.example .env
```

Set:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: backend-only secret
- `VITE_SUPABASE_URL`: public project URL
- `VITE_SUPABASE_ANON_KEY`: public anon key
- `CLIENT_ORIGIN`: exact browser origin

Do not put the service role key in any `VITE_` variable.

## 3. Apply migrations

Run the four files in `supabase/migrations` in numeric order in Supabase SQL Editor.

## 4. Start

Terminal 1:

```powershell
npm run start:server
```

Terminal 2:

```powershell
npm run dev
```

## 5. Verify

```powershell
npm run build
npm audit --omit=dev
Invoke-RestMethod http://localhost:8787/api/health
```

The health response reports whether server-side Supabase configuration is present. A missing configuration must not be treated as a successful enquiry or authenticated session.
