import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type {
  CapabilityInformationInput,
  InformationObject,
  InformationUsage,
} from './information-object.model';

type InformationObjectRow = {
  id: string;
  enterpriseId: string;
  name: string;
  description: string | null;
  capabilityLinks: Array<{
    id: string;
    usage: string;
    validFrom: string | null;
    validTo: string | null;
    capability: { id: string; name: string };
  }>;
};

@Injectable()
export class InformationObjectsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(enterpriseId: string): Promise<InformationObject[]> {
    const rows = await this.db.query.informationObjects.findMany({
      where: (t, { eq: equals }) => equals(t.enterpriseId, enterpriseId),
      orderBy: (t, { asc }) => [asc(t.name)],
      with: { capabilityLinks: { with: { capability: true } } },
    });
    return rows.map(toInformationObject);
  }

  async findOne(id: string): Promise<InformationObject | undefined> {
    const row = await this.db.query.informationObjects.findFirst({
      where: (t, { eq: equals }) => equals(t.id, id),
      with: { capabilityLinks: { with: { capability: true } } },
    });
    return row ? toInformationObject(row) : undefined;
  }

  async create(input: InformationObjectInputShape): Promise<InformationObject> {
    const [inserted] = await this.db
      .insert(schema.informationObjects)
      .values({
        enterpriseId: input.enterpriseId,
        name: input.name,
        description: input.description ?? null,
      })
      .returning({ id: schema.informationObjects.id });

    if (!inserted) throw new NotFoundException('Information object insert returned no row');
    const created = await this.findOne(inserted.id);
    if (!created) {
      throw new NotFoundException(`Information object ${inserted.id} not found after creation`);
    }
    return created;
  }

  // enterpriseId is intentionally not updatable, same as every other entity:
  // rows never move between enterprises (see docs/VISION.md).
  async update(id: string, input: InformationObjectInputShape): Promise<InformationObject> {
    const [updated] = await this.db
      .update(schema.informationObjects)
      .set({ name: input.name, description: input.description ?? null })
      .where(eq(schema.informationObjects.id, id))
      .returning({ id: schema.informationObjects.id });

    if (!updated) throw new NotFoundException(`Information object ${id} not found`);
    const result = await this.findOne(id);
    if (!result) throw new NotFoundException(`Information object ${id} not found after update`);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.informationObjects)
      .where(eq(schema.informationObjects.id, id))
      .returning({ id: schema.informationObjects.id });
    return Boolean(deleted);
  }

  async link(input: CapabilityInformationInput): Promise<InformationObject> {
    const capability = await this.db.query.businessCapabilities.findFirst({
      where: (t, { eq: equals }) => equals(t.id, input.capabilityId),
    });
    if (!capability) {
      throw new BadRequestException(`Business capability ${input.capabilityId} not found`);
    }

    const object = await this.db.query.informationObjects.findFirst({
      where: (t, { eq: equals }) => equals(t.id, input.informationObjectId),
    });
    if (!object) {
      throw new BadRequestException(`Information object ${input.informationObjectId} not found`);
    }

    // INV-9: a link may not straddle two enterprises. Nothing else enforces
    // this — both ids are valid on their own, and the pair is what is wrong.
    if (capability.enterpriseId !== object.enterpriseId) {
      throw new BadRequestException(
        'A capability and an information object must belong to the same enterprise',
      );
    }

    // INV-1: half-open, so an interval that starts where it ends is empty.
    if (input.validFrom && input.validTo && input.validFrom >= input.validTo) {
      throw new BadRequestException('validFrom must be earlier than validTo');
    }

    // Same rule as hosted_on (INV-5): one *open* link per pair and usage.
    // Closing the existing one (setting validTo) before opening another is the
    // caller's job, exactly as it is for every temporal link in this schema.
    if (!input.validTo) {
      const open = await this.db.query.capabilityInformation.findFirst({
        where: (t, { and, eq: equals, isNull }) =>
          and(
            equals(t.capabilityId, input.capabilityId),
            equals(t.informationObjectId, input.informationObjectId),
            isNull(t.validTo),
          ),
      });
      if (open) {
        throw new BadRequestException(
          'This capability already has an open link to that information object — close it (set validTo) before adding another',
        );
      }
    }

    await this.db.insert(schema.capabilityInformation).values({
      capabilityId: input.capabilityId,
      informationObjectId: input.informationObjectId,
      usage: (input.usage ?? 'uses') as InformationUsage,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
    });

    const result = await this.findOne(input.informationObjectId);
    if (!result) {
      throw new NotFoundException(`Information object ${input.informationObjectId} not found`);
    }
    return result;
  }

  async unlink(linkId: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.capabilityInformation)
      .where(eq(schema.capabilityInformation.id, linkId))
      .returning({ id: schema.capabilityInformation.id });
    return Boolean(deleted);
  }
}

type InformationObjectInputShape = {
  enterpriseId: string;
  name: string;
  description?: string | null;
};

function toInformationObject(row: InformationObjectRow): InformationObject {
  return {
    id: row.id,
    enterpriseId: row.enterpriseId,
    name: row.name,
    description: row.description,
    capabilities: row.capabilityLinks.map((link) => ({
      linkId: link.id,
      capabilityId: link.capability.id,
      capabilityName: link.capability.name,
      usage: link.usage as InformationUsage,
      validFrom: link.validFrom,
      validTo: link.validTo,
    })),
  };
}
