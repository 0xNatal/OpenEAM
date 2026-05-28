# OpenEAM

Self-hosted, open-source Enterprise Architecture Management tool.

Early WIP. Right now this is just a runnable skeleton: GraphQL API, React SPA, Postgres. No EAM features yet — see [docs/IDEAS.md](docs/IDEAS.md) for ideas on where it could go.

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
