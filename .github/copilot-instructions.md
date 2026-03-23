# Pizza Party — Copilot Instructions

**Purpose:** Demo security-vulnerability app (Broken Access Control, SQL Injection) used in presentations. Intentional vulnerabilities exist by design — do not "fix" them unless explicitly asked.

See [README.md](../README.md) for the full exploit guide.

## Build & Run

```sh
# First-time / full reset (re-seeds DB):
just restart

# Normal dev start (Docker must already be running):
just run          # docker compose up → bun install → bun dev

# Dev server only (services already up):
bun dev           # hot-reload at http://localhost:3000

# Production:
bun start
```

No test suite is defined.

## Architecture

**Single-process full-stack via Bun.** One `bun src/index.ts` process handles both the REST API and serves the React SPA.

| Layer | Details |
|-------|---------|
| **Runtime** | Bun (transpiles TS, serves HTTP natively) |
| **Backend** | Bun `serve({ routes })` — no Express/Hono |
| **Frontend** | React 19 + React Router DOM v7 (SPA, catch-all `/*` → `index.html`) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (`src/components/ui/`) |
| **Database** | PostgreSQL 17 via `pg` client; connection in `src/db/setup.ts` |
| **Infra** | Docker Compose: `postgres` (5432) + `caddy` (80/443 → localhost:3000) |

**Route structure (`src/index.ts`):**
- `/*` → SPA shell (`src/index.html`)
- `POST /api/auth/login`
- `GET /api/search/pizzas?q=&lat=&lng=`
- `GET|PUT /api/users/:id` and `/api/users/:id/profile-pic`
- `GET|POST /api/posts`

All routes except `/api/auth/login` require `Authorization: Bearer <token>`.

**Frontend routes (`src/App.tsx`):**
```
/login         → LoginPage
/search        → SearchPage (Google Maps + pizza markers)
/feed          → FeedPage (social posts)
/profile/:id   → ProfilePage
/profile       → ProfilePage (current user)
/              → redirect to /search
```

## Conventions

- **Path alias:** `@/*` → `src/*` (e.g., `import { cn } from "@/lib/utils"`)
- **UI components:** Use shadcn/ui components from `src/components/ui/` first; add new ones with `bunx shadcn@latest add <component>`
- **TypeScript:** Strict mode + `verbatimModuleSyntax` — always use `import type` for type-only imports
- **Auth token:** Stored in `localStorage` as `authToken`; a fake JWT (base64 payload, no real signature). `isAuthenticated()` only checks the prefix
- **DB credentials:** `postgres/postgres`, database `pizzaparty` (configured in `compose.yaml` and `src/db/setup.ts`)
- **Google Maps:** Default center = University of Calgary (`51.080, -114.131`); API key via `GOOGLE_MAPS_API_KEY` env var

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Entry point — DB init + all API routes |
| `src/db/setup.ts` | Schema creation, seed data, Haversine distance util |
| `src/App.tsx` | React Router setup, `ProtectedRoute` |
| `src/config/maps.ts` | Google Maps config + default coordinates |
| `src/pages/` | `FeedPage`, `SearchPage`, `ProfilePage`, `AppLayout` |
| `docs/Claude Plan.md` | Original AI-generated implementation plan |
