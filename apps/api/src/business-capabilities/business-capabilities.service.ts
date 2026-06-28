import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import type { BusinessProcess } from '../business-processes/business-process.model';
import { DATABASE } from '../db.module';

export interface BusinessCapabilityRow {
  id: string;
  name: string;
  description: string | null;
  businessProcesses: BusinessProcess[];
}

@Injectable()
export class BusinessCapabilitiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll(): Promise<BusinessCapabilityRow[]> {
    return this.db.query.businessCapabilities.findMany({
      with: {
        businessProcesses: {
          with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
      },
    });
  }

  findOne(id: string): Promise<BusinessCapabilityRow | undefined> {
    return this.db.query.businessCapabilities.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        businessProcesses: {
          with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
      },
    });
  }
}
