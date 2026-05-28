# Contributing

## Setup

Needs Node 24, pnpm 11, Docker.

```bash
pnpm install
cp .env.example .env
docker compose up postgres -d
pnpm dev
```

Web on http://localhost:3000, API on http://localhost:4000.

## Before opening a PR

Run the same checks CI runs:

```bash
pnpm lint
pnpm -r typecheck
pnpm -r build
```

Branch off `main`. Keep PRs focused.

## Bigger decisions

Replacing a framework, adding a database, changing the auth model — open an issue to discuss before building.

## Ideas

Things deliberately left out of the init — and roughly when they'd matter — live in [docs/IDEAS.md](docs/IDEAS.md). It's an ideas box, not a committed plan.

By contributing you agree your work is licensed under [Apache-2.0](LICENSE).
