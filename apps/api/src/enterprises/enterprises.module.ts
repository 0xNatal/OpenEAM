import { Module } from '@nestjs/common';
import { EnterprisesResolver } from './enterprises.resolver';
import { EnterprisesService } from './enterprises.service';

@Module({
  providers: [EnterprisesService, EnterprisesResolver],
})
export class EnterprisesModule {}
