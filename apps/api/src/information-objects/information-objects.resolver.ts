import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CapabilityInformationInput,
  InformationObject,
  InformationObjectInput,
} from './information-object.model';
import { InformationObjectsService } from './information-objects.service';

@Resolver(() => InformationObject)
export class InformationObjectsResolver {
  constructor(private readonly service: InformationObjectsService) {}

  @Query(() => [InformationObject])
  informationObjects(@Args('enterpriseId') enterpriseId: string): Promise<InformationObject[]> {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => InformationObject, { nullable: true })
  informationObject(@Args('id') id: string): Promise<InformationObject | undefined> {
    return this.service.findOne(id);
  }

  @Mutation(() => InformationObject)
  createInformationObject(
    @Args('input') input: InformationObjectInput,
  ): Promise<InformationObject> {
    return this.service.create(input);
  }

  @Mutation(() => InformationObject)
  updateInformationObject(
    @Args('id') id: string,
    @Args('input') input: InformationObjectInput,
  ): Promise<InformationObject> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteInformationObject(@Args('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  @Mutation(() => InformationObject)
  linkCapabilityInformation(
    @Args('input') input: CapabilityInformationInput,
  ): Promise<InformationObject> {
    return this.service.link(input);
  }

  @Mutation(() => Boolean)
  unlinkCapabilityInformation(@Args('linkId') linkId: string): Promise<boolean> {
    return this.service.unlink(linkId);
  }
}
