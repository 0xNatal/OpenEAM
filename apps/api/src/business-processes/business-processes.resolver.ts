import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BusinessProcess, BusinessProcessInput } from './business-process.model';
import { BusinessProcessesService } from './business-processes.service';

@Resolver(() => BusinessProcess)
export class BusinessProcessesResolver {
  constructor(private readonly service: BusinessProcessesService) {}

  @Query(() => [BusinessProcess])
  businessProcesses(@Args('enterpriseId') enterpriseId: string): Promise<BusinessProcess[]> {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => BusinessProcess, { nullable: true })
  businessProcess(@Args('id') id: string): Promise<BusinessProcess | undefined> {
    return this.service.findOne(id);
  }

  @Mutation(() => BusinessProcess)
  createBusinessProcess(@Args('input') input: BusinessProcessInput): Promise<BusinessProcess> {
    return this.service.create(input);
  }

  @Mutation(() => BusinessProcess)
  updateBusinessProcess(
    @Args('id') id: string,
    @Args('input') input: BusinessProcessInput,
  ): Promise<BusinessProcess> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBusinessProcess(@Args('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  // Stores the diagram and re-derives the process steps from its tasks.
  @Mutation(() => BusinessProcess)
  updateBusinessProcessDiagram(
    @Args('id') id: string,
    @Args('bpmnXml') bpmnXml: string,
  ): Promise<BusinessProcess> {
    return this.service.updateDiagram(id, bpmnXml);
  }
}
