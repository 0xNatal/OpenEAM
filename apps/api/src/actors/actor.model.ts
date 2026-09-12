import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ActorKind {
  ROLE = 'role',
  TEAM = 'team',
  INDIVIDUAL = 'individual',
  EXTERNAL = 'external',
}

registerEnumType(ActorKind, {
  name: 'ActorKind',
  description:
    'What kind of actor this is: role (a position, which outlives whoever holds it), team (an internal group, normally pointing at an organization unit), individual (a named person), external (a party outside the enterprise).',
});

export enum ActorInvolvement {
  ACCOUNTABLE = 'accountable',
  PERFORMS = 'performs',
  CONSULTED = 'consulted',
}

registerEnumType(ActorInvolvement, {
  name: 'ActorInvolvement',
  description:
    'In what capacity an actor is involved in a capability: accountable (answers for it), performs (does the work), consulted (has a say without owning it).',
});

// A position, team, person or external party involved in delivering a
// capability. Broader than a person on purpose — accountability usually sits
// with a role, and roles outlive the people in them.
@ObjectType()
export class Actor {
  @Field() id!: string;
  @Field() enterpriseId!: string;
  @Field(() => ActorKind) kind!: ActorKind;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  // Set only for kind = 'team': the organization unit this actor already is,
  // so a team is not modelled twice under two names.
  @Field(() => String, { nullable: true }) organizationUnitId?: string | null;
  @Field(() => String, { nullable: true }) organizationUnitName?: string | null;
  @Field(() => [ActorCapabilityLink]) capabilities!: ActorCapabilityLink[];
}

@ObjectType()
export class ActorCapabilityLink {
  @Field() linkId!: string;
  @Field() capabilityId!: string;
  @Field() capabilityName!: string;
  @Field(() => ActorInvolvement) involvement!: ActorInvolvement;
  @Field(() => String, { nullable: true }) validFrom?: string | null;
  @Field(() => String, { nullable: true }) validTo?: string | null;
}

@InputType()
export class ActorInput {
  @Field() enterpriseId!: string;
  @Field(() => ActorKind) kind!: ActorKind;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) organizationUnitId?: string | null;
}

@InputType()
export class CapabilityActorInput {
  @Field() capabilityId!: string;
  @Field() actorId!: string;
  @Field(() => ActorInvolvement, { nullable: true }) involvement?: ActorInvolvement | null;
  @Field(() => String, { nullable: true }) validFrom?: string | null;
  @Field(() => String, { nullable: true }) validTo?: string | null;
}
