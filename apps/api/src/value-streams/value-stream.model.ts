import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValueStreamStage {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => [String]) capabilityIds!: string[];
}

@ObjectType()
export class ValueStream {
  @Field() id!: string;
  @Field() enterpriseId!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [ValueStreamStage]) stages!: ValueStreamStage[];
}

@InputType()
export class ValueStreamStageInput {
  @Field() name!: string;
  // Order within the stream comes from this array's own position, same as
  // capabilityIds' order within a stage — neither needs an explicit index
  // field on the wire, only in the DB rows the service writes from it.
  @Field(() => [String]) capabilityIds!: string[];
}

@InputType()
export class ValueStreamInput {
  @Field() enterpriseId!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [ValueStreamStageInput]) stages!: ValueStreamStageInput[];
}
