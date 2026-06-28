// Full-bundle export/import for moving the whole entity model between
// OpenEAM instances or restoring local dev data. Import replaces all existing
// rows in these tables — it is not a merge.
import { Inject, Injectable } from '@nestjs/common';
import { type Database, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { DataBundle } from './data-bundle.schema';

@Injectable()
export class DataExchangeService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async export(): Promise<DataBundle> {
    const [
      businessCapabilities,
      businessProcesses,
      processSteps,
      valueStreams,
      valueStreamStages,
      stageCapabilities,
    ] = await Promise.all([
      this.db.select().from(schema.businessCapabilities),
      this.db.select().from(schema.businessProcesses),
      this.db.select().from(schema.processSteps),
      this.db.select().from(schema.valueStreams),
      this.db.select().from(schema.valueStreamStages),
      this.db.select().from(schema.stageCapabilities),
    ]);

    return {
      businessCapabilities,
      businessProcesses,
      processSteps,
      valueStreams,
      valueStreamStages,
      stageCapabilities,
    };
  }

  async import(bundle: DataBundle): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Delete child-to-parent to satisfy FK constraints.
      await tx.delete(schema.stageCapabilities);
      await tx.delete(schema.processSteps);
      await tx.delete(schema.valueStreamStages);
      await tx.delete(schema.businessProcesses);
      await tx.delete(schema.valueStreams);
      await tx.delete(schema.businessCapabilities);

      // Insert parent-to-child.
      if (bundle.businessCapabilities.length > 0) {
        await tx.insert(schema.businessCapabilities).values(bundle.businessCapabilities);
      }
      if (bundle.valueStreams.length > 0) {
        await tx.insert(schema.valueStreams).values(bundle.valueStreams);
      }
      if (bundle.businessProcesses.length > 0) {
        await tx.insert(schema.businessProcesses).values(bundle.businessProcesses);
      }
      if (bundle.valueStreamStages.length > 0) {
        await tx.insert(schema.valueStreamStages).values(bundle.valueStreamStages);
      }
      if (bundle.processSteps.length > 0) {
        await tx.insert(schema.processSteps).values(bundle.processSteps);
      }
      if (bundle.stageCapabilities.length > 0) {
        await tx.insert(schema.stageCapabilities).values(bundle.stageCapabilities);
      }
    });
  }
}
