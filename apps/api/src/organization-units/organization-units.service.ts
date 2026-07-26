import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { OrganizationUnit } from './organization-unit.model';

@Injectable()
export class OrganizationUnitsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // Returns the flat list; clients rebuild the tree from parentId.
  findAll(enterpriseId: string): Promise<OrganizationUnit[]> {
    return this.db.query.organizationUnits.findMany({
      where: (t, { eq }) => eq(t.enterpriseId, enterpriseId),
      orderBy: (t, { asc }) => [asc(t.name)],
    });
  }

  findOne(id: string): Promise<OrganizationUnit | undefined> {
    return this.db.query.organizationUnits.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    });
  }
}
