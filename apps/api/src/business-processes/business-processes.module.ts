import { Module } from '@nestjs/common';
import { BusinessProcessesResolver } from './business-processes.resolver';
import { BusinessProcessesService } from './business-processes.service';

@Module({
  providers: [BusinessProcessesService, BusinessProcessesResolver],
})
export class BusinessProcessesModule {}
