# OpenEAM

Self-hosted, open-source Enterprise Architecture Management tool.

Early WIP, but past the skeleton stage: value streams, business capabilities, business processes (with BPMN modelling), and an architecture/solutions landscape of building blocks with typed relationships between them (depends on, exchanges data with, runs on) and a diagram view of that landscape with automatic layout, all over a GraphQL API with a React SPA and Postgres.

Everything is scoped to an **enterprise** — the scope of an architecture effort, from a whole corporate group down to a household.

**Why and what next:** [docs/VISION.md](docs/VISION.md) for where this is headed (meeting your architecture wherever it is, from fully manual to API-driven; baseline/target and the work in between; many views for many stakeholders), [docs/USE-CASES.md](docs/USE-CASES.md) for what we're building next and why that one first, broken into stories in [docs/USER-STORIES.md](docs/USER-STORIES.md).

**How it's built:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the map of the codebase and the invariants the model depends on, [docs/GLOSSARY.md](docs/GLOSSARY.md) for what each EAM term means here, and [docs/DECISIONS.md](docs/DECISIONS.md) for the choices that are deliberate and why.

**What's next and what's merely possible:** [docs/BACKLOG.md](docs/BACKLOG.md) for known defects and committed work, [docs/IDEAS.md](docs/IDEAS.md) for the parking lot.

There are two example models in [examples/](examples/) you can import to see the metamodel working: `household.json`, the smallest possible one, and `alderbrook.json`, a fictional SaaS company with a runtime migration in flight so the `asOf` date visibly changes the landscape.

## Run it

Needs Node 24 and pnpm 11 (`.node-version` pins Node; we use [fnm](https://github.com/Schniz/fnm)), plus Docker for Postgres.

```bash
cp .env.example .env
pnpm install
docker compose up -d   # Postgres
pnpm dev
```

- Web: http://localhost:3000
- GraphQL: http://localhost:4000/graphql

The apps aren't containerized yet (see [docs/IDEAS.md](docs/IDEAS.md)) — for now they run via the dev server with hot reload; only Postgres runs in Docker.

Want to see it with data? `POST` one of the bundles in [examples/](examples/) to `/api/data-exchange/import`:

- [examples/household.json](examples/household.json) — a small fictional household modelled as an enterprise (storage, backup, media streaming) with dated building blocks, so `architectureLandscape`/`solutionsLandscape` timeline queries (`asOf`) have something to show.

Import replaces only the enterprises the bundle contains; other enterprises are left untouched.

## Stack

NestJS + GraphQL (Apollo Server) · React + Vite + TanStack Router · Postgres + Drizzle · TypeScript · pnpm workspaces · Biome.

## Layout

```
apps/api    NestJS backend (GraphQL + /health)
apps/web    React + Vite SPA
packages/db Drizzle schema + connection
```

## License

[Apache-2.0](LICENSE)
