// Full-bundle export/import for moving the whole entity model between
// OpenEAM instances or restoring local dev data. Import replaces all existing
// rows in these tables — it is not a merge.
import { Inject, Injectable } from '@nestjs/common';
import { type Database, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { DataBundle } from './data-bundle.schema';

// Orders rows of a self-referencing table so parents precede children,
// satisfying the FK on insert. Rows with dangling or cyclic parent
// references are appended last so the database reports them as FK errors
// instead of this silently looping.
function parentsFirst<T extends { id: string; parentId: string | null }>(rows: T[]): T[] {
  const sorted: T[] = [];
  const emitted = new Set<string>();
  let remaining = rows;
  while (remaining.length > 0) {
    const ready = remaining.filter((r) => r.parentId === null || emitted.has(r.parentId));
    if (ready.length === 0) break;
    for (const row of ready) {
      sorted.push(row);
      emitted.add(row.id);
    }
    remaining = remaining.filter((r) => !emitted.has(r.id));
  }
  return [...sorted, ...remaining];
}

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
      architectureDomains,
      organizationUnits,
      buildingBlocks,
      buildingBlockArchitectureDomains,
      buildingBlockOrganizationUnits,
      buildingBlockRealizations,
      buildingBlockCapabilities,
    ] = await Promise.all([
      this.db.select().from(schema.businessCapabilities),
      this.db.select().from(schema.businessProcesses),
      this.db.select().from(schema.processSteps),
      this.db.select().from(schema.valueStreams),
      this.db.select().from(schema.valueStreamStages),
      this.db.select().from(schema.stageCapabilities),
      this.db.select().from(schema.architectureDomains),
      this.db.select().from(schema.organizationUnits),
      this.db.select().from(schema.buildingBlocks),
      this.db.select().from(schema.buildingBlockArchitectureDomains),
      this.db.select().from(schema.buildingBlockOrganizationUnits),
      this.db.select().from(schema.buildingBlockRealizations),
      this.db.select().from(schema.buildingBlockCapabilities),
    ]);

    return {
      businessCapabilities,
      businessProcesses,
      processSteps,
      valueStreams,
      valueStreamStages,
      stageCapabilities,
      architectureDomains,
      organizationUnits,
      buildingBlocks,
      buildingBlockArchitectureDomains,
      buildingBlockOrganizationUnits,
      buildingBlockRealizations,
      buildingBlockCapabilities,
    };
  }

  async import(bundle: DataBundle): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Delete child-to-parent to satisfy FK constraints.
      await tx.delete(schema.buildingBlockCapabilities);
      await tx.delete(schema.buildingBlockRealizations);
      await tx.delete(schema.buildingBlockOrganizationUnits);
      await tx.delete(schema.buildingBlockArchitectureDomains);
      await tx.delete(schema.buildingBlocks);
      await tx.delete(schema.organizationUnits);
      await tx.delete(schema.architectureDomains);
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
      if (bundle.architectureDomains.length > 0) {
        await tx.insert(schema.architectureDomains).values(bundle.architectureDomains);
      }
      if (bundle.organizationUnits.length > 0) {
        await tx.insert(schema.organizationUnits).values(parentsFirst(bundle.organizationUnits));
      }
      if (bundle.buildingBlocks.length > 0) {
        await tx.insert(schema.buildingBlocks).values(bundle.buildingBlocks);
      }
      if (bundle.buildingBlockArchitectureDomains.length > 0) {
        await tx
          .insert(schema.buildingBlockArchitectureDomains)
          .values(bundle.buildingBlockArchitectureDomains);
      }
      if (bundle.buildingBlockOrganizationUnits.length > 0) {
        await tx
          .insert(schema.buildingBlockOrganizationUnits)
          .values(bundle.buildingBlockOrganizationUnits);
      }
      if (bundle.buildingBlockRealizations.length > 0) {
        await tx.insert(schema.buildingBlockRealizations).values(bundle.buildingBlockRealizations);
      }
      if (bundle.buildingBlockCapabilities.length > 0) {
        await tx.insert(schema.buildingBlockCapabilities).values(bundle.buildingBlockCapabilities);
      }
    });
  }
}
