# Ideas

A parking lot for things deliberately left out — possible directions, not a plan
or a commitment, in no particular order. Each line notes roughly when it might
become worth doing, so an idea isn't lost and the current scope stays small.

Nothing here is decided. Three neighbours hold the things that are:

- **[BACKLOG.md](BACKLOG.md)** — known defects and committed next steps. Work
  waiting on someone doing it, not on a decision.
- **[DECISIONS.md](DECISIONS.md)** — choices already made, with the reasoning, plus
  upgrades that are blocked upstream and why.
- **[USE-CASES.md](USE-CASES.md)** — what all of this is *for*: the stakeholder
  questions we intend to answer, ranked. An idea usually gets picked up because a
  use case pulls it in.

## Model and product

- **Links between enterprises** — when one enterprise's model needs to reference another's (same real-world system, data exchange, roll-up to a coarser scope), add link tables between their artifacts rather than sharing rows. Additive on top of the per-enterprise ownership already in place; see [VISION.md](VISION.md).
- **Outcome/health metrics on a capability or building block** — value streams only model *triggered* value (a stakeholder need, start to finish); they structurally can't represent the passive, ambient value of a capability just quietly working (e.g. a customer fully happy with the product who never contacts support). That value is real but currently invisible in the model — nothing captures it, not even as a number. A measured signal attached to a capability or ABB (e.g. "% of clients with zero support cases this quarter", churn rate) would surface it without forcing a fake trigger into a value stream just to have something to model. Surfaced while modelling value streams through the running app.
- **Capability-to-architecture drill-down view** — a small, focused diagram/list on the business capability detail page showing just its realizing building blocks (and maybe their dependency subgraph). Tried as a layer on the main landscape diagram first (pills + a `serves` edge) and taken back out — capability-to-architecture is a different question ("what fulfills this?") from whole-landscape ("what's the architecture of the whole thing?"), and answering both in one picture just added noise. Revisit once the main diagram is in good shape.
- **Diagram support for indirect/transitive dependencies** — "what depends on this, directly and indirectly" (US-3.2) needs a graph traversal the diagram doesn't do today; it only ever shows one hop.
- **Multi-enterprise landscape view** — an enterprise's own landscape is sometimes only part of the picture (e.g. a vendor's product plugged into each client's own IT architecture). Depends on the cross-enterprise link tables in [VISION.md](VISION.md)/UC-8, which aren't built yet.
- **Audit log** — when there are real write operations.
- **Entity versioning** — when entity history needs preserving.

## Diagramming

- **Persisted, hand-editable diagram layout** — the landscape diagram (diagram-js + elkjs, shipped — see README) is read-only and recomputes layout from scratch every load. Turning it into an editable, persistable document (own notation: palette, connector tool, manual repositioning) — the same generate-then-hand-edit-then-keep workflow already solved for business processes via `bpmnXml` — is the natural next step, once someone actually wants to rearrange a diagram and keep it that way.
- **Cytoscape.js** — alternative to diagram-js if the landscape view turns out to be more "explore the dependency graph" than "author and keep a diagram": strong built-in layouts (cose, dagre, an elk extension), handles large graphs well, click-to-expand/collapse. Weaker as an authoring tool — no palette/connector UX — so only worth it if exploration ends up mattering more than persisted, hand-adjusted diagrams.

## Platform and interfaces

- **Auth (Keycloak)** — with the first multi-user feature; enterprise scoping today is a modelling boundary, not access control. Keycloak in Compose, OIDC on the API (passport-jwt + JWKS), OIDC client on the web.
- **REST facade** — only when a real third-party integrator needs it (CMDB sync, ServiceNow, iPaaS, scripts). REST + OpenAPI for core resources, sharing the service layer with GraphQL.
- **TanStack Query** — when the frontend calls a REST endpoint other than /health.
- **GraphQL Codegen + `packages/graphql`** — the API already emits its SDL to a committed `apps/api/schema.gql` (reviewable in diffs, codegen-ready). When the first real operations land: add graphql-codegen on the web, with the generated types in a shared `@openeam/graphql` package (so a future REST client / second consumer can reuse them). Note: `autoSchemaFile` writes the SDL at runtime — if the API container is later hardened to a read-only FS, generate the schema at build time instead.
- **Persisted queries** — during production hardening.
- **BullMQ + Redis** — first async job (e.g. CSV import).
- **MinIO** — first file upload.
- **Helm chart** — for Kubernetes.

## Data and search

- **Full-text search** — Postgres `tsvector` first, Meilisearch later.
- **Apache AGE** — if relational + recursive CTEs get limiting for graph queries.

## Operations and tooling

- **OpenTelemetry** — when there's a tracing backend to send to.
- **Playwright** — when UI flows need E2E coverage. (Unit and integration tests are
  not an idea — see [BACKLOG.md](BACKLOG.md).)
- **Turborepo** — if CI builds get slow (~2 min+).
- **i18n** — when a second language is actually needed.

## Public face

- **Community channels / demo hosting** — when there's activity and something to show.
- **Marketing site brand color** — a muted terracotta, `#b5452f` (`oklch(0.54 0.15 33)`), is reserved as OpenEAM's primary brand color for whenever a public/marketing site gets built. Deliberately *not* a UI accent inside the app itself — the app is color-coded for information everywhere (architecture domain, strategic direction, edge type), so a decorative accent on top of that would compete with those meanings rather than add identity. Today it appears in exactly one place in the app: the top-left square of the favicon (`apps/web/public/favicon.svg`, hardcoded hex since favicons don't reliably support `oklch()`) — it was briefly also on the "OpenEAM" sidebar wordmark, taken back out. No `index.css` token for it currently; add one back (`--color-brand`) if a second use case shows up.
