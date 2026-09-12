import type { ActorInvolvement, ActorKind } from './entities';

// Order carries meaning: role first because that is where accountability
// normally sits, individual late because it is the least stable answer.
export const ACTOR_KINDS: ActorKind[] = ['ROLE', 'TEAM', 'INDIVIDUAL', 'EXTERNAL'];

export const ACTOR_KIND_LABEL: Record<ActorKind, string> = {
  ROLE: 'Role',
  TEAM: 'Team',
  INDIVIDUAL: 'Individual',
  EXTERNAL: 'External party',
};

export const ACTOR_KIND_HINT: Record<ActorKind, string> = {
  ROLE: 'A position, which outlives whoever holds it',
  TEAM: 'An internal group — point it at the organization unit that already models it',
  INDIVIDUAL: 'A named person. The honest answer sometimes, and the least stable one',
  EXTERNAL: 'A party outside the enterprise',
};

// Plain Tailwind tokens, same convention as capability-direction.ts.
export const ACTOR_KIND_STYLE: Record<ActorKind, string> = {
  ROLE: 'border-sky-600/40 text-sky-700 dark:text-sky-400',
  TEAM: 'border-violet-600/40 text-violet-700 dark:text-violet-400',
  INDIVIDUAL: 'border-border text-muted-foreground',
  EXTERNAL: 'border-amber-600/40 text-amber-700 dark:text-amber-400',
};

// accountable -> consulted reads left-to-right as "more answerable" to "less".
export const ACTOR_INVOLVEMENTS: ActorInvolvement[] = ['ACCOUNTABLE', 'PERFORMS', 'CONSULTED'];

export const ACTOR_INVOLVEMENT_LABEL: Record<ActorInvolvement, string> = {
  ACCOUNTABLE: 'Accountable',
  PERFORMS: 'Performs',
  CONSULTED: 'Consulted',
};

export const ACTOR_INVOLVEMENT_STYLE: Record<ActorInvolvement, string> = {
  ACCOUNTABLE: 'border-emerald-600/40 text-emerald-700 dark:text-emerald-400',
  PERFORMS: 'border-border text-muted-foreground',
  CONSULTED: 'border-border text-muted-foreground',
};
