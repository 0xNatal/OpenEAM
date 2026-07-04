import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { buildingBlockCapabilities } from './building-blocks';
import { businessProcesses } from './business-processes';
import { timestamps } from './helpers';
import { stageCapabilities } from './value-streams';

export const businessCapabilities = pgTable('business_capabilities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  ...timestamps,
});

export const businessCapabilitiesRelations = relations(businessCapabilities, ({ many }) => ({
  businessProcesses: many(businessProcesses),
  stageCapabilities: many(stageCapabilities),
  buildingBlockLinks: many(buildingBlockCapabilities),
}));
