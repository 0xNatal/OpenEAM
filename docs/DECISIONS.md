# Decisions

Choices that are deliberate, with the reasoning that made them. Append-only:
when a decision changes, add a new entry that supersedes the old one rather than
editing history.

This exists because most of this codebase is written by an AI assistant working
from the repo as its only context. A choice with no recorded reason reads as an
accident, and the next change "helpfully" undoes it. If you find yourself
explaining the same decision twice, it belongs here.

A good entry says what was decided, what it rules out, and what would make you
change your mind. Blocked upgrades count — "we can't yet, and here is exactly
why" saves the next person the same investigation.

---

## D-1 · One table for both building block kinds

**Decided:** ABBs and SBBs live in one `building_blocks` table, discriminated by
a `kind` enum, rather than in two tables.

**Why:** every relationship table — realizations, capability links, org-unit
assignment, the relationship graph — then has a single foreign key target.
Two tables would double every one of those, or force polymorphic references.

**Cost:** `architecture_level` is meaningful only for `kind = 'architecture'`, so
it is nullable and the rule is enforced in the service layer (INV-3) rather than
by the schema. The GraphQL layer resolves the concrete type from `kind`.

**Revisit if:** the two kinds grow enough distinct fields that the shared table is
mostly nulls.

---

## D-2 · Architecture domains are data, not an enum

**Decided:** the four TOGAF BDAT domains are seeded per enterprise as rows with
`is_default = true`, not hardcoded as an enum.

**Why:** real architecture practices add their own lenses — security
architecture, integration architecture — and an enum would make that a schema
migration instead of a row.

---

## D-3 · A deliberately small relationship taxonomy

**Decided:** three relationship types — `depends_on`, `data_flow`, `hosted_on` —
instead of an ArchiMate-style taxonomy of serving, triggering, access, realization
and the rest.

**Why:** richer typing should follow real usage showing which distinctions matter,
not precede it. A taxonomy nobody can apply consistently is worse than a coarse
one everybody can.

**Note:** `hosted_on` is the odd one out. It is containment ("runs on"), not a
peer relationship, which is why a block may have only one active `hosted_on` edge
(INV-5) while the other two are naturally many-to-many.

**Revisit if:** users are systematically overloading `depends_on` to mean several
different things. This is a standing question for an EAM expert.

---

## D-4 · Half-open validity intervals on temporal relationships

**Decided:** temporal rows carry `valid_from` (inclusive) and `valid_to`
(exclusive), with `null` meaning unbounded. Changing an assignment closes the old
row and inserts a new one rather than updating in place.

**Why:** it makes the whole landscape reconstructible for any date, which is the
most distinctive thing this tool does — the `asOf` control is not a filter over
current data, it is a different view of the same history.

**Cost:** every write path has to close before it opens, and the service layer
only partly enforces that (see the INV-5 note in
[ARCHITECTURE.md](ARCHITECTURE.md)). ISO date strings are compared as strings,
which is correct for `YYYY-MM-DD` and would not be for any other format.

---

## D-5 · Classification is not history

**Decided:** architecture-domain assignment carries no validity interval. It is a
replace-all set, unlike every other link between building blocks and something
else.

**Why:** which domain something belongs to is a lens for reading the model, not an
event in the enterprise's life. Nobody asks "which domain was this in two years
ago" the way they ask "what was running on this platform two years ago".

**Status: open question.** This is the assumption most likely to be wrong, and
retrofitting validity onto a classification table later is a migration rather than
an addition. It is one of the three questions queued for an external EAM expert.

---

## D-6 · The enterprise is a hard boundary

**Decided:** every modelled row belongs to exactly one enterprise. Overlap between
two enterprises' models — the same real-world system appearing in both — is
expressed by link tables between them, never by sharing rows.

**Why:** an enterprise is the scope of an architecture effort, and two efforts
legitimately model the same system differently. Sharing rows would force one
model's opinion onto the other.

**Not yet true in code:** the boundary is currently a naming convention, not a
boundary — `findOne`, `update` and `delete` scope by bare id. See
[ARCHITECTURE.md](ARCHITECTURE.md) and roadmap T2.5.

---

## D-7 · `lucide-react` is the only icon library

**Decided:** one icon library. Import from `lucide-react` or extend it; do not add
another, including to satisfy a component library's default.

**Why:** `@hugeicons/*` was added this way and removed again — it duplicated icons
already available in Lucide, at the cost of a second dependency and two visual
languages in one UI.

---

## D-8 · Example bundle ids are deterministic UUIDs

**Decided:** ids in `examples/*.json` are UUIDv5 values derived from a readable
key, not handwritten slugs and not random UUIDs.

**Why:** three things at once. They are the same shape the app mints at runtime
(`randomUUID()`), so an example looks like a real exported bundle. They are
globally unique by construction, which matters because `id` is a plain primary key
(INV-10) and the demo instance will hold several enterprises' models in one
database — handwritten slugs collided the first time two bundles met. And being
derived rather than random, regenerating a bundle produces byte-identical output,
so a diff shows only what actually changed.

**Cost:** deep links are no longer human-readable. Judged not to matter — nobody
types those URLs.

**Not done yet:** `examples/household.json` still carries bare `abb-`/`sbb-` ids
and cannot be imported alongside another bundle using the same convention.

---

## D-9 · Deterministic checks block, probabilistic checks advise

**Decided:** automated gates that block a merge must be deterministic. Anything
probabilistic — an LLM reviewing a diff, a heuristic scan — advises on a pull
request instead.

**Why:** a gate that is unreliably red trains people to bypass it. One spurious
block in ten earns a permanent `--no-verify` habit, and then the reliable checks
are bypassed too. This was learned twice: from a pre-flight check that was
permanently red for an unrelated reason (see D-10), and from a bespoke name-grep
built for CI and reverted because it fired on exactly one machine while charging
every contributor for it.

**Corollary:** a maintainer's personal risk belongs in local, untracked config.
Shared risk uses standard tooling — for secrets, pattern-and-entropy scanning and
push protection, not a wordlist.

---

## D-10 · Line endings are pinned to LF

**Decided:** `.gitattributes` sets `* text=auto eol=lf`.

**Why:** `apps/web/src/components/ui/select.tsx`, emitted by the shadcn CLI, had
CRLF endings. With `core.autocrlf=true` and no `.gitattributes`, git stored LF, so
CI passed on Linux while `pnpm lint` failed locally every time — for a file nobody
wrote. Sixteen working-tree files were affected. `.gitattributes` outranks
`core.autocrlf`, so this is settled for every contributor rather than per machine.

---

## D-11 · `graphql` 17 is blocked

**Blocked, not a scope choice.** `@apollo/server` peers on `graphql: ^16.11.0`,
and `graphql-ws` (used by `@nestjs/graphql` subscriptions) peers on
`^15.10.1 || ^16`, so `apps/api` cannot move even though `@nestjs/graphql` and
`@apollo/client` already support 17.

**Revisit when:** Apollo Server ships graphql-17 support.

---

## D-12 · `typescript` 7 is blocked

**Blocked, not a scope choice.** TS7 dropped the classic
`moduleResolution: "Node"`, forcing `apps/api` and `packages/db` onto `Node16`
(required alongside `module: "CommonJS"`). That surfaces a real dual-package
hazard in Drizzle ORM 0.45.2: its separate `.d.ts`/`.d.cts` declarations for the
same internal `SQL` class load as two distinct types once API code compares values
from different Drizzle entry points, breaking ~10 service files with `TS2769` /
`TS2322`.

Confirmed the fix is not in `@openeam/db`'s own `exports` — it typechecks clean
standalone, and adding an explicit `require` condition did not help. This is
upstream in Drizzle's package structure.

**Revisit when:** Drizzle fixes Node16/NodeNext resolution — or if `apps/api` and
`packages/db` drop CommonJS emit for ESM, which is an architecture change rather
than a version bump.
