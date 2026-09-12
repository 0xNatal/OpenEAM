# Architecture

How OpenEAM is built, for someone about to change it. [VISION.md](VISION.md) says
what it is for; this says where things are and which rules must hold.

If you only read one section, read [Invariants](#invariants). They are the rules
the model would silently lie about if broken, and they are what automated checks
exist to protect.

## Shape

A pnpm workspace, three packages, ~10,500 lines.

| Package | What it is | Size |
| --- | --- | --- |
| `packages/db` | Drizzle schema, migrations, client. The metamodel lives here. | ~615 lines |
| `apps/api` | NestJS + Apollo. Code-first GraphQL, one REST controller. | ~2,200 lines |
| `apps/web` | React 19 + Vite + TanStack Router SPA. | ~7,700 lines |

Postgres runs in Compose; both apps run from `pnpm dev`. There are no app
containers yet — see [BACKLOG.md](BACKLOG.md).

## The metamodel (`packages/db`)

19 tables and 8 enums across ten schema files, one per subject area. Read the
comments in `packages/db/src/schema/` before changing anything there — they
explain *why* each shape was chosen, and several of them encode decisions
recorded in [DECISIONS.md](DECISIONS.md).

The vocabulary — ABB, SBB, realization, value stream, architecture domain — is
defined in [GLOSSARY.md](GLOSSARY.md). It is TOGAF's, used deliberately; getting
a term wrong in code is a real defect here, not a style preference.

Three structural things worth knowing up front:

**One table for both building block kinds.** `building_blocks` holds ABBs and
SBBs, discriminated by `kind`, so every relationship table has a single foreign
key target. `architecture_level` is meaningful only for `kind = 'architecture'`.

**Temporal relationships are append-and-close, not update.** When an assignment
changes, the existing row is closed by setting `valid_to` and a new row is
inserted. That is what lets the landscape be reconstructed for any date. It
applies to `building_block_organization_units`, `building_block_realizations`,
`building_block_capabilities`, `building_block_relationships`,
`capability_information` and `capability_actors`.

**Classification is not history.** `building_block_architecture_domains`
deliberately has no validity interval — it is a replace-all set. Whether that is
the right call is an open question; see [DECISIONS.md](DECISIONS.md).

Migrations are generated with `pnpm db:generate` and applied with
`pnpm db:migrate`. Ten are committed. Generated files under
`packages/db/drizzle/meta/` are formatted by drizzle-kit and still have to pass
repo-wide Biome — run `pnpm lint` at the root, never a scoped check.

## The API (`apps/api`)

Ten feature modules, each `*.module.ts` / `*.service.ts` / `*.resolver.ts` /
`*.model.ts`. Services own the business rules; resolvers are thin.

GraphQL is **code-first**: models carry decorators and Nest generates the SDL at
runtime into `apps/api/schema.gql` (371 lines), which is committed so schema
changes are visible in a diff. If you change a model, the SDL changes — commit it.

`data-exchange` is the odd module out: a REST controller (`GET /api/data-exchange/export`,
`POST /api/data-exchange/import`) validating against a zod schema in
`data-bundle.schema.ts`. Import replaces exactly the enterprises carried in the
bundle and touches nothing else.

### Where the rules live, and where they don't

Service methods enforce the invariants below. **The importer does not.** It writes
rows directly, bypassing every rule the services apply — and it is also the
restore path, so a malformed bundle can leave a model that looks fine and lies.
That gap is known and tracked (US-1.11, roadmap T2.6).

A second known gap: services scope `findAll` by enterprise, then scope `findOne`,
`update` and `delete` by bare id. Any id from any enterprise is readable and
deletable. Harmless while there is one user; it must close before there are two
(roadmap T2.5).

## The web app (`apps/web`)

- **Routing** — TanStack Router, file-based in `src/routes/`. `$param` files are
  detail routes; `$param_.model.tsx` is the BPMN modeller. The route tree is
  generated (`pnpm --filter @openeam/web exec tsr generate`), so a new file is a
  new route.
- **Index + detail + form sheet** is the shape every entity follows: a list page
  with a create button, a detail page, and one shared `*-form-sheet.tsx` the list
  opens in create mode and the detail page opens in edit mode. `actors` and
  `information-objects` are the most recent pair to copy from.
- **Deleting** evicts the row from the Apollo cache in the mutation's `update`,
  then `cache.gc()` — without it, navigating back shows a list still containing
  the deleted row.
- **Data** — Apollo Client against `/graphql`, proxied by Vite in dev.
- **Enterprise scope** — `src/lib/enterprise.tsx` holds the selected enterprise in
  a context, persisted in `localStorage` under `enterpriseId`. Every scoped page
  reads it.
- **Landscape diagram** — diagram-js with elkjs auto-layout. Read-only and
  recomputed on every load; it is not a persisted document.
- **Process diagrams** — bpmn-js. Here the diagram *is* the source of truth:
  `bpmn_xml` is stored, and `process_steps` are re-synced from it on every save.
- **Icons** — `lucide-react`, and only `lucide-react`. See [DECISIONS.md](DECISIONS.md).
- **Sidebar** — defaults to collapsed/icon-only. That is the primary state, not a
  small-screen fallback; design nav for icon+tooltip wayfinding first.

## Invariants

Rules the service layer enforces, or that the model depends on. Each has an id so
a test, a review comment or a commit message can point at one. They are currently
enforced in code and described in comments; turning them into tests is roadmap
T1.4.

| Id | Rule | Enforced where |
| --- | --- | --- |
| **INV-1** | Validity intervals are half-open: `validFrom` inclusive, `validTo` exclusive, `null` unbounded on that side. ISO `YYYY-MM-DD` strings compare correctly, so comparison is string comparison. | `isValidAt()` in `building-blocks.service.ts` |
| **INV-2** | A building block belongs to at least one architecture domain. | `validateInput()` |
| **INV-3** | `architectureLevel` applies only to `kind = 'architecture'`; it is forced to `null` for solution blocks. | `validateInput()` and both write paths |
| **INV-4** | A building block cannot relate to itself. | `createRelationship()` |
| **INV-5** | A block has at most one *active* `hosted_on` edge — containment, not a peer relationship. | `createRelationship()` |
| **INV-6** | A business process's `capabilityId` must exist, and its `enterpriseId` is kept in sync with the owning capability's enterprise. | `business-processes.service.ts` |
| **INV-7** | `bpmnXml` must parse as BPMN 2.0; `process_steps` are replaced from the diagram on every save. | `business-processes.service.ts` |
| **INV-8** | Architecture-domain and organization-unit assignment are replace-all sets with no validity interval. | `replaceAssignments()` |
| **INV-9** | Every row belongs to exactly one enterprise. Overlap between enterprises is expressed with links between their models, never by sharing rows. | Schema design; see [VISION.md](VISION.md) |
| **INV-10** | Ids are globally unique. `id` is a plain primary key, *not* composite with `enterprise_id`, so two enterprises sharing a database cannot reuse an id. | Postgres primary key |
| **INV-11** | A capability and an information object linked together belong to the same enterprise. Both ids are valid alone; the pair is what is wrong. | `information-objects.service.ts` |
| **INV-12** | A capability has at most one *open* link to the same information object &mdash; the same close-before-you-open rule as INV-5. | `information-objects.service.ts` |
| **INV-13** | An actor's `organizationUnitId` is set only when `kind = 'team'`, and the unit belongs to the same enterprise. Without it, teams end up modelled twice under two names. | `actors.service.ts` |
| **INV-14** | A capability and an actor linked together belong to the same enterprise. | `actors.service.ts` |
| **INV-15** | A capability has at most one *open* link to the same actor. | `actors.service.ts` |

Two sharp edges in the current implementations, so you are not surprised by them:

- **INV-5 checks less than it claims.** It rejects a second `hosted_on` edge only
  when an existing one is *unbounded* (`validTo` null). It does not check full
  interval overlap. Closing the old edge before opening a new one is the caller's
  responsibility, as with every temporal link here.
- **INV-10 is enforced by Postgres, not by us.** Violating it surfaces as a
  duplicate-key 500 from the import endpoint rather than a readable error. Example
  bundles avoid it by deriving ids as UUIDv5 from a readable key; see
  [DECISIONS.md](DECISIONS.md).

## Example bundles

`examples/*.json` are data-exchange bundles that import through the same endpoint
a user would use.

- **`household.json`** — the smallest possible model, a family household. The only
  bundle that may be named in committed docs.
- **`alderbrook.json`** — a fictional B2B SaaS, ~58 building blocks. Sized so the
  metamodel is legible to a stranger: ABB/SBB splits, three-deep hosting nesting,
  dated realizations, and a runtime migration in flight so the `asOf` date visibly
  changes the picture.

Real, non-public enterprises are modelled in `examples/private/`, which is
gitignored, and are never named in any tracked file. See [CLAUDE.md](../CLAUDE.md).

## Working on it

```bash
pnpm install
cp .env.example .env
docker compose up postgres -d
pnpm db:migrate
pnpm dev                 # web :3000, api :4000
```

Before calling anything done: `pnpm lint` (repo-wide), `pnpm -r typecheck`,
`pnpm -r build`. There is no test suite yet — that is roadmap T1.3, and it is why
those three currently prove that the code compiles, not that it works.

`.claude/skills/verify/SKILL.md` has the details for driving the running app
headlessly.
