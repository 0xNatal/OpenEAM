import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganizationUnit {
  @Field() id!: string;
  @Field() enterpriseId!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) parentId?: string | null;
}
