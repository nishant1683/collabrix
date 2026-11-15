# Known limitations

- This repository has deployment configuration but has not been deployed from this environment.
- Live Supabase authentication, RLS checks, Storage uploads, notifications, and reports require project credentials.
- Email, push, and realtime notification delivery are not configured. Notifications are persisted in Supabase for in-app consumption.
- Payment status is tracked as database state; no payment provider is integrated.
- Proposal, file, and report interfaces are intentionally focused foundations rather than a complete operations suite.
- No production observability, backup policy, or incident response integration is included.
- `CLIENT_ORIGIN` currently supports one configured origin. Multi-origin environments need an explicit allowlist implementation.
- Production security review should confirm Supabase policies, Storage object paths, database grants, and secret rotation before launch.
