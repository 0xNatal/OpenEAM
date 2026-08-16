import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { DiagramEdge, DiagramNode } from '@/components/landscape/landscape-diagram';
import {
  EMPTY_LANDSCAPE_FILTERS,
  LandscapeFilters,
  type LandscapeFilterValues,
} from '@/components/landscape/landscape-filters';
import { Button } from '@/components/ui/button';
import { useEnterprise } from '@/lib/enterprise';
import type {
  ArchitectureDomain,
  BuildingBlockRelationship,
  OrganizationUnit,
} from '@/lib/entities';

// diagram-js + elkjs are heavy; only load them when this route is visited.
const LandscapeDiagram = lazy(() => import('@/components/landscape/landscape-diagram'));

const LANDSCAPE_DIAGRAM_QUERY = gql`
  query LandscapeDiagram(
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
      realizedBy {
        solutionBuildingBlockId
      }
      outgoingRelationships {
        id
        targetBuildingBlockId
        type
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
      outgoingRelationships {
        id
        targetBuildingBlockId
        type
      }
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

interface LandscapeDiagramBlock {
  id: string;
  name: string;
  outgoingRelationships: Array<
    Pick<BuildingBlockRelationship, 'id' | 'targetBuildingBlockId' | 'type'>
  >;
}

interface ArchitectureDiagramBlock extends LandscapeDiagramBlock {
  realizedBy: Array<{ solutionBuildingBlockId: string }>;
}

interface LandscapeDiagramData {
  architectureLandscape: ArchitectureDiagramBlock[];
  solutionsLandscape: LandscapeDiagramBlock[];
  architectureDomains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
}

function toDiagramGraph(data: LandscapeDiagramData | undefined): {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} {
  if (!data) return { nodes: [], edges: [] };

  const nodes: DiagramNode[] = [
    ...data.architectureLandscape.map((b) => ({
      id: b.id,
      label: b.name,
      kind: 'architecture' as const,
    })),
    ...data.solutionsLandscape.map((b) => ({ id: b.id, label: b.name, kind: 'solution' as const })),
  ];

  const edges: DiagramEdge[] = [];
  for (const block of data.architectureLandscape) {
    for (const link of block.realizedBy) {
      edges.push({
        id: `realization-${block.id}-${link.solutionBuildingBlockId}`,
        sourceId: block.id,
        targetId: link.solutionBuildingBlockId,
        kind: 'realization',
      });
    }
  }
  for (const block of [...data.architectureLandscape, ...data.solutionsLandscape]) {
    for (const rel of block.outgoingRelationships) {
      edges.push({
        id: rel.id,
        sourceId: block.id,
        targetId: rel.targetBuildingBlockId,
        kind: rel.type === 'DATA_FLOW' ? 'data_flow' : 'depends_on',
      });
    }
  }

  return { nodes, edges };
}

function LandscapeDiagramRoute() {
  const [filters, setFilters] = useState<LandscapeFilterValues>(EMPTY_LANDSCAPE_FILTERS);

  const { enterprise } = useEnterprise();
  const { data, loading, error } = useQuery<LandscapeDiagramData>(LANDSCAPE_DIAGRAM_QUERY, {
    variables: {
      enterpriseId: enterprise?.id,
      asOf: filters.asOf || undefined,
      architectureLevel: filters.architectureLevel || undefined,
      architectureDomainId: filters.architectureDomainId || undefined,
      organizationUnitId: filters.organizationUnitId || undefined,
    },
    skip: !enterprise,
  });

  const { nodes, edges } = useMemo(() => toDiagramGraph(data), [data]);

  return (
    // Fill the viewport below the app header (h-14) minus the main padding
    // (p-6): the diagram canvas needs a bounded height to lay out, same
    // reasoning as the BPMN model editor route.
    <div className="flex h-[calc(100vh-6.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button asChild variant="ghost">
          <Link to="/landscape">← Back to Landscape</Link>
        </Button>
        <p className="text-sm font-semibold text-foreground">Landscape — Diagram</p>
      </div>
      <div className="border-b border-border p-3">
        <LandscapeFilters
          value={filters}
          onChange={setFilters}
          architectureDomains={data?.architectureDomains ?? []}
          organizationUnits={data?.organizationUnits ?? []}
        />
      </div>
      {error && <p className="px-4 py-2 text-xs text-destructive">Failed to load the landscape.</p>}
      <div className="min-h-0 flex-1">
        {loading && !data ? (
          <p className="p-4 text-xs text-muted-foreground italic">Loading…</p>
        ) : (
          <Suspense
            fallback={<p className="p-4 text-xs text-muted-foreground italic">Loading diagram…</p>}
          >
            <LandscapeDiagram nodes={nodes} edges={edges} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/landscape/diagram')({
  component: LandscapeDiagramRoute,
});
