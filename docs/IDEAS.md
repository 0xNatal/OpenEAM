# Ideas

A parking lot for things deliberately left out of the init — possible directions, not a plan or a commitment, in no particular order. Each line notes roughly when it might become worth doing, so an idea isn't lost and the init stays small.

- **Auth (Keycloak)** — with the first user-facing feature. Keycloak in Compose, OIDC on the API (passport-jwt + JWKS), OIDC client on the web.
- **First EAM entities** (Applications, Capabilities, Technologies) — once scope is agreed. Over GraphQL.
- **REST facade** — only when a real third-party integrator needs it (CMDB sync, ServiceNow, iPaaS, scripts). REST + OpenAPI for core resources, sharing the service layer with GraphQL.
- **TanStack Query** — when the frontend calls a REST endpoint other than /health.
- **GraphQL Codegen + `packages/graphql`** — the API already emits its SDL to a committed `apps/api/schema.gql` (reviewable in PRs, codegen-ready). When the first real operations land: add graphql-codegen on the web, with the generated types in a shared `@openeam/graphql` package (so a future REST client / second consumer can reuse them), plus a CI check that the committed schema is in sync. Note: `autoSchemaFile` writes the SDL at runtime — if the API container is later hardened to a read-only FS, generate the schema at build time instead.
- **shadcn/ui** — when the UI is more than a demo.
- **React Flow + ELK.js** — for the first diagram view.
- **Audit log** — when there are real write operations.
- **Entity versioning** — when entity history needs preserving.
- **BullMQ + Redis** — first async job (e.g. CSV import).
- **MinIO** — first file upload.
- **OpenTelemetry** — when there's a tracing backend to send to.
- **i18n** — when a second language is actually needed.
- **Full-text search** — Postgres `tsvector` first, Meilisearch later.
- **Persisted queries** — during production hardening.
- **Apache AGE** — if relational + recursive CTEs get limiting for graph queries.
- **Turborepo** — if CI builds get slow (~2 min+).
- **Unit/integration tests (Vitest)** — removed from the init (the only test was a health smoke test with nothing real to cover yet). Re-add with the first real feature: `vitest` devDep + `test`/`test:watch` scripts per package, the root `test` script, and the CI test step. Tool choice stays Vitest.
- **Playwright** — when UI flows need E2E coverage.
- **App containers + Compose app services** — Dockerfiles for `apps/api` (Node runtime; multi-stage with `pnpm deploy --prod`, `node dist/main.js`) and `apps/web` (multi-stage build → nginx serving the SPA, proxying `/graphql` + `/health`), the `api` + `web` services in `compose.yml`, and a root `.dockerignore`. Then `docker compose up` runs the whole stack — the project's core "easy self-host" promise. Left out of init: dev runs everything via `pnpm dev` with only Postgres in Docker. Would matter for the first end-to-end demo / self-hosting. Gotcha already solved once: the API container must build `@openeam/db` before `apps/api`, since the API consumes the package's compiled `dist`.
- **Helm chart** — for Kubernetes.
- **Community channels / demo hosting** — when there's activity and something to show.
