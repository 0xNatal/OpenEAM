# Ideas

A parking lot for things deliberately left out of the init — possible directions, not a plan or a commitment, in no particular order. Each line notes roughly when it might become worth doing, so an idea isn't lost and the init stays small.

These are technical choices. What they're *for* — the stakeholder questions we intend to answer, ranked — lives in [USE-CASES.md](USE-CASES.md); an idea usually gets picked up because a use case pulls it in.

- **Links between enterprises** — when one enterprise's model needs to reference another's (same real-world system, data exchange, roll-up to a coarser scope), add link tables between their artifacts rather than sharing rows. Additive on top of the per-enterprise ownership already in place; see [VISION.md](VISION.md).
- **Auth (Keycloak)** — with the first multi-user feature; enterprise scoping today is a modelling boundary, not access control. Keycloak in Compose, OIDC on the API (passport-jwt + JWKS), OIDC client on the web.
- **First EAM entities** (Applications, Capabilities, Technologies) — once scope is agreed. Over GraphQL.
- **REST facade** — only when a real third-party integrator needs it (CMDB sync, ServiceNow, iPaaS, scripts). REST + OpenAPI for core resources, sharing the service layer with GraphQL.
- **TanStack Query** — when the frontend calls a REST endpoint other than /health.
- **GraphQL Codegen + `packages/graphql`** — the API already emits its SDL to a committed `apps/api/schema.gql` (reviewable in PRs, codegen-ready). When the first real operations land: add graphql-codegen on the web, with the generated types in a shared `@openeam/graphql` package (so a future REST client / second consumer can reuse them), plus a CI check that the committed schema is in sync. Note: `autoSchemaFile` writes the SDL at runtime — if the API container is later hardened to a read-only FS, generate the schema at build time instead.
- **shadcn/ui** — when the UI is more than a demo.
- **Persisted, hand-editable diagram layout** — the landscape diagram (diagram-js + elkjs, shipped — see README) is read-only and recomputes layout from scratch every load. Turning it into an editable, persistable document (own notation: palette, connector tool, manual repositioning) — the same generate-then-hand-edit-then-keep workflow already solved for business processes via `bpmnXml` — is the natural next step, once someone actually wants to rearrange a diagram and keep it that way.
- **Cytoscape.js** — alternative to diagram-js if the landscape view turns out to be more "explore the dependency graph" than "author and keep a diagram": strong built-in layouts (cose, dagre, an elk extension), handles large graphs well, click-to-expand/collapse. Weaker as an authoring tool — no palette/connector UX — so only worth it if exploration ends up mattering more than persisted, hand-adjusted diagrams.
- **Capability-to-architecture drill-down view** — a small, focused diagram/list on the business capability detail page showing just its realizing building blocks (and maybe their dependency subgraph). Tried as a layer on the main landscape diagram first (pills + a `serves` edge) and taken back out — capability-to-architecture is a different question ("what fulfills this?") from whole-landscape ("what's the architecture of the whole thing?"), and answering both in one picture just added noise. Revisit once the main diagram is in good shape.
- **Diagram support for indirect/transitive dependencies** — "what depends on this, directly and indirectly" (US-3.2) needs a graph traversal the diagram doesn't do today; it only ever shows one hop.
- **Multi-enterprise landscape view** — an enterprise's own landscape is sometimes only part of the picture (e.g. a vendor's product plugged into each client's own IT architecture). Depends on the cross-enterprise link tables in [VISION.md](VISION.md)/UC-8, which aren't built yet.
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
- **`graphql` 17** — blocked, not a scope choice: `@apollo/server` peers on `graphql: ^16.11.0` and `graphql-ws` (used by `@nestjs/graphql` subscriptions) peers on `^15.10.1 || ^16`, so `apps/api` can't move even though `@nestjs/graphql`/`@apollo/client` already support 17. Revisit once Apollo Server ships graphql-17 support.
- **`typescript` 7** — blocked, not a scope choice: TS7 dropped the classic `moduleResolution: "Node"`, forcing `apps/api`/`packages/db` onto `Node16` (required alongside `module: "CommonJS"`). That surfaces a real dual-package hazard in Drizzle ORM 0.45.2 — its separate `.d.ts`/`.d.cts` declarations for the same internal `SQL` class get loaded as two distinct types once `apps/api` code compares values from different Drizzle entry points, breaking `~10` service files with `TS2769`/`TS2322`. Confirmed the fix isn't in `@openeam/db`'s own `exports` (it typechecks clean standalone; adding an explicit `require` condition didn't help either) — this is upstream in Drizzle's package structure. Revisit once Drizzle fixes Node16/NodeNext resolution, or only if `apps/api`/`packages/db` drop CommonJS emit for ESM (a real architecture change, not a bump).
- **Helm chart** — for Kubernetes.
- **Community channels / demo hosting** — when there's activity and something to show.
