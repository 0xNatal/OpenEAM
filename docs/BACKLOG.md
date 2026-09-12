# Backlog

Work that is **decided** — known defects and committed next steps. Unlike
[IDEAS.md](IDEAS.md), nothing here is waiting on a decision; it is waiting on
someone doing it.

The split matters: four security defects previously sat among forty entries in
the ideas list, which is where urgent things go to be camouflaged. Anything in
this file has a reason to be done and, where relevant, a reason it is done *now*.

`T…` ids refer to initiatives in the project's transition roadmap, which is
tracked outside the repository. Entries without one are not on that plan.

---

## Before this is reachable from outside localhost

These are the reason "basic access restriction" cannot be the last thing done.

- **Close the data-exchange endpoints** (T2.1) — `GET /api/data-exchange/export`
  with no parameters returns every enterprise, unauthenticated.
  `POST /api/data-exchange/import` deletes and replaces them. The first person to
  find the URL has full read and write. Require an admin token at minimum; better,
  put both routes behind the same protection as everything else and drop the
  parameterless full-database export entirely.

- **Gate GraphiQL and introspection outside dev** (T2.2) — `graphiql: true` is
  hardcoded in `GraphQLModule.forRoot` (`apps/api/src/app.module.ts`) with no
  environment check, and introspection is not explicitly disabled either, so any
  deployment ships an interactive query IDE over the model. Gate both behind
  `NODE_ENV !== 'production'` or a dedicated flag.

- **Validate env vars at boot** (T2.3) — `apps/api/src/main.ts` reads
  `DATABASE_URL` / `API_PORT` / `WEB_ORIGIN` ad hoc via `process.env` with `??`
  fallbacks, so a bad production config fails at the first request instead of at
  startup. A small zod-validated config object would fail fast with a clear
  message; zod is already a dependency.

- **Security headers and request throttling** (T2.4) — no `helmet`, no rate
  limiting. Cheap now, easy to forget the moment the API is reachable.

- **Enforce the enterprise boundary in the service layer** (T2.5) — services scope
  `findAll` by enterprise, then scope `findOne`, `update` and `delete` by bare id,
  so any id from any enterprise is readable and deletable. Harmless with one user,
  and precisely the assumption that becomes broken access control the day there is
  a second. Eight services.

- **Apply service invariants on the import path** (T2.6, US-1.11) — the importer
  writes rows directly and bypasses every rule the services enforce. It is also
  the restore path, so a bad bundle can quietly leave a landscape that lies. See
  the invariant table in [ARCHITECTURE.md](ARCHITECTURE.md).

## Foundation

- **Test harness** (T1.3) — there is no test infrastructure at all. Vitest plus a
  Postgres service container in CI. Everything below that needs a test depends on
  this existing. Tool choice stays Vitest; the `test` / `test:watch` scripts and
  the CI step go in with it.

- **Invariant tests** (T1.4) — turn INV-1 … INV-12 in
  [ARCHITECTURE.md](ARCHITECTURE.md) into tests. They are already written down as
  rules; this is the cheapest test anyone will ever write, and the current
  Definition of Done (lint, typecheck, build) proves only that the code compiles.

- **Round-trip test on data exchange** (T1.5) — export, import into an empty
  database, export again, compare. One test covering the widest surface in the
  codebase, and it guards the exact path private models are restored from.

- **Drift checks** (T1.6) — fail CI when the committed `schema.gql` differs from
  the generated one, or when `drizzle-kit generate` would produce a migration.
  Catches "forgot to regenerate" in both directions for about twenty lines of
  workflow.

- **Secret scanning** (T1.7) — gitleaks as a pre-commit hook and CI job, plus
  GitHub push protection. Credentials are the leak that actually hurts a
  self-hosted tool. A maintainer's own private names belong in a local, untracked
  gitleaks rule file — personal risk, personal config. See D-9 in
  [DECISIONS.md](DECISIONS.md).

- **Renovate and CodeQL** (T1.8) — nothing surfaces outdated packages today; a
  manual `pnpm -r outdated` pass in 2026-08 found 31 stale ones, including a stale
  peer-dependency ghost in `node_modules` that silently broke a typecheck. CodeQL
  is free on public repositories.

- **App containers and Compose app services** (T3.1, T3.2) — Dockerfiles for
  `apps/api` (multi-stage, `pnpm deploy --prod`, `node dist/main.js`) and
  `apps/web` (multi-stage build → nginx serving the SPA, proxying `/graphql` and
  `/health`), plus a root `.dockerignore` and the `api` / `web` services in
  `compose.yml`. This is simultaneously the deployment artifact and the "easy
  self-host" promise the README already makes — one piece of work, two payoffs.
  Known trap: the API image must build `@openeam/db` before `apps/api`, since the
  API consumes the package's compiled `dist`.

- **Run migrations on container startup** (T3.3) — a self-hoster should never be
  asked to run drizzle-kit by hand.

## Model and data

- **Id collisions surface as a 500** — importing a bundle whose ids already exist
  under a different enterprise fails with a Drizzle duplicate-key stack trace
  rather than a readable error naming the offending id. Belongs with T2.6.

- **No UI to add or remove information on a capability** — the GraphQL mutations
  exist (`createInformationObject`, `linkCapabilityInformation` and their
  counterparts), and the Information quadrant renders what is linked, but there is
  no way to do it from the capability page. Same gap as the building block one
  below, and worth fixing in one pass: both are "the read path is real, the write
  path is API-only".

- **No mutation to link a building block to a business capability** —
  `buildingBlockCapabilities` (which ABBs realize which capability) can only be set
  by the importer; there is no GraphQL mutation and no UI, on either detail page.
  Found while modelling ABBs by hand through the running app: linking them required
  a direct DB insert mirroring what the importer does. Small slice — a
  `linkBuildingBlockCapability` / `unlinkBuildingBlockCapability` pair plus a way to
  add and remove links from one of the two detail pages.

- **The building block detail page ignores `asOf`** — it lists every relationship
  the block ever had, oldest first, with closed and live ones visually identical
  apart from their dates. On the Self-Managed VM Fleet in `alderbrook.json` that
  means the three live `hosted_on` edges sit below seven historical ones. This is
  the page that most directly answers "what is still running on this?", and it is
  the one page that does not honour the time dimension the rest of the app is
  built around. At minimum: separate live from closed, or respect the landscape's
  `asOf`.

- **The landscape diagram does not fit to the viewport** — at ~58 building blocks
  the graph renders clipped at the top with dead space below, and there is no
  fit-to-view or zoom-to-extent. Invisible with a six-block model; obvious with a
  realistic one, and it is the screen a demo lives on.

## Project hygiene

- **Releases mean nothing yet** (T4.4) — every package is `0.0.0`, there are no
  tags and no CHANGELOG. A roadmap with a "release" column needs releases to be
  things.

- **No SECURITY.md** (T4.4) — an Apache-2.0 public repository with no
  authentication needs a disclosure path more than most. Issue templates belong
  here too.

- **The Definition of Done has no test criterion** — [CONTRIBUTING.md](../CONTRIBUTING.md)
  requires lint, typecheck and build. For code that is not reviewed line by line,
  those three prove it compiles, not that it works. Add the test step once T1.3
  lands.

- **UC-7 conflates two different things** — "access restriction" (infrastructure,
  needed in weeks) and "users and permissions" (a product feature for next year)
  both live under one use case in [USE-CASES.md](USE-CASES.md). They should be
  separated.
