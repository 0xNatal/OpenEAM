import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrganizationUnit } from './organization-unit.model';
import { OrganizationUnitsService } from './organization-units.service';

@Resolver(() => OrganizationUnit)
export class OrganizationUnitsResolver {
  constructor(private readonly service: OrganizationUnitsService) {}

  @Query(() => [OrganizationUnit])
  organizationUnits() {
    return this.service.findAll();
  }

  @Query(() => OrganizationUnit, { nullable: true })
  organizationUnit(@Args('id') id: string) {
    return this.service.findOne(id);
  }
}
