import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { DATABASE } from '../db.module';
import type { ValueStream } from './value-stream.model';

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
}
