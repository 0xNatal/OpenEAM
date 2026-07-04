import { timestamp } from 'drizzle-orm/pg-core';

// Shared record-metadata columns ("recency" in TOGAF terms). Kept as strings
// so JSON export/import round-trips them without Date conversion.
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
};
