import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { Enterprise, EnterpriseInput } from './enterprise.model';

// The four TOGAF BDAT domains, seeded into every new enterprise so building
// blocks always have domains to be classified into.
const DEFAULT_DOMAINS = [
  {
    name: 'Business Architecture',
    description: 'Business strategy, governance, organization, and key business processes.',
  },
  {
    name: 'Data Architecture',
    description: 'Structure of logical and physical data assets and data management resources.',
  },
  {
    name: 'Application Architecture',
    description:
      'Individual applications, their interactions, and their relationships to business processes.',
  },
  {
    name: 'Technology Architecture',
    description:
      'Software and hardware capabilities required to support business, data, and application services.',
  },
];

@Injectable()
export class EnterprisesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll(): Promise<Enterprise[]> {
    return this.db.query.enterprises.findMany({ orderBy: (t, { asc }) => [asc(t.name)] });
  }

  findOne(id: string): Promise<Enterprise | undefined> {
    return this.db.query.enterprises.findFirst({ where: (t, { eq }) => eq(t.id, id) });
  }

  async create(input: EnterpriseInput): Promise<Enterprise> {
    return this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(schema.enterprises)
        .values({
          name: input.name,
          description: input.description ?? null,
          goal: input.goal ?? null,
          avatarBgColor: input.avatarBgColor ?? null,
          avatarTextColor: input.avatarTextColor ?? null,
        })
        .returning();

      if (!inserted) throw new NotFoundException('Enterprise insert returned no row');

      await tx.insert(schema.architectureDomains).values(
        DEFAULT_DOMAINS.map((domain) => ({
          enterpriseId: inserted.id,
          name: domain.name,
          description: domain.description,
          isDefault: true,
        })),
      );

      return inserted;
    });
  }

  async update(id: string, input: EnterpriseInput): Promise<Enterprise> {
    const [updated] = await this.db
      .update(schema.enterprises)
      .set({
        name: input.name,
        description: input.description ?? null,
        goal: input.goal ?? null,
        avatarBgColor: input.avatarBgColor ?? null,
        avatarTextColor: input.avatarTextColor ?? null,
      })
      .where(eq(schema.enterprises.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Enterprise ${id} not found`);
    return updated;
  }

  // Deleting an enterprise cascades to every entity modeled within it.
  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.enterprises)
      .where(eq(schema.enterprises.id, id))
      .returning({ id: schema.enterprises.id });
    return Boolean(deleted);
  }
}
