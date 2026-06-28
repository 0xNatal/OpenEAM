import { Args, Query, Resolver } from '@nestjs/graphql';
import { BusinessProcess } from './business-process.model';
import { BusinessProcessesService } from './business-processes.service';

@Resolver(() => BusinessProcess)
export class BusinessProcessesResolver {
  constructor(private readonly service: BusinessProcessesService) {}

  @Query(() => [BusinessProcess])
  businessProcesses(): Promise<BusinessProcess[]> {
    return this.service.findAll();
  }

  @Query(() => BusinessProcess, { nullable: true })
  businessProcess(@Args('id') id: string): Promise<BusinessProcess | undefined> {
    return this.service.findOne(id);
  }
}
