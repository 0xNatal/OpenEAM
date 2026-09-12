import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { date, index, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { businessCapabilities } from './business-capabilities';
import { enterprises } from './enterprises';
import { timestamps } from './helpers';
import { organizationUnits } from './organization-units';

// What kind of thing is involved. The capability page's People quadrant
// promises "actors, stakeholders, business units or partners", which is
// broader than named humans — and deliberately so: accountability usually
// sits with a position or a team, and positions outlive the people in them.
export const actorKind = pgEnum('actor_kind', ['role', 'team', 'individual', 'external']);

// In what capacity an actor is involved in a capability. Three values rather
// than RACI: "informed" is noise in a model nobody updates, and the useful
// split is between who answers for the capability and who does the work.
// Small on purpose, like every other taxonomy here (see docs/DECISIONS.md D-3).
export const actorInvolvement = pgEnum('actor_involvement', [
  'accountable',
  'performs',
  'consulted',
]);

// An actor: a position, a team, a named individual, or a party outside the
// enterprise. `organizationUnitId` exists so a team actor points at the
// organization unit that already models it rather than duplicating its name;
// it is meaningful only for kind = 'team', enforced in the service layer.
export const actors = pgTable(
  'actors',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    enterpriseId: text('enterprise_id')
      .notNull()
      .references(() => enterprises.id, { onDelete: 'cascade' }),
    kind: actorKind('kind').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    organizationUnitId: text('organization_unit_id').references(() => organizationUnits.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (t) => [
    index('actors_enterprise_id_idx').on(t.enterpriseId),
    index('actors_organization_unit_id_idx').on(t.organizationUnitId),
  ],
);

// Temporal, like every other link from a capability: who answers for a
// capability changes, and closing the old row rather than updating it is what
// keeps "who owned this in 2024" answerable.
export const capabilityActors = pgTable(
  'capability_actors',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    capabilityId: text('capability_id')
      .notNull()
      .references(() => businessCapabilities.id, { onDelete: 'cascade' }),
    actorId: text('actor_id')
      .notNull()
      .references(() => actors.id, { onDelete: 'cascade' }),
    involvement: actorInvolvement('involvement').notNull().default('performs'),
    validFrom: date('valid_from'),
    validTo: date('valid_to'),
    ...timestamps,
  },
  (t) => [
    index('capability_actors_capability_id_idx').on(t.capabilityId),
    index('capability_actors_actor_id_idx').on(t.actorId),
  ],
);

export const actorsRelations = relations(actors, ({ one, many }) => ({
  organizationUnit: one(organizationUnits, {
    fields: [actors.organizationUnitId],
    references: [organizationUnits.id],
  }),
  capabilityLinks: many(capabilityActors),
}));

export const capabilityActorsRelations = relations(capabilityActors, ({ one }) => ({
  capability: one(businessCapabilities, {
    fields: [capabilityActors.capabilityId],
    references: [businessCapabilities.id],
  }),
  actor: one(actors, {
    fields: [capabilityActors.actorId],
    references: [actors.id],
  }),
}));
