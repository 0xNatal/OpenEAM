import { Field, ObjectType } from '@nestjs/graphql';
import { BuildingBlock } from '../building-blocks/building-block.model';
import { BusinessProcess } from '../business-processes/business-process.model';

@ObjectType()
export class Person {
  @Field() id!: string;
  @Field() name!: string;
}

@ObjectType()
export class Information {
  @Field() id!: string;
  @Field() name!: string;
}

@ObjectType()
export class BusinessCapability {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [BusinessProcess]) businessProcesses!: BusinessProcess[];
  @Field(() => [Person]) people!: Person[];
  // Building blocks linked to this capability (the reverse of
  // ArchitectureBuildingBlock.capabilityLinks in building-block.model.ts).
  @Field(() => [BuildingBlock]) resources!: BuildingBlock[];
  @Field(() => [Information]) information!: Information[];
}
