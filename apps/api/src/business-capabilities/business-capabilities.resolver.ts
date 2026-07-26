import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { BusinessCapabilityRow } from './business-capabilities.service';
import { BusinessCapabilitiesService } from './business-capabilities.service';
import {
  BusinessCapability,
  BusinessCapabilityInput,
  Information,
  Person,
} from './business-capability.model';

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

  @Mutation(() => BusinessCapability)
  createBusinessCapability(
    @Args('input') input: BusinessCapabilityInput,
  ): Promise<BusinessCapabilityRow> {
    return this.service.create(input);
  }

  @Mutation(() => BusinessCapability)
  updateBusinessCapability(
    @Args('id') id: string,
    @Args('input') input: BusinessCapabilityInput,
  ): Promise<BusinessCapabilityRow> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBusinessCapability(@Args('id') id: string): Promise<boolean> {
    return this.service.delete(id);
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
