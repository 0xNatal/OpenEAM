import type { InformationUsage } from './entities';

// owns -> uses reads left-to-right as "more answerable" to "less", the same
// ordering idea as capability direction and actor involvement.
export const INFORMATION_USAGES: InformationUsage[] = ['OWNS', 'CREATES', 'USES'];

export const INFORMATION_USAGE_LABEL: Record<InformationUsage, string> = {
  OWNS: 'Owns',
  CREATES: 'Creates',
  USES: 'Uses',
};

export const INFORMATION_USAGE_HINT: Record<InformationUsage, string> = {
  OWNS: 'Accountable for this information being correct',
  CREATES: 'Brings it into existence',
  USES: 'Consumes it without being accountable for it',
};

export const INFORMATION_USAGE_STYLE: Record<InformationUsage, string> = {
  OWNS: 'border-emerald-600/40 text-emerald-700 dark:text-emerald-400',
  CREATES: 'border-sky-600/40 text-sky-700 dark:text-sky-400',
  USES: 'border-border text-muted-foreground',
};
