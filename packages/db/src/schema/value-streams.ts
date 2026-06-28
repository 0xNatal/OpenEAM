import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { businessCapabilities } from './business-capabilities';

export const valueStreams = pgTable('value_streams', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
});

export const valueStreamStages = pgTable(
  'value_stream_stages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    valueStreamId: text('value_stream_id')
      .notNull()
      .references(() => valueStreams.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull(),
  },
  (t) => [index('value_stream_stages_value_stream_id_idx').on(t.valueStreamId)],
);

export const stageCapabilities = pgTable(
  'stage_capabilities',
  {
    stageId: text('stage_id')
      .notNull()
      .references(() => valueStreamStages.id, { onDelete: 'cascade' }),
    capabilityId: text('capability_id')
      .notNull()
      .references(() => businessCapabilities.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.stageId, t.capabilityId] }),
    index('stage_capabilities_capability_id_idx').on(t.capabilityId),
  ],
);

export const valueStreamsRelations = relations(valueStreams, ({ many }) => ({
  stages: many(valueStreamStages),
}));

export const valueStreamStagesRelations = relations(valueStreamStages, ({ one, many }) => ({
  valueStream: one(valueStreams, {
    fields: [valueStreamStages.valueStreamId],
    references: [valueStreams.id],
  }),
  stageCapabilities: many(stageCapabilities),
}));

export const stageCapabilitiesRelations = relations(stageCapabilities, ({ one }) => ({
  stage: one(valueStreamStages, {
    fields: [stageCapabilities.stageId],
    references: [valueStreamStages.id],
  }),
  capability: one(businessCapabilities, {
    fields: [stageCapabilities.capabilityId],
    references: [businessCapabilities.id],
  }),
}));
