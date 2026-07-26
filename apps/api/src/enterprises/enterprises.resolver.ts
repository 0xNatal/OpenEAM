import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Enterprise, EnterpriseInput } from './enterprise.model';
import { EnterprisesService } from './enterprises.service';

@Resolver(() => Enterprise)
export class EnterprisesResolver {
  constructor(private readonly service: EnterprisesService) {}

  @Query(() => [Enterprise])
  enterprises(): Promise<Enterprise[]> {
    return this.service.findAll();
  }

  @Query(() => Enterprise, { nullable: true })
  enterprise(@Args('id') id: string): Promise<Enterprise | undefined> {
    return this.service.findOne(id);
  }

  @Mutation(() => Enterprise)
  createEnterprise(@Args('input') input: EnterpriseInput): Promise<Enterprise> {
    return this.service.create(input);
  }

  @Mutation(() => Enterprise)
  updateEnterprise(
    @Args('id') id: string,
    @Args('input') input: EnterpriseInput,
  ): Promise<Enterprise> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteEnterprise(@Args('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }
}
