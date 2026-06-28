import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { BusinessProcess } from './business-process.model';

@Injectable()
export class BusinessProcessesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll(): Promise<BusinessProcess[]> {
    return this.db.query.businessProcesses.findMany({
      with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
    });
  }

  findOne(id: string): Promise<BusinessProcess | undefined> {
    return this.db.query.businessProcesses.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
    });
  }
}
