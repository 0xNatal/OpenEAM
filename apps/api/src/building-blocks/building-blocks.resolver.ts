import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  ArchitectureBuildingBlock,
  ArchitectureLevel,
  BuildingBlock,
  BuildingBlockInput,
  SolutionBuildingBlock,
} from './building-block.model';
import { BuildingBlocksService } from './building-blocks.service';

@Resolver(() => BuildingBlock)
export class BuildingBlocksResolver {
  constructor(private readonly service: BuildingBlocksService) {}

  @Query(() => [BuildingBlock])
  buildingBlocks() {
    return this.service.findAll();
  }

  @Query(() => BuildingBlock, { nullable: true })
  buildingBlock(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  // The Architecture Landscape: all ABBs visible from the chosen viewpoint
  // (time, depth, domain, breadth). All filters are optional.
  @Query(() => [ArchitectureBuildingBlock])
  architectureLandscape(
    @Args('asOf', { nullable: true, description: 'ISO date (YYYY-MM-DD)' }) asOf?: string,
    @Args('architectureLevel', { type: () => ArchitectureLevel, nullable: true })
    architectureLevel?: ArchitectureLevel,
    @Args('architectureDomainId', { nullable: true }) architectureDomainId?: string,
    @Args('organizationUnitId', { nullable: true }) organizationUnitId?: string,
  ) {
    return this.service.architectureLandscape({
      asOf,
      architectureLevel,
      architectureDomainId,
      organizationUnitId,
    });
  }

  // The Solutions Landscape: all SBBs visible from the chosen viewpoint.
  @Query(() => [SolutionBuildingBlock])
  solutionsLandscape(
    @Args('asOf', { nullable: true, description: 'ISO date (YYYY-MM-DD)' }) asOf?: string,
    @Args('architectureDomainId', { nullable: true }) architectureDomainId?: string,
    @Args('organizationUnitId', { nullable: true }) organizationUnitId?: string,
  ) {
    return this.service.solutionsLandscape({ asOf, architectureDomainId, organizationUnitId });
  }

  @Mutation(() => BuildingBlock)
  createBuildingBlock(@Args('input') input: BuildingBlockInput) {
    return this.service.create(input);
  }

  @Mutation(() => BuildingBlock)
  updateBuildingBlock(@Args('id') id: string, @Args('input') input: BuildingBlockInput) {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBuildingBlock(@Args('id') id: string) {
    return this.service.delete(id);
  }
}
