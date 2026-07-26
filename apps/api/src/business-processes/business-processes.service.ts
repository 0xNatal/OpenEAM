import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@openeam/db';
import { eq, schema } from '@openeam/db';
import { DATABASE } from '../db.module';
import { extractStepNames } from './bpmn-steps';
import type { BusinessProcess, BusinessProcessInput } from './business-process.model';

@Injectable()
export class BusinessProcessesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll(enterpriseId: string): Promise<BusinessProcess[]> {
    return this.db.query.businessProcesses.findMany({
      where: (t, { eq }) => eq(t.enterpriseId, enterpriseId),
      with: { steps: { orderBy: (t, { asc }) => [asc(t.position)] } },
    });
  }

  // A process lives in its capability's enterprise; the input carries no
  // enterpriseId of its own.
  private async enterpriseIdOfCapability(capabilityId: string): Promise<string> {
    const capability = await this.db.query.businessCapabilities.findFirst({
      where: (t, { eq }) => eq(t.id, capabilityId),
      columns: { enterpriseId: true },
    });
    if (!capability) throw new BadRequestException(`Capability ${capabilityId} not found`);
    return capability.enterpriseId;
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

  async create(input: BusinessProcessInput): Promise<BusinessProcess> {
    const enterpriseId = await this.enterpriseIdOfCapability(input.capabilityId);
    const [inserted] = await this.db
      .insert(schema.businessProcesses)
      .values({
        enterpriseId,
        capabilityId: input.capabilityId,
        name: input.name,
        description: input.description ?? null,
        triggerEvent: input.triggerEvent ?? null,
        outcome: input.outcome ?? null,
      })
      .returning({ id: schema.businessProcesses.id });

    if (!inserted) throw new NotFoundException('Business process insert returned no row');
    const created = await this.findOne(inserted.id);
    if (!created) {
      throw new NotFoundException(`Business process ${inserted.id} not found after creation`);
    }
    return created;
  }

  async update(id: string, input: BusinessProcessInput): Promise<BusinessProcess> {
    const enterpriseId = await this.enterpriseIdOfCapability(input.capabilityId);
    const [updated] = await this.db
      .update(schema.businessProcesses)
      .set({
        enterpriseId,
        capabilityId: input.capabilityId,
        name: input.name,
        description: input.description ?? null,
        triggerEvent: input.triggerEvent ?? null,
        outcome: input.outcome ?? null,
      })
      .where(eq(schema.businessProcesses.id, id))
      .returning({ id: schema.businessProcesses.id });

    if (!updated) throw new NotFoundException(`Business process ${id} not found`);
    const result = await this.findOne(id);
    if (!result) {
      throw new NotFoundException(`Business process ${id} not found after update`);
    }
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(schema.businessProcesses)
      .where(eq(schema.businessProcesses.id, id))
      .returning({ id: schema.businessProcesses.id });
    return Boolean(deleted);
  }
}
