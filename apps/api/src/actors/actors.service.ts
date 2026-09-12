import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type {
  Actor,
  ActorInput,
  ActorInvolvement,
  ActorKind,
  CapabilityActorInput,
} from './actor.model';

type ActorRow = {
  id: string;
  enterpriseId: string;
  kind: string;
  name: string;
  description: string | null;
  organizationUnitId: string | null;
  organizationUnit: { id: string; name: string } | null;
  capabilityLinks: Array<{
    id: string;
    involvement: string;
    validFrom: string | null;
    validTo: string | null;
    capability: { id: string; name: string };
  }>;
};

const withLinks = {
  organizationUnit: true,
  capabilityLinks: { with: { capability: true } },
} as const;

@Injectable()
export class ActorsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(enterpriseId: string): Promise<Actor[]> {
    const rows = await this.db.query.actors.findMany({
      where: (t, { eq: equals }) => equals(t.enterpriseId, enterpriseId),
      orderBy: (t, { asc }) => [asc(t.name)],
      with: withLinks,
    });
    return rows.map(toActor);
  }

  async findOne(id: string): Promise<Actor | undefined> {
    const row = await this.db.query.actors.findFirst({
      where: (t, { eq: equals }) => equals(t.id, id),
      with: withLinks,
    });
    return row ? toActor(row) : undefined;
  }

  async create(input: ActorInput): Promise<Actor> {
    await this.validate(input);
    const [inserted] = await this.db
      .insert(schema.actors)
      .values({
        enterpriseId: input.enterpriseId,
        kind: input.kind,
        name: input.name,
        description: input.description ?? null,
        organizationUnitId: input.organizationUnitId ?? null,
      })
      .returning({ id: schema.actors.id });

    if (!inserted) throw new NotFoundException('Actor insert returned no row');
    const created = await this.findOne(inserted.id);
    if (!created) throw new NotFoundException(`Actor ${inserted.id} not found after creation`);
    return created;
  }

  // enterpriseId is intentionally not updatable: rows never move between
  // enterprises (see docs/VISION.md).
  async update(id: string, input: ActorInput): Promise<Actor> {
    await this.validate(input);
    const [updated] = await this.db
      .update(schema.actors)
      .set({
        kind: input.kind,
        name: input.name,
        description: input.description ?? null,
        organizationUnitId: input.organizationUnitId ?? null,
      })
      .where(eq(schema.actors.id, id))
      .returning({ id: schema.actors.id });

    if (!updated) throw new NotFoundException(`Actor ${id} not found`);
    const result = await this.findOne(id);
    if (!result) throw new NotFoundException(`Actor ${id} not found after update`);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.actors)
      .where(eq(schema.actors.id, id))
      .returning({ id: schema.actors.id });
    return Boolean(deleted);
  }

  async link(input: CapabilityActorInput): Promise<Actor> {
    const capability = await this.db.query.businessCapabilities.findFirst({
      where: (t, { eq: equals }) => equals(t.id, input.capabilityId),
    });
    if (!capability) {
      throw new BadRequestException(`Business capability ${input.capabilityId} not found`);
    }

    const actor = await this.db.query.actors.findFirst({
      where: (t, { eq: equals }) => equals(t.id, input.actorId),
    });
    if (!actor) throw new BadRequestException(`Actor ${input.actorId} not found`);

    // INV-14: a link may not straddle two enterprises. Both ids are valid on
    // their own; the pair is what is wrong.
    if (capability.enterpriseId !== actor.enterpriseId) {
      throw new BadRequestException('A capability and an actor must belong to the same enterprise');
    }

    // INV-1: half-open, so an interval that starts where it ends is empty.
    if (input.validFrom && input.validTo && input.validFrom >= input.validTo) {
      throw new BadRequestException('validFrom must be earlier than validTo');
    }

    // INV-15: one open link per pair — close the existing one before opening
    // another, the same rule as hosted_on (INV-5).
    if (!input.validTo) {
      const open = await this.db.query.capabilityActors.findFirst({
        where: (t, { and, eq: equals, isNull }) =>
          and(
            equals(t.capabilityId, input.capabilityId),
            equals(t.actorId, input.actorId),
            isNull(t.validTo),
          ),
      });
      if (open) {
        throw new BadRequestException(
          'This capability already has an open link to that actor — close it (set validTo) before adding another',
        );
      }
    }

    await this.db.insert(schema.capabilityActors).values({
      capabilityId: input.capabilityId,
      actorId: input.actorId,
      involvement: (input.involvement ?? 'performs') as ActorInvolvement,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
    });

    const result = await this.findOne(input.actorId);
    if (!result) throw new NotFoundException(`Actor ${input.actorId} not found`);
    return result;
  }

  async unlink(linkId: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.capabilityActors)
      .where(eq(schema.capabilityActors.id, linkId))
      .returning({ id: schema.capabilityActors.id });
    return Boolean(deleted);
  }

  // INV-13: organizationUnitId is meaningful only for a team, and the unit has
  // to belong to the same enterprise. A team actor pointing at the unit that
  // already models it is the whole reason the column exists — without the
  // check, teams quietly end up modelled twice under two names.
  private async validate(input: ActorInput): Promise<void> {
    if (!input.organizationUnitId) return;

    if (input.kind !== 'team') {
      throw new BadRequestException('organizationUnitId applies only to actors of kind "team"');
    }

    const unit = await this.db.query.organizationUnits.findFirst({
      where: (t, { eq: equals }) => equals(t.id, input.organizationUnitId as string),
    });
    if (!unit)
      throw new BadRequestException(`Organization unit ${input.organizationUnitId} not found`);
    if (unit.enterpriseId !== input.enterpriseId) {
      throw new BadRequestException(
        'An actor and its organization unit must belong to the same enterprise',
      );
    }
  }
}

function toActor(row: ActorRow): Actor {
  return {
    id: row.id,
    enterpriseId: row.enterpriseId,
    kind: row.kind as ActorKind,
    name: row.name,
    description: row.description,
    organizationUnitId: row.organizationUnitId,
    organizationUnitName: row.organizationUnit?.name ?? null,
    capabilities: row.capabilityLinks.map((link) => ({
      linkId: link.id,
      capabilityId: link.capability.id,
      capabilityName: link.capability.name,
      involvement: link.involvement as ActorInvolvement,
      validFrom: link.validFrom,
      validTo: link.validTo,
    })),
  };
}
