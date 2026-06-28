import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValueStreamStage {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => [String]) capabilityIds!: string[];
}

@ObjectType()
export class ValueStream {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [ValueStreamStage]) stages!: ValueStreamStage[];
}
