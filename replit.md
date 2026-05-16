# Super Admin SaaS Platform

A central command hub for managing multiple SaaS products/projects — their users, custom data collections, and records — from one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/super-admin run dev` — run the frontend (port 20029)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Charts: Recharts

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (projects, users, collections, records, activity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/super-admin/src/` — React frontend (pages, components)

## Architecture decisions

- Projects are the top-level entity; all other entities (users, collections) belong to a project
- Collections store their field schema as a JSON string (`fields` column) for flexibility
- Records store their data as a JSON string (`data` column) — schema-agnostic storage
- All mutations log to the `activity` table for a cross-platform audit trail
- Stats are computed at query time (no materialized views) — acceptable for MVP scale

## Product

- Dashboard with live stats and per-project breakdown chart
- Projects: full CRUD, status management (active/inactive/archived)
- Users: searchable table, role management (super_admin/admin/editor/viewer), project assignment
- Collections: custom data schema builder per project
- Records: CRUD against any collection's data
- Activity feed: chronological audit log across all projects
- Dark mode support

## User preferences

- Reference codebase (SuperAdmin-Next) used for structural inspiration only — not imported

## Gotchas

- Run codegen after every OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Body schema names in OpenAPI must be entity-shaped (e.g. `ProjectInput`), never operation-shaped (e.g. `CreateProjectBody`) — Orval collision
- `SuperAdmin-Next/` directory in workspace root is the reference repo (not a workspace package)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
