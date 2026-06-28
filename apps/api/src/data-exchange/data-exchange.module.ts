import { Module } from '@nestjs/common';
import { DataExchangeController } from './data-exchange.controller';
import { DataExchangeService } from './data-exchange.service';

@Module({
  controllers: [DataExchangeController],
  providers: [DataExchangeService],
})
export class DataExchangeModule {}
