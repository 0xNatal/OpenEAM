import { Args, Query, Resolver } from '@nestjs/graphql';
import { ArchitectureDomain } from './architecture-domain.model';
import { ArchitectureDomainsService } from './architecture-domains.service';

@Resolver(() => ArchitectureDomain)
export class ArchitectureDomainsResolver {
  constructor(private readonly service: ArchitectureDomainsService) {}

  @Query(() => [ArchitectureDomain])
  architectureDomains(@Args('enterpriseId') enterpriseId: string) {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => ArchitectureDomain, { nullable: true })
  architectureDomain(@Args('id') id: string) {
    return this.service.findOne(id);
  }
}
