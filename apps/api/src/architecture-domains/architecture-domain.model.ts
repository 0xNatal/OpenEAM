import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ArchitectureDomain {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() isDefault!: boolean;
}
