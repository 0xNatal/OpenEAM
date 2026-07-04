import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { businessCapabilities } from './business-capabilities';
import { timestamps } from './helpers';

export const businessProcesses = pgTable(
  'business_processes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    capabilityId: text('capability_id')
      .notNull()
      .references(() => businessCapabilities.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    triggerEvent: text('trigger_event'),
    outcome: text('outcome'),
    ...timestamps,
  },
  (t) => [index('business_processes_capability_id_idx').on(t.capabilityId)],
);

export const processSteps = pgTable(
  'process_steps',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    processId: text('process_id')
      .notNull()
      .references(() => businessProcesses.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    ...timestamps,
  },
  (t) => [index('process_steps_process_id_idx').on(t.processId)],
);

export const businessProcessesRelations = relations(businessProcesses, ({ one, many }) => ({
  capability: one(businessCapabilities, {
    fields: [businessProcesses.capabilityId],
    references: [businessCapabilities.id],
  }),
  steps: many(processSteps),
}));

export const processStepsRelations = relations(processSteps, ({ one }) => ({
  process: one(businessProcesses, {
    fields: [processSteps.processId],
    references: [businessProcesses.id],
  }),
}));
