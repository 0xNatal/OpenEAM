import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { type AnyPgColumn, index, pgTable, text } from 'drizzle-orm/pg-core';
import { buildingBlockOrganizationUnits } from './building-blocks';
import { timestamps } from './helpers';

// The "breadth" dimension of the landscape: a hierarchical tree of
// organization units (enterprise > division > department > ...).
export const organizationUnits = pgTable(
  'organization_units',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    parentId: text('parent_id').references((): AnyPgColumn => organizationUnits.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (t) => [index('organization_units_parent_id_idx').on(t.parentId)],
);

export const organizationUnitsRelations = relations(organizationUnits, ({ one, many }) => ({
  parent: one(organizationUnits, {
    fields: [organizationUnits.parentId],
    references: [organizationUnits.id],
    relationName: 'organizationUnitHierarchy',
  }),
  children: many(organizationUnits, { relationName: 'organizationUnitHierarchy' }),
  buildingBlockOrganizationUnits: many(buildingBlockOrganizationUnits),
}));
