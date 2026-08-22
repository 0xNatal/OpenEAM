import { Field, InputType, ObjectType } from '@nestjs/graphql';

// The scope of an architecture effort: one or more organizations (or parts
// of them) pursuing a shared goal. Every modeled entity belongs to exactly
// one enterprise — see docs/VISION.md.
@ObjectType()
export class Enterprise {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) goal?: string | null;
  @Field(() => String, { nullable: true }) avatarBgColor?: string | null;
  @Field(() => String, { nullable: true }) avatarTextColor?: string | null;
}

@InputType()
export class EnterpriseInput {
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) goal?: string | null;
  @Field(() => String, { nullable: true }) avatarBgColor?: string | null;
  @Field(() => String, { nullable: true }) avatarTextColor?: string | null;
}
