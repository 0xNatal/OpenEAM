import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database, Transaction } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type {
  ArchitectureBuildingBlock,
  ArchitectureLevel,
  BuildingBlockInput,
  BuildingBlockRelationship,
  BuildingBlockRelationshipInput,
  LifecyclePhase,
  SolutionBuildingBlock,
} from './building-block.model';

// The viewpoint the user chose: depth (level), breadth (organization unit),
// architecture domain, and time (asOf, an ISO date). A landscape is the set
// of building blocks visible from that viewpoint — not an entity of its own.
export interface LandscapeFilter {
  enterpriseId: string;
  asOf?: string;
  architectureLevel?: ArchitectureLevel;
  architectureDomainId?: string;
  organizationUnitId?: string;
}

interface TemporalRow {
  validFrom: string | null;
  validTo: string | null;
}

interface BuildingBlockRow extends TemporalRow {
  id: string;
  enterpriseId: string;
  kind: 'architecture' | 'solution';
  name: string;
  description: string | null;
  architectureLevel: 'strategic' | 'segment' | 'capability' | null;
  lifecyclePhase: 'planned' | 'active' | 'phasing_out' | 'retired';
  architectureDomainLinks: Array<{ architectureDomainId: string }>;
  organizationUnitLinks: Array<TemporalRow & { organizationUnitId: string }>;
  capabilityLinks: Array<TemporalRow & { capabilityId: string }>;
  realizedBy: Array<
    TemporalRow & { architectureBuildingBlockId: string; solutionBuildingBlockId: string }
  >;
  realizes: Array<
    TemporalRow & { architectureBuildingBlockId: string; solutionBuildingBlockId: string }
  >;
  outgoingRelationships: Array<
    TemporalRow & {
      id: string;
      sourceBuildingBlockId: string;
      targetBuildingBlockId: string;
      type: 'depends_on' | 'data_flow';
      description: string | null;
    }
  >;
  incomingRelationships: Array<
    TemporalRow & {
      id: string;
      sourceBuildingBlockId: string;
      targetBuildingBlockId: string;
      type: 'depends_on' | 'data_flow';
      description: string | null;
    }
  >;
}

// ISO dates (YYYY-MM-DD) compare correctly as strings. Half-open interval:
// validFrom inclusive, validTo exclusive; null means unbounded on that side.
function isValidAt(row: TemporalRow, asOf: string): boolean {
  return (
    (row.validFrom === null || row.validFrom <= asOf) &&
    (row.validTo === null || row.validTo > asOf)
  );
}

// The GraphQL layer resolves the concrete type from `kind` (see
// building-block.model.ts), so mapped objects keep it even though it is not
// itself a GraphQL field.
export type MappedBuildingBlock = (ArchitectureBuildingBlock | SolutionBuildingBlock) & {
  kind: 'architecture' | 'solution';
};

export function toBuildingBlock(row: BuildingBlockRow, asOf?: string): MappedBuildingBlock {
  const linkFilter = asOf ? (link: TemporalRow) => isValidAt(link, asOf) : () => true;
  return {
    kind: row.kind,
    id: row.id,
    enterpriseId: row.enterpriseId,
    name: row.name,
    description: row.description,
    architectureLevel: row.architectureLevel as ArchitectureLevel | null,
    lifecyclePhase: row.lifecyclePhase as LifecyclePhase,
    validFrom: row.validFrom,
    validTo: row.validTo,
    architectureDomainIds: row.architectureDomainLinks.map((l) => l.architectureDomainId),
    organizationUnitLinks: row.organizationUnitLinks.filter(linkFilter),
    capabilityLinks: row.capabilityLinks.filter(linkFilter),
    realizedBy: row.realizedBy.filter(linkFilter),
    realizes: row.realizes.filter(linkFilter),
    outgoingRelationships: row.outgoingRelationships.filter(
      linkFilter,
    ) as BuildingBlockRelationship[],
    incomingRelationships: row.incomingRelationships.filter(
      linkFilter,
    ) as BuildingBlockRelationship[],
  };
}

export const withAllLinks = {
  architectureDomainLinks: true,
  organizationUnitLinks: true,
  capabilityLinks: true,
  realizedBy: true,
  realizes: true,
  outgoingRelationships: true,
  incomingRelationships: true,
} as const;

@Injectable()
export class BuildingBlocksService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(enterpriseId: string): Promise<MappedBuildingBlock[]> {
    const rows = await this.db.query.buildingBlocks.findMany({
      where: (t, { eq }) => eq(t.enterpriseId, enterpriseId),
      with: withAllLinks,
      orderBy: (t, { asc }) => [asc(t.name)],
    });
    return rows.map((row) => toBuildingBlock(row));
  }

  async findOne(id: string): Promise<MappedBuildingBlock | undefined> {
    const row = await this.db.query.buildingBlocks.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: withAllLinks,
    });
    return row ? toBuildingBlock(row) : undefined;
  }

  async create(input: BuildingBlockInput): Promise<MappedBuildingBlock> {
    this.validateInput(input);

    const id = await this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(schema.buildingBlocks)
        .values({
          enterpriseId: input.enterpriseId,
          kind: input.kind,
          name: input.name,
          description: input.description ?? null,
          architectureLevel:
            input.kind === 'architecture' ? (input.architectureLevel ?? null) : null,
          lifecyclePhase: input.lifecyclePhase,
          validFrom: input.validFrom ?? null,
          validTo: input.validTo ?? null,
        })
        .returning({ id: schema.buildingBlocks.id });

      if (!inserted) throw new NotFoundException('Building block insert returned no row');
      await this.replaceAssignments(tx, inserted.id, input);
      return inserted.id;
    });

    const created = await this.findOne(id);
    if (!created) throw new NotFoundException(`Building block ${id} not found after creation`);
    return created;
  }

  async update(id: string, input: BuildingBlockInput): Promise<MappedBuildingBlock> {
    this.validateInput(input);

    await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schema.buildingBlocks)
        .set({
          kind: input.kind,
          name: input.name,
          description: input.description ?? null,
          architectureLevel:
            input.kind === 'architecture' ? (input.architectureLevel ?? null) : null,
          lifecyclePhase: input.lifecyclePhase,
          validFrom: input.validFrom ?? null,
          validTo: input.validTo ?? null,
        })
        .where(eq(schema.buildingBlocks.id, id))
        .returning({ id: schema.buildingBlocks.id });

      if (!updated) throw new NotFoundException(`Building block ${id} not found`);
      await this.replaceAssignments(tx, id, input);
    });

    const updated = await this.findOne(id);
    if (!updated) throw new NotFoundException(`Building block ${id} not found after update`);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.buildingBlocks)
      .where(eq(schema.buildingBlocks.id, id))
      .returning({ id: schema.buildingBlocks.id });
    return Boolean(deleted);
  }

  async createRelationship(
    input: BuildingBlockRelationshipInput,
  ): Promise<BuildingBlockRelationship> {
    if (input.sourceBuildingBlockId === input.targetBuildingBlockId) {
      throw new BadRequestException('A building block cannot relate to itself');
    }

    const [created] = await this.db
      .insert(schema.buildingBlockRelationships)
      .values({
        sourceBuildingBlockId: input.sourceBuildingBlockId,
        targetBuildingBlockId: input.targetBuildingBlockId,
        type: input.type,
        description: input.description ?? null,
        validFrom: input.validFrom ?? null,
        validTo: input.validTo ?? null,
      })
      .returning();

    if (!created) throw new NotFoundException('Building block relationship insert returned no row');
    return created as BuildingBlockRelationship;
  }

  async deleteRelationship(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.buildingBlockRelationships)
      .where(eq(schema.buildingBlockRelationships.id, id))
      .returning({ id: schema.buildingBlockRelationships.id });
    return Boolean(deleted);
  }

  private validateInput(input: BuildingBlockInput): void {
    if (input.architectureDomainIds.length === 0) {
      throw new BadRequestException(
        'A building block must belong to at least one architecture domain',
      );
    }
    if (input.kind === 'solution' && input.architectureLevel) {
      throw new BadRequestException(
        'architectureLevel only applies to architecture building blocks',
      );
    }
  }

  // Domain and org-unit assignment are treated as a replace-all set here (no
  // validity interval) — see the note on BuildingBlockInput.
  private async replaceAssignments(
    tx: Transaction,
    buildingBlockId: string,
    input: BuildingBlockInput,
  ): Promise<void> {
    await tx
      .delete(schema.buildingBlockArchitectureDomains)
      .where(eq(schema.buildingBlockArchitectureDomains.buildingBlockId, buildingBlockId));
    await tx
      .delete(schema.buildingBlockOrganizationUnits)
      .where(eq(schema.buildingBlockOrganizationUnits.buildingBlockId, buildingBlockId));

    if (input.architectureDomainIds.length > 0) {
      await tx.insert(schema.buildingBlockArchitectureDomains).values(
        input.architectureDomainIds.map((architectureDomainId) => ({
          buildingBlockId,
          architectureDomainId,
        })),
      );
    }
    if (input.organizationUnitIds.length > 0) {
      await tx.insert(schema.buildingBlockOrganizationUnits).values(
        input.organizationUnitIds.map((organizationUnitId) => ({
          buildingBlockId,
          organizationUnitId,
          validFrom: null,
          validTo: null,
        })),
      );
    }
  }

  architectureLandscape(filter: LandscapeFilter): Promise<MappedBuildingBlock[]> {
    return this.landscape('architecture', filter);
  }

  solutionsLandscape(filter: LandscapeFilter): Promise<MappedBuildingBlock[]> {
    return this.landscape('solution', filter);
  }

  // Filters run in memory after a kind-scoped query; move them into SQL when
  // landscapes grow past what a single fetch handles comfortably.
  private async landscape(
    kind: 'architecture' | 'solution',
    filter: LandscapeFilter,
  ): Promise<MappedBuildingBlock[]> {
    const rows = await this.db.query.buildingBlocks.findMany({
      where: (t, { and, eq }) => and(eq(t.kind, kind), eq(t.enterpriseId, filter.enterpriseId)),
      with: withAllLinks,
      orderBy: (t, { asc }) => [asc(t.name)],
    });

    return rows
      .filter((row) => {
        if (filter.asOf && !isValidAt(row, filter.asOf)) return false;
        if (filter.architectureLevel && row.architectureLevel !== filter.architectureLevel) {
          return false;
        }
        if (
          filter.architectureDomainId &&
          !row.architectureDomainLinks.some(
            (l) => l.architectureDomainId === filter.architectureDomainId,
          )
        ) {
          return false;
        }
        if (filter.organizationUnitId) {
          // Exact unit match for now; expanding to descendant units in the
          // hierarchy is a follow-up.
          const links = row.organizationUnitLinks.filter(
            (l) => l.organizationUnitId === filter.organizationUnitId,
          );
          const visible = filter.asOf
            ? links.some((l) => isValidAt(l, filter.asOf as string))
            : links.length > 0;
          if (!visible) return false;
        }
        return true;
      })
      .map((row) => toBuildingBlock(row, filter.asOf));
  }
}
