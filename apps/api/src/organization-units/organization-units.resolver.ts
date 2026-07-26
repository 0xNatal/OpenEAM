import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrganizationUnit } from './organization-unit.model';
import { OrganizationUnitsService } from './organization-units.service';

@Resolver(() => OrganizationUnit)
export class OrganizationUnitsResolver {
  constructor(private readonly service: OrganizationUnitsService) {}

  @Query(() => [OrganizationUnit])
  organizationUnits(@Args('enterpriseId') enterpriseId: string) {
    return this.service.findAll(enterpriseId);
  }

  @Query(() => OrganizationUnit, { nullable: true })
  organizationUnit(@Args('id') id: string) {
    return this.service.findOne(id);
  }
}
