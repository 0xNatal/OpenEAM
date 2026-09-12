import { Module } from '@nestjs/common';
import { InformationObjectsResolver } from './information-objects.resolver';
import { InformationObjectsService } from './information-objects.service';

@Module({
  providers: [InformationObjectsService, InformationObjectsResolver],
})
export class InformationObjectsModule {}
