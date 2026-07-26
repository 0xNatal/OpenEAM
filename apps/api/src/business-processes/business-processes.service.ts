import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import { extractStepNames } from './bpmn-steps';
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

  async updateDiagram(id: string, bpmnXml: string): Promise<BusinessProcess> {
    let stepNames: string[];
    try {
      stepNames = await extractStepNames(bpmnXml);
    } catch (err) {
      throw new BadRequestException(
        `Invalid BPMN 2.0 XML: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schema.businessProcesses)
        .set({ bpmnXml })
        .where(eq(schema.businessProcesses.id, id))
        .returning({ id: schema.businessProcesses.id });
      if (!updated) throw new NotFoundException(`Business process ${id} not found`);

      // The diagram is the source of truth for steps: replace them with the
      // named tasks extracted from the XML.
      await tx.delete(schema.processSteps).where(eq(schema.processSteps.processId, id));
      if (stepNames.length > 0) {
        await tx
          .insert(schema.processSteps)
          .values(stepNames.map((name, position) => ({ processId: id, name, position })));
      }
    });

    const process = await this.findOne(id);
    if (!process) throw new NotFoundException(`Business process ${id} not found after update`);
    return process;
  }
}
