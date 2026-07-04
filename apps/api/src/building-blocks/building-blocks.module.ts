import { Module } from '@nestjs/common';
import { BuildingBlocksResolver } from './building-blocks.resolver';
import { BuildingBlocksService } from './building-blocks.service';

@Module({
  providers: [BuildingBlocksService, BuildingBlocksResolver],
})
export class BuildingBlocksModule {}
