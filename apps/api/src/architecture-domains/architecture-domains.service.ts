import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { ArchitectureDomain } from './architecture-domain.model';

@Injectable()
export class ArchitectureDomainsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll(): Promise<ArchitectureDomain[]> {
    return this.db.query.architectureDomains.findMany({
      orderBy: (t, { asc }) => [asc(t.name)],
    });
  }

  findOne(id: string): Promise<ArchitectureDomain | undefined> {
    return this.db.query.architectureDomains.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    });
  }
}
