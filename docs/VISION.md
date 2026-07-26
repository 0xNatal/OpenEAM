# Vision

Where OpenEAM is headed. Not a spec — a shared sense of what we're building and
why, filled in as the project takes shape. Where a decision here shapes the
code, the code links back.

## Meet the architecture where it is

Most EAM tools assume you'll sit down and model everything by hand. That's a
fine way to use OpenEAM, but it shouldn't be the only one.

OpenEAM should work with whatever data it can get. Doing everything by hand is
okay. Pushing everything in over APIs is okay. And in between is where most
teams actually live: OpenEAM should take what's already lying around and make
sense of it — read a `package.json` and infer building blocks and their
dependencies, pull from a CMDB, ingest an export from another tool. It takes the
data it can get and supports as much as it can from there.

Integration is a spectrum, and every point on it should feel first-class.

## Building blocks are the core

Building blocks are the unit everything else hangs off — architecture building
blocks (a needed capability) and solution building blocks (what implements it),
with lifecycle and validity over time. A lot of the value is in how well they're
documented: description, ownership, dependencies, the metadata that makes a block
mean something to whoever's looking. Making that documentation rich and easy to
maintain is a running focus, not a one-off.

## Many views for many stakeholders

The same model answers very different questions depending on who's asking. A CIO,
a solution architect, a security officer, a project lead — each wants a different
cut of the same underlying data. The plan is to keep growing the set of views and
viewpoints (landscapes, maps, timelines, matrices, roadmaps) on top of one shared
model, rather than forcing everyone through one picture.

## From baseline to target, and out to the work

An architecture isn't a single snapshot. There's where you are today (baseline),
where you want to be (target), and the steps in between (transition states).
OpenEAM should let you define all three.

The interesting part is the gap. The difference between baseline and target is
work that needs doing, and OpenEAM should turn that gap into concrete work
packages — then let you export them to whatever project management tool you
actually run on, so the architecture plan and the delivery plan don't drift apart.

## Enterprises and linking

Everything is scoped to an enterprise — the scope of an architecture effort, from
a whole corporate group down to a household. Each modelled thing belongs to
exactly one enterprise. When two enterprises describe the same real-world thing,
they each keep their own description and the two are joined with a link, rather
than sharing one row. That keeps every enterprise's model its own while still
letting them reference each other — cross-enterprise navigation, impact analysis,
and data-exchange relationships all build on those links. (Links between
enterprises aren't built yet; the ownership rule they rest on is.)
