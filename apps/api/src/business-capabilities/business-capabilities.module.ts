import { Module } from '@nestjs/common';
import { BusinessCapabilitiesResolver } from './business-capabilities.resolver';
import { BusinessCapabilitiesService } from './business-capabilities.service';

@Module({
  providers: [BusinessCapabilitiesService, BusinessCapabilitiesResolver],
})
export class BusinessCapabilitiesModule {}
