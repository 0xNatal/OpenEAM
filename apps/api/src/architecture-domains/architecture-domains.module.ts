import { Module } from '@nestjs/common';
import { ArchitectureDomainsResolver } from './architecture-domains.resolver';
import { ArchitectureDomainsService } from './architecture-domains.service';

@Module({
  providers: [ArchitectureDomainsService, ArchitectureDomainsResolver],
})
export class ArchitectureDomainsModule {}
