import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { buildingBlockArchitectureDomains } from './building-blocks';
import { timestamps } from './helpers';

// Architecture domains are data, not an enum: the four TOGAF BDAT domains are
// seeded as defaults (isDefault = true), and organizations can add their own
// (e.g. security architecture, integration architecture).
export const architectureDomains = pgTable('architecture_domains', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  ...timestamps,
});

export const architectureDomainsRelations = relations(architectureDomains, ({ many }) => ({
  buildingBlockArchitectureDomains: many(buildingBlockArchitectureDomains),
}));
