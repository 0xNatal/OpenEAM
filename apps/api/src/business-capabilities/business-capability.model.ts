import { Field, ObjectType } from '@nestjs/graphql';
import { BusinessProcess } from '../business-processes/business-process.model';

@ObjectType()
export class Person {
  @Field() id!: string;
  @Field() name!: string;
}

@ObjectType()
export class Resource {
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
  @Field(() => [Resource]) resources!: Resource[];
  @Field(() => [Information]) information!: Information[];
}
