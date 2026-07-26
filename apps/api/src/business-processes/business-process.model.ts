import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProcessStep {
  @Field() id!: string;
  @Field() name!: string;
}

@ObjectType()
export class BusinessProcess {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() capabilityId!: string;
  @Field(() => String, { nullable: true }) triggerEvent?: string | null;
  @Field(() => String, { nullable: true }) outcome?: string | null;
  @Field(() => String, { nullable: true }) bpmnXml?: string | null;
  @Field(() => [ProcessStep]) steps!: ProcessStep[];
}
