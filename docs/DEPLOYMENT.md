# COLLABRIX deployment

## Frontend on Vercel

1. Import the repository into Vercel.
2. Use the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Configure the API origin/proxy for the deployed backend.
5. Keep `vercel.json` so direct React Router URLs resolve to `index.html`.

## Backend on Render

1. Create a Web Service from the repository.
2. Use `render.yaml`, or configure:
   - Build: `npm ci`
   - Start: `npm run start:server`
   - Health check: `/api/health`
3. Add:
   - `PORT`
   - `CLIENT_ORIGIN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RATE_LIMIT_WINDOW_MS`
   - `RATE_LIMIT_MAX`
4. Set `CLIENT_ORIGIN` to the exact Vercel origin.

## Backend with Docker

```powershell
docker build -f server/Dockerfile -t collabrix-api .
docker run --env-file .env -p 8787:8787 collabrix-api
```

The service role key must be supplied through the runtime secret manager, not baked into an image or committed file.

## Release checklist

- Apply all migrations.
- Confirm private Storage bucket policies.
- Create and role-assign Auth users.
- Verify CORS with the production frontend origin.
- Verify health, rate limiting, sign-in, RLS isolation, file permissions, and lifecycle transitions.
- Run `npm run build` and `npm audit --omit=dev`.
