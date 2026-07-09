import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { ArchitectureDomain, ArchitectureLevel, OrganizationUnit } from '@/lib/entities';

const LANDSCAPE_QUERY = gql`
  query Landscape(
    $asOf: String
    $architectureLevel: ArchitectureLevel
    $architectureDomainId: String
    $organizationUnitId: String
  ) {
    architectureLandscape(
      asOf: $asOf
      architectureLevel: $architectureLevel
      architectureDomainId: $architectureDomainId
      organizationUnitId: $organizationUnitId
    ) {
      id
      name
      architectureLevel
      lifecyclePhase
      validFrom
      validTo
      realizedBy {
        solutionBuildingBlockId
      }
    }
    solutionsLandscape(
      asOf: $asOf
      architectureDomainId: $architectureDomainId
      organizationUnitId: $organizationUnitId
    ) {
      id
      name
      lifecyclePhase
      validFrom
      validTo
    }
    allBuildingBlocks: buildingBlocks {
      id
      name
    }
    architectureDomains {
      id
      name
    }
    organizationUnits {
      id
      name
    }
  }
`;

interface LandscapeBlock {
  id: string;
  name: string;
  lifecyclePhase: string;
  validFrom?: string | null;
  validTo?: string | null;
}

interface ArchitectureLandscapeBlock extends LandscapeBlock {
  architectureLevel: ArchitectureLevel | null;
  realizedBy: Array<{ solutionBuildingBlockId: string }>;
}

interface LandscapeData {
  architectureLandscape: ArchitectureLandscapeBlock[];
  solutionsLandscape: LandscapeBlock[];
  allBuildingBlocks: Array<{ id: string; name: string }>;
  architectureDomains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
}

const selectClassName =
  'h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

function LandscapeRoute() {
  const [asOf, setAsOf] = useState('');
  const [architectureLevel, setArchitectureLevel] = useState<ArchitectureLevel | ''>('');
  const [architectureDomainId, setArchitectureDomainId] = useState('');
  const [organizationUnitId, setOrganizationUnitId] = useState('');

  const { data, loading, error } = useQuery<LandscapeData>(LANDSCAPE_QUERY, {
    variables: {
      asOf: asOf || undefined,
      architectureLevel: architectureLevel || undefined,
      architectureDomainId: architectureDomainId || undefined,
      organizationUnitId: organizationUnitId || undefined,
    },
  });

  const namesById = new Map((data?.allBuildingBlocks ?? []).map((b) => [b.id, b.name]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Landscape</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The Architecture Landscape (ABBs) and Solutions Landscape (SBBs), filtered by viewpoint:
          time, level of detail, architecture domain, and organization unit.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        <label
          htmlFor="landscape-as-of"
          className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
        >
          As of date
          <Input
            id="landscape-as-of"
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Architecture level
          <select
            className={selectClassName}
            value={architectureLevel}
            onChange={(e) => setArchitectureLevel(e.target.value as ArchitectureLevel | '')}
          >
            <option value="">All</option>
            <option value="STRATEGIC">Strategic</option>
            <option value="SEGMENT">Segment</option>
            <option value="CAPABILITY">Capability</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Architecture domain
          <select
            className={selectClassName}
            value={architectureDomainId}
            onChange={(e) => setArchitectureDomainId(e.target.value)}
          >
            <option value="">All</option>
            {(data?.architectureDomains ?? []).map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Organization unit
          <select
            className={selectClassName}
            value={organizationUnitId}
            onChange={(e) => setOrganizationUnitId(e.target.value)}
          >
            <option value="">All</option>
            {(data?.organizationUnits ?? []).map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load the landscape.</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Architecture Landscape ({data?.architectureLandscape.length ?? 0})
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Realized by</th>
                </tr>
              </thead>
              <tbody>
                {(data?.architectureLandscape ?? []).map((block) => (
                  <tr key={block.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-foreground">{block.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {block.architectureLevel ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {block.realizedBy.length === 0
                        ? '—'
                        : block.realizedBy
                            .map(
                              (r) =>
                                namesById.get(r.solutionBuildingBlockId) ??
                                r.solutionBuildingBlockId,
                            )
                            .join(', ')}
                    </td>
                  </tr>
                ))}
                {data?.architectureLandscape.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No architecture building blocks for this viewpoint.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Solutions Landscape ({data?.solutionsLandscape.length ?? 0})
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                {(data?.solutionsLandscape ?? []).map((block) => (
                  <tr key={block.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-foreground">{block.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{block.lifecyclePhase}</td>
                  </tr>
                ))}
                {data?.solutionsLandscape.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No solution building blocks for this viewpoint.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/landscape/')({
  component: LandscapeRoute,
});
