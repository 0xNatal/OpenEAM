import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import type { MappedBuildingBlock } from '../building-blocks/building-blocks.service';
import { toBuildingBlock, withAllLinks } from '../building-blocks/building-blocks.service';
import type { BusinessProcess } from '../business-processes/business-process.model';
import { DATABASE } from '../db.module';
import type { BusinessCapabilityInput, ValueStreamStageLink } from './business-capability.model';

export interface BusinessCapabilityRow {
  id: string;
  enterpriseId: string;
  name: string;
  description: string | null;
  direction: string | null;
  businessProcesses: BusinessProcess[];
  resources: MappedBuildingBlock[];
  valueStreamStages: ValueStreamStageLink[];
}

@Injectable()
export class BusinessCapabilitiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(enterpriseId: string): Promise<BusinessCapabilityRow[]> {
    const rows = await this.db.query.businessCapabilities.findMany({
      where: (t, { eq }) => eq(t.enterpriseId, enterpriseId),
      with: {
        businessProcesses: {
          with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
        buildingBlockLinks: { with: { buildingBlock: { with: withAllLinks } } },
        stageCapabilities: { with: { stage: { with: { valueStream: true } } } },
      },
    });
    return rows.map(toCapabilityRow);
  }

  async findOne(id: string): Promise<BusinessCapabilityRow | undefined> {
    const row = await this.db.query.businessCapabilities.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        businessProcesses: {
          with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
        buildingBlockLinks: { with: { buildingBlock: { with: withAllLinks } } },
        stageCapabilities: { with: { stage: { with: { valueStream: true } } } },
      },
    });
    return row ? toCapabilityRow(row) : undefined;
  }

  async create(input: BusinessCapabilityInput): Promise<BusinessCapabilityRow> {
    const [inserted] = await this.db
      .insert(schema.businessCapabilities)
      .values({
        enterpriseId: input.enterpriseId,
        name: input.name,
        description: input.description ?? null,
        direction: input.direction ?? null,
      })
      .returning({ id: schema.businessCapabilities.id });

    if (!inserted) throw new NotFoundException('Business capability insert returned no row');
    const created = await this.findOne(inserted.id);
    if (!created) {
      throw new NotFoundException(`Business capability ${inserted.id} not found after creation`);
    }
    return created;
  }

  // enterpriseId is intentionally not updatable: entities never move between
  // enterprises (see docs/VISION.md — models are owned by exactly one scope).
  async update(id: string, input: BusinessCapabilityInput): Promise<BusinessCapabilityRow> {
    const [updated] = await this.db
      .update(schema.businessCapabilities)
      .set({
        name: input.name,
        description: input.description ?? null,
        direction: input.direction ?? null,
      })
      .where(eq(schema.businessCapabilities.id, id))
      .returning({ id: schema.businessCapabilities.id });

    if (!updated) throw new NotFoundException(`Business capability ${id} not found`);
    const result = await this.findOne(id);
    if (!result) {
      throw new NotFoundException(`Business capability ${id} not found after update`);
    }
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.businessCapabilities)
      .where(eq(schema.businessCapabilities.id, id))
      .returning({ id: schema.businessCapabilities.id });
    return Boolean(deleted);
  }
}

function toCapabilityRow(row: {
  id: string;
  enterpriseId: string;
  name: string;
  description: string | null;
  direction: string | null;
  businessProcesses: BusinessProcess[];
  buildingBlockLinks: Array<{ buildingBlock: Parameters<typeof toBuildingBlock>[0] }>;
  stageCapabilities: Array<{
    stage: { id: string; name: string; valueStream: { id: string; name: string } };
  }>;
}): BusinessCapabilityRow {
  return {
    id: row.id,
    enterpriseId: row.enterpriseId,
    name: row.name,
    description: row.description,
    direction: row.direction,
    businessProcesses: row.businessProcesses,
    resources: row.buildingBlockLinks.map((link) => toBuildingBlock(link.buildingBlock)),
    valueStreamStages: row.stageCapabilities.map((sc) => ({
      valueStreamId: sc.stage.valueStream.id,
      valueStreamName: sc.stage.valueStream.name,
      stageId: sc.stage.id,
      stageName: sc.stage.name,
    })),
  };
}
