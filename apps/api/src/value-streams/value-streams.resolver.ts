import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValueStream, ValueStreamInput } from './value-stream.model';
import { ValueStreamsService } from './value-streams.service';

@Resolver(() => ValueStream)
export class ValueStreamsResolver {
  constructor(private readonly service: ValueStreamsService) {}

  @Query(() => [ValueStream])
  valueStreams(@Args('enterpriseId') enterpriseId: string) {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => ValueStream, { nullable: true })
  valueStream(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => ValueStream)
  createValueStream(@Args('input') input: ValueStreamInput) {
    return this.service.create(input);
  }
}
