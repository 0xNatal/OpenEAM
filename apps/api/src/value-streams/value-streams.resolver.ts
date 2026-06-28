import { Args, Query, Resolver } from '@nestjs/graphql';
import { ValueStream } from './value-stream.model';
import { ValueStreamsService } from './value-streams.service';

@Resolver(() => ValueStream)
export class ValueStreamsResolver {
  constructor(private readonly service: ValueStreamsService) {}

  @Query(() => [ValueStream])
  valueStreams() {
    return this.service.findAll();
  }

  @Query(() => ValueStream, { nullable: true })
  valueStream(@Args('id') id: string) {
    return this.service.findOne(id);
  }
}
