import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { BusinessCapabilityRow } from './business-capabilities.service';
import { BusinessCapabilitiesService } from './business-capabilities.service';
import { BusinessCapability, Information, Person } from './business-capability.model';

@Resolver(() => BusinessCapability)
export class BusinessCapabilitiesResolver {
  constructor(private readonly service: BusinessCapabilitiesService) {}

  @Query(() => [BusinessCapability])
  businessCapabilities(): Promise<BusinessCapabilityRow[]> {
    return this.service.findAll();
  }

  @Query(() => BusinessCapability, { nullable: true })
  businessCapability(@Args('id') id: string): Promise<BusinessCapabilityRow | undefined> {
    return this.service.findOne(id);
  }

  // No DB tables yet for these — see docs/IDEAS.md.
  @ResolveField(() => [Person])
  people(): Person[] {
    return [];
  }

  @ResolveField(() => [Information])
  information(): Information[] {
    return [];
  }
}
