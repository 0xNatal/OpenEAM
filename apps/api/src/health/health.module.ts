// Health feature module: bundles the REST /health endpoint and the GraphQL
// `ping` query used as liveness smoke tests.
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthResolver],
})
export class HealthModule {}
