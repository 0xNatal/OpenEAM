import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum InformationUsage {
  OWNS = 'owns',
  CREATES = 'creates',
  USES = 'uses',
}

registerEnumType(InformationUsage, {
  name: 'InformationUsage',
  description:
    'How a capability relates to a piece of information: owns (accountable for it being correct), creates (brings it into existence), uses (consumes it without owning it).',
});

// Business information, in business language and independent of the systems
// that hold it. Deliberately one level — there is no system-level data object
// realizing a concept the way an SBB realizes an ABB; see docs/DECISIONS.md.
@ObjectType()
export class InformationObject {
  @Field() id!: string;
  @Field() enterpriseId!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [InformationCapabilityLink]) capabilities!: InformationCapabilityLink[];
}

// Which capabilities touch this information, and how (the reverse of
// BusinessCapability.information).
@ObjectType()
export class InformationCapabilityLink {
  @Field() linkId!: string;
  @Field() capabilityId!: string;
  @Field() capabilityName!: string;
  @Field(() => InformationUsage) usage!: InformationUsage;
  @Field(() => String, { nullable: true }) validFrom?: string | null;
  @Field(() => String, { nullable: true }) validTo?: string | null;
}

@InputType()
export class InformationObjectInput {
  @Field() enterpriseId!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
}

@InputType()
export class CapabilityInformationInput {
  @Field() capabilityId!: string;
  @Field() informationObjectId!: string;
  @Field(() => InformationUsage, { nullable: true }) usage?: InformationUsage | null;
  @Field(() => String, { nullable: true }) validFrom?: string | null;
  @Field(() => String, { nullable: true }) validTo?: string | null;
}
