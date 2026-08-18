# CLAUDE.md

Operating notes for AI assistants working in this repo, on top of [docs/](docs/) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Private enterprise data

Real, non-public enterprises (an employer's or client's actual architecture) sometimes get modelled here as data-exchange bundles so they can be read, imported, and updated locally. These live under `examples/private/`, which is gitignored. Never move a real-enterprise bundle outside that folder, and never name a real enterprise in any tracked file — docs, code comments, commit messages, anything that ends up in git — not even as an aside or example. `examples/household.json` is the only bundle that should ever be referenced in committed docs.

## Before considering lint clean

Run `pnpm lint` (repo-wide `biome check .`, per [CONTRIBUTING.md](CONTRIBUTING.md)) — not a scoped `biome check` against only the files touched in a change. Generated files (e.g. `packages/db/drizzle/meta/*.json`, written by drizzle-kit) can fail Biome's formatting without ever showing up in a per-file check.

## Icon library

`lucide-react` is the only icon library in this repo. Don't add another one (e.g. to satisfy a component library's default) — import from `lucide-react` or extend it instead. `@hugeicons/*` was removed for this reason; it duplicated icons already available in Lucide.

## Docs update order

When a change touches more than one doc: [docs/VISION.md](docs/VISION.md) → [docs/USE-CASES.md](docs/USE-CASES.md) → [docs/USER-STORIES.md](docs/USER-STORIES.md) → [docs/IDEAS.md](docs/IDEAS.md) → `README.md`. Vision is the foundation everything else derives from or links back to; README summarizes the settled state last.
