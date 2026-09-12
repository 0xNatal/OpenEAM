import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Actor, ActorInput, CapabilityActorInput } from './actor.model';
import { ActorsService } from './actors.service';

@Resolver(() => Actor)
export class ActorsResolver {
  constructor(private readonly service: ActorsService) {}

  @Query(() => [Actor])
  actors(@Args('enterpriseId') enterpriseId: string): Promise<Actor[]> {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => Actor, { nullable: true })
  actor(@Args('id') id: string): Promise<Actor | undefined> {
    return this.service.findOne(id);
  }

  @Mutation(() => Actor)
  createActor(@Args('input') input: ActorInput): Promise<Actor> {
    return this.service.create(input);
  }

  @Mutation(() => Actor)
  updateActor(@Args('id') id: string, @Args('input') input: ActorInput): Promise<Actor> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteActor(@Args('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  @Mutation(() => Actor)
  linkCapabilityActor(@Args('input') input: CapabilityActorInput): Promise<Actor> {
    return this.service.link(input);
  }

  @Mutation(() => Boolean)
  unlinkCapabilityActor(@Args('linkId') linkId: string): Promise<boolean> {
    return this.service.unlink(linkId);
  }
}
