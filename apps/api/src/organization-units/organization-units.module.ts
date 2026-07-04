import { Module } from '@nestjs/common';
import { OrganizationUnitsResolver } from './organization-units.resolver';
import { OrganizationUnitsService } from './organization-units.service';

@Module({
  providers: [OrganizationUnitsService, OrganizationUnitsResolver],
})
export class OrganizationUnitsModule {}
