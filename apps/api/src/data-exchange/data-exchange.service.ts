// Per-enterprise export/import for moving enterprise models between OpenEAM
// instances or restoring local dev data. A bundle carries one or more
// enterprises and everything modeled within them; import replaces exactly
// those enterprises (delete cascades from the enterprises table wipe their
// rows) and leaves every other enterprise untouched.
import { Inject, Injectable } from '@nestjs/common';
import { type Database, inArray, schema } from '@openeam/db';
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

  // Without enterpriseId: a full backup of every enterprise. With it: just
  // that enterprise's model.
  async export(enterpriseId?: string): Promise<DataBundle> {
    const enterpriseFilter = <T extends { enterpriseId: string }>(rows: T[]): T[] =>
      enterpriseId ? rows.filter((r) => r.enterpriseId === enterpriseId) : rows;

    const [
      enterprises,
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
      this.db.select().from(schema.enterprises),
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

    // Child/link rows have no enterpriseId of their own; they follow their
    // parents' membership.
    const scopedCapabilities = enterpriseFilter(businessCapabilities);
    const scopedProcesses = enterpriseFilter(businessProcesses);
    const scopedValueStreams = enterpriseFilter(valueStreams);
    const scopedBuildingBlocks = enterpriseFilter(buildingBlocks);
    const capabilityIds = new Set(scopedCapabilities.map((c) => c.id));
    const processIds = new Set(scopedProcesses.map((p) => p.id));
    const valueStreamIds = new Set(scopedValueStreams.map((v) => v.id));
    const scopedStages = valueStreamStages.filter((s) => valueStreamIds.has(s.valueStreamId));
    const stageIds = new Set(scopedStages.map((s) => s.id));
    const buildingBlockIds = new Set(scopedBuildingBlocks.map((b) => b.id));

    return {
      enterprises: enterpriseId ? enterprises.filter((e) => e.id === enterpriseId) : enterprises,
      businessCapabilities: scopedCapabilities,
      businessProcesses: scopedProcesses,
      processSteps: processSteps.filter((s) => processIds.has(s.processId)),
      valueStreams: scopedValueStreams,
      valueStreamStages: scopedStages,
      stageCapabilities: stageCapabilities.filter(
        (sc) => stageIds.has(sc.stageId) && capabilityIds.has(sc.capabilityId),
      ),
      architectureDomains: enterpriseFilter(architectureDomains),
      organizationUnits: enterpriseFilter(organizationUnits),
      buildingBlocks: scopedBuildingBlocks,
      buildingBlockArchitectureDomains: buildingBlockArchitectureDomains.filter((l) =>
        buildingBlockIds.has(l.buildingBlockId),
      ),
      buildingBlockOrganizationUnits: buildingBlockOrganizationUnits.filter((l) =>
        buildingBlockIds.has(l.buildingBlockId),
      ),
      buildingBlockRealizations: buildingBlockRealizations.filter(
        (l) =>
          buildingBlockIds.has(l.architectureBuildingBlockId) &&
          buildingBlockIds.has(l.solutionBuildingBlockId),
      ),
      buildingBlockCapabilities: buildingBlockCapabilities.filter(
        (l) => buildingBlockIds.has(l.buildingBlockId) && capabilityIds.has(l.capabilityId),
      ),
    };
  }

  async import(bundle: DataBundle): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Replace the bundle's enterprises: deleting them cascades to every
      // row modeled within them, leaving other enterprises untouched.
      const enterpriseIds = bundle.enterprises.map((e) => e.id);
      if (enterpriseIds.length > 0) {
        await tx.delete(schema.enterprises).where(inArray(schema.enterprises.id, enterpriseIds));
        await tx.insert(schema.enterprises).values(bundle.enterprises);
      }

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
