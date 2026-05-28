// GraphQL resolver exposing the `ping` liveness query (returns "pong").
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, { description: 'Liveness smoke-test. Returns "pong".' })
  ping(): string {
    return 'pong';
  }
}
