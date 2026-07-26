import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import type { MappedBuildingBlock } from '../building-blocks/building-blocks.service';
import { toBuildingBlock, withAllLinks } from '../building-blocks/building-blocks.service';
import type { BusinessProcess } from '../business-processes/business-process.model';
import { DATABASE } from '../db.module';
import type { ValueStreamStageLink } from './business-capability.model';

export interface BusinessCapabilityRow {
  id: string;
  name: string;
  description: string | null;
  businessProcesses: BusinessProcess[];
  resources: MappedBuildingBlock[];
  valueStreamStages: ValueStreamStageLink[];
}

@Injectable()
export class BusinessCapabilitiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(): Promise<BusinessCapabilityRow[]> {
    const rows = await this.db.query.businessCapabilities.findMany({
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
}

function toCapabilityRow(row: {
  id: string;
  name: string;
  description: string | null;
  businessProcesses: BusinessProcess[];
  buildingBlockLinks: Array<{ buildingBlock: Parameters<typeof toBuildingBlock>[0] }>;
  stageCapabilities: Array<{
    stage: { id: string; name: string; valueStream: { id: string; name: string } };
  }>;
}): BusinessCapabilityRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
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
