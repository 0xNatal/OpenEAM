import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  EMPTY_LANDSCAPE_FILTERS,
  LandscapeFilters,
  type LandscapeFilterValues,
} from '@/components/landscape/landscape-filters';
import { Button } from '@/components/ui/button';
import { useEnterprise } from '@/lib/enterprise';
import type { ArchitectureDomain, ArchitectureLevel, OrganizationUnit } from '@/lib/entities';

const LANDSCAPE_QUERY = gql`
  query Landscape(
    $enterpriseId: String!
    $asOf: String
    $architectureLevel: ArchitectureLevel
    $architectureDomainId: String
    $organizationUnitId: String
  ) {
    architectureLandscape(
      enterpriseId: $enterpriseId
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
      enterpriseId: $enterpriseId
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
    allBuildingBlocks: buildingBlocks(enterpriseId: $enterpriseId) {
      id
      name
    }
    architectureDomains(enterpriseId: $enterpriseId) {
      id
      name
    }
    organizationUnits(enterpriseId: $enterpriseId) {
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

function LandscapeRoute() {
  const [filters, setFilters] = useState<LandscapeFilterValues>(EMPTY_LANDSCAPE_FILTERS);

  const { enterprise } = useEnterprise();
  const { data, loading, error } = useQuery<LandscapeData>(LANDSCAPE_QUERY, {
    variables: {
      enterpriseId: enterprise?.id,
      asOf: filters.asOf || undefined,
      architectureLevel: filters.architectureLevel || undefined,
      architectureDomainId: filters.architectureDomainId || undefined,
      organizationUnitId: filters.organizationUnitId || undefined,
    },
    skip: !enterprise,
  });

  const namesById = new Map((data?.allBuildingBlocks ?? []).map((b) => [b.id, b.name]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Landscape</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The Architecture Landscape (ABBs) and Solutions Landscape (SBBs), filtered by viewpoint:
            time, level of detail, architecture domain, and organization unit.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/landscape/diagram">View as diagram →</Link>
        </Button>
      </div>

      <div className="mb-6">
        <LandscapeFilters
          value={filters}
          onChange={setFilters}
          architectureDomains={data?.architectureDomains ?? []}
          organizationUnits={data?.organizationUnits ?? []}
        />
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
