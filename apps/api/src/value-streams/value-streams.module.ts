import { Module } from '@nestjs/common';
import { ValueStreamsResolver } from './value-streams.resolver';
import { ValueStreamsService } from './value-streams.service';

@Module({
  providers: [ValueStreamsService, ValueStreamsResolver],
})
export class ValueStreamsModule {}
