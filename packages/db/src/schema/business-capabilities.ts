import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { buildingBlockCapabilities } from './building-blocks';
import { businessProcesses } from './business-processes';
import { enterprises } from './enterprises';
import { timestamps } from './helpers';
import { stageCapabilities } from './value-streams';

// The strategic-architecture "framework for change activity" TOGAF talks
// about: where investment goes, where it deliberately doesn't. Nullable —
// most capabilities won't carry a direction until someone at that altitude
// sets one; a null one just hasn't been decided yet, not "sustain" by default.
export const capabilityDirection = pgEnum('capability_direction', [
  'invest',
  'sustain',
  'commodity',
  'sunset',
]);

export const businessCapabilities = pgTable(
  'business_capabilities',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    enterpriseId: text('enterprise_id')
      .notNull()
      .references(() => enterprises.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    direction: capabilityDirection('direction'),
    ...timestamps,
  },
  (t) => [index('business_capabilities_enterprise_id_idx').on(t.enterpriseId)],
);

export const businessCapabilitiesRelations = relations(businessCapabilities, ({ many }) => ({
  businessProcesses: many(businessProcesses),
  stageCapabilities: many(stageCapabilities),
  buildingBlockLinks: many(buildingBlockCapabilities),
}));
