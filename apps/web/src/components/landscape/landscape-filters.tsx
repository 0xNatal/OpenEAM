// Shared viewpoint filter bar (time, level of detail, architecture domain,
// organization unit) used by both the table and diagram landscape views, so
// the two stay in lockstep instead of drifting apart as separate copies.
import { Input } from '@/components/ui/input';
import type { ArchitectureDomain, ArchitectureLevel, OrganizationUnit } from '@/lib/entities';
import { cn } from '@/lib/utils';

export interface LandscapeFilterValues {
  asOf: string;
  architectureLevel: ArchitectureLevel | '';
  architectureDomainId: string;
  organizationUnitId: string;
}

export const EMPTY_LANDSCAPE_FILTERS: LandscapeFilterValues = {
  asOf: '',
  architectureLevel: '',
  architectureDomainId: '',
  organizationUnitId: '',
};

export const selectClassName =
  'h-7 min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

interface LandscapeFiltersProps {
  value: LandscapeFilterValues;
  onChange: (value: LandscapeFilterValues) => void;
  architectureDomains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
  // The diagram view doesn't query architecture building blocks at all, so
  // filtering by architecture level would silently do nothing there.
  hideArchitectureLevel?: boolean;
}

export function LandscapeFilters({
  value,
  onChange,
  architectureDomains,
  organizationUnits,
  hideArchitectureLevel,
}: LandscapeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label
        htmlFor="landscape-as-of"
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        As of
        <Input
          id="landscape-as-of"
          type="date"
          className="w-36"
          value={value.asOf}
          onChange={(e) => onChange({ ...value, asOf: e.target.value })}
        />
      </label>
      {!hideArchitectureLevel && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          Level
          <select
            className={cn(selectClassName, 'w-32')}
            value={value.architectureLevel}
            onChange={(e) =>
              onChange({ ...value, architectureLevel: e.target.value as ArchitectureLevel | '' })
            }
          >
            <option value="">All</option>
            <option value="STRATEGIC">Strategic</option>
            <option value="SEGMENT">Segment</option>
            <option value="CAPABILITY">Capability</option>
          </select>
        </label>
      )}
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        Domain
        <select
          className={cn(selectClassName, 'w-40')}
          value={value.architectureDomainId}
          onChange={(e) => onChange({ ...value, architectureDomainId: e.target.value })}
        >
          <option value="">All</option>
          {architectureDomains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        Org unit
        <select
          className={cn(selectClassName, 'w-40')}
          value={value.organizationUnitId}
          onChange={(e) => onChange({ ...value, organizationUnitId: e.target.value })}
        >
          <option value="">All</option>
          {organizationUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
