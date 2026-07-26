import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import type { MappedBuildingBlock } from '../building-blocks/building-blocks.service';
import { toBuildingBlock, withAllLinks } from '../building-blocks/building-blocks.service';
import type { BusinessProcess } from '../business-processes/business-process.model';
import { DATABASE } from '../db.module';

export interface BusinessCapabilityRow {
  id: string;
  name: string;
  description: string | null;
  businessProcesses: BusinessProcess[];
  resources: MappedBuildingBlock[];
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
}): BusinessCapabilityRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    businessProcesses: row.businessProcesses,
    resources: row.buildingBlockLinks.map((link) => toBuildingBlock(link.buildingBlock)),
  };
}
