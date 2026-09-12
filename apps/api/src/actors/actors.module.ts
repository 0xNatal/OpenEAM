import { Module } from '@nestjs/common';
import { ActorsResolver } from './actors.resolver';
import { ActorsService } from './actors.service';

@Module({
  providers: [ActorsService, ActorsResolver],
})
export class ActorsModule {}
