import { randomUUID } from 'node:crypto';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from './helpers';

// The scope of an architecture effort: one or more organizations (or parts of
// them) pursuing a shared goal — a corporate group, a cross-company
// collaboration, a household. Every modeled entity belongs to exactly one
// enterprise; overlap between enterprises is expressed with correspondence
// links between their models, never by sharing rows (see docs/VISION.md).
export const enterprises = pgTable('enterprises', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  // The shared goal that defines the scope — part of the definition of an
  // enterprise, not documentation.
  goal: text('goal'),
  ...timestamps,
});
