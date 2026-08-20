import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { ValueStream, ValueStreamInput } from './value-stream.model';

interface StageRow {
  id: string;
  name: string;
  stageCapabilities: Array<{ capabilityId: string }>;
}

interface ValueStreamRow {
  id: string;
  enterpriseId: string;
  name: string;
  description: string | null;
  stages: StageRow[];
}

function toValueStream(row: ValueStreamRow): ValueStream {
  return {
    id: row.id,
    enterpriseId: row.enterpriseId,
    name: row.name,
    description: row.description,
    stages: row.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      capabilityIds: stage.stageCapabilities.map((sc) => sc.capabilityId),
    })),
  };
}

@Injectable()
export class ValueStreamsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(enterpriseId: string): Promise<ValueStream[]> {
    const rows = await this.db.query.valueStreams.findMany({
      where: (t, { eq }) => eq(t.enterpriseId, enterpriseId),
      with: {
        stages: {
          orderBy: (t, { asc }) => [asc(t.position)],
          with: { stageCapabilities: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
      },
    });
    return rows.map(toValueStream);
  }

  async findOne(id: string): Promise<ValueStream | undefined> {
    const row = await this.db.query.valueStreams.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        stages: {
          orderBy: (t, { asc }) => [asc(t.position)],
          with: { stageCapabilities: { orderBy: (t, { asc }) => [asc(t.position)] } },
        },
      },
    });
    return row ? toValueStream(row) : undefined;
  }

  async create(input: ValueStreamInput): Promise<ValueStream> {
    const id = await this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(schema.valueStreams)
        .values({
          enterpriseId: input.enterpriseId,
          name: input.name,
          description: input.description ?? null,
        })
        .returning({ id: schema.valueStreams.id });

      if (!inserted) throw new NotFoundException('Value stream insert returned no row');

      // Stage order and each stage's capability order both come from their
      // position in the input arrays — the wire format carries order
      // implicitly, only the DB rows need an explicit position column.
      for (const [stagePosition, stage] of input.stages.entries()) {
        const [insertedStage] = await tx
          .insert(schema.valueStreamStages)
          .values({
            valueStreamId: inserted.id,
            name: stage.name,
            position: stagePosition,
          })
          .returning({ id: schema.valueStreamStages.id });

        if (!insertedStage)
          throw new NotFoundException('Value stream stage insert returned no row');

        if (stage.capabilityIds.length > 0) {
          await tx.insert(schema.stageCapabilities).values(
            stage.capabilityIds.map((capabilityId, position) => ({
              stageId: insertedStage.id,
              capabilityId,
              position,
            })),
          );
        }
      }

      return inserted.id;
    });

    const created = await this.findOne(id);
    if (!created) throw new NotFoundException(`Value stream ${id} not found after creation`);
    return created;
  }
}
