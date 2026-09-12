import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { BusinessCapabilityRow } from './business-capabilities.service';
import { BusinessCapabilitiesService } from './business-capabilities.service';
import { BusinessCapability, BusinessCapabilityInput, Person } from './business-capability.model';

@Resolver(() => BusinessCapability)
export class BusinessCapabilitiesResolver {
  constructor(private readonly service: BusinessCapabilitiesService) {}

  @Query(() => [BusinessCapability])
  businessCapabilities(
    @Args('enterpriseId') enterpriseId: string,
  ): Promise<BusinessCapabilityRow[]> {
    return this.service.findAll(enterpriseId);
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

  // No DB table yet — see docs/BACKLOG.md. `information` is resolved from the
  // capability row itself now that information_objects exists.
  @ResolveField(() => [Person])
  people(): Person[] {
    return [];
  }
}
