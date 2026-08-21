import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useMemo, useState } from 'react';
import type {
  DiagramEdge,
  DiagramEdgeKind,
  DiagramNode,
} from '@/components/landscape/landscape-diagram';
import {
  EMPTY_LANDSCAPE_FILTERS,
  LandscapeFilters,
  type LandscapeFilterValues,
} from '@/components/landscape/landscape-filters';
import { fullBleedCanvasClassName } from '@/components/ui/page-header';
import { useEnterprise } from '@/lib/enterprise';
import type {
  ArchitectureDomain,
  BuildingBlockRelationship,
  OrganizationUnit,
} from '@/lib/entities';

// diagram-js + elkjs are heavy; only load them when this route is visited.
const LandscapeDiagram = lazy(() => import('@/components/landscape/landscape-diagram'));

// Architecture building blocks (needed capabilities) deliberately aren't
// queried or rendered here — this diagram is the concrete technical
// landscape (solution building blocks and how they relate/host each other),
// not the abstract capability layer. See docs discussion: an ABB like
// "Guest Communication" duplicates its business capability 1:1 and adds
// noise without adding a distinct fact to this view.
const LANDSCAPE_DIAGRAM_QUERY = gql`
  query LandscapeDiagram(
    $enterpriseId: String!
    $asOf: String
    $architectureDomainId: String
    $organizationUnitId: String
  ) {
    solutionsLandscape(
      enterpriseId: $enterpriseId
      asOf: $asOf
      architectureDomainId: $architectureDomainId
      organizationUnitId: $organizationUnitId
    ) {
      id
      name
      architectureDomainIds
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
  architectureDomainIds: string[];
  outgoingRelationships: Array<
    Pick<BuildingBlockRelationship, 'id' | 'targetBuildingBlockId' | 'type'>
  >;
}

interface LandscapeDiagramData {
  solutionsLandscape: LandscapeDiagramBlock[];
  architectureDomains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
}

const RELATIONSHIP_KIND_BY_TYPE: Record<BuildingBlockRelationship['type'], DiagramEdgeKind> = {
  DEPENDS_ON: 'depends_on',
  DATA_FLOW: 'data_flow',
  HOSTED_ON: 'hosted_on',
};

function toDiagramGraph(data: LandscapeDiagramData | undefined): {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} {
  if (!data) return { nodes: [], edges: [] };

  const domainNameById = new Map(data.architectureDomains.map((d) => [d.id, d.name]));

  const nodes: DiagramNode[] = data.solutionsLandscape.map((b) => ({
    id: b.id,
    label: b.name,
    kind: 'solution' as const,
    domainName: b.architectureDomainIds[0]
      ? domainNameById.get(b.architectureDomainIds[0])
      : undefined,
  }));

  const edges: DiagramEdge[] = [];
  for (const block of data.solutionsLandscape) {
    for (const rel of block.outgoingRelationships) {
      edges.push({
        id: rel.id,
        sourceId: block.id,
        targetId: rel.targetBuildingBlockId,
        kind: RELATIONSHIP_KIND_BY_TYPE[rel.type],
      });
    }
  }

  return { nodes, edges };
}

function LandscapeDiagramRoute() {
  const [filters, setFilters] = useState<LandscapeFilterValues>({
    ...EMPTY_LANDSCAPE_FILTERS,
    asOf: new Date().toISOString().slice(0, 10),
  });

  const { enterprise } = useEnterprise();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<LandscapeDiagramData>(LANDSCAPE_DIAGRAM_QUERY, {
    variables: {
      enterpriseId: enterprise?.id,
      asOf: filters.asOf || undefined,
      architectureDomainId: filters.architectureDomainId || undefined,
      organizationUnitId: filters.organizationUnitId || undefined,
    },
    skip: !enterprise,
  });

  const { nodes, edges } = useMemo(() => toDiagramGraph(data), [data]);

  return (
    // Full-bleed: no max-width, no page header/title/toggle (the table
    // lives at its own nav entry now, see app-shell.tsx), and no padding of
    // its own beyond what cancels out <main>'s — this is the flagship view,
    // so it gets every pixel of the content area, flush on all four sides.
    <div className={fullBleedCanvasClassName}>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
        {/* Floating over the canvas rather than occupying its own row, so
            filtering doesn't cost the diagram any vertical space. Plain
            themed tokens (bg-card/border-border) — the diagram surface
            underneath follows the theme too now, so there's no light/dark
            mismatch to work around here. */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-4 rounded-xl border border-border bg-card/95 px-4 py-2 text-foreground shadow-sm backdrop-blur">
          <LandscapeFilters
            value={filters}
            onChange={setFilters}
            architectureDomains={data?.architectureDomains ?? []}
            organizationUnits={data?.organizationUnits ?? []}
            hideArchitectureLevel
          />
        </div>
        {error && (
          <p className="px-4 py-2 text-xs text-destructive">Failed to load the landscape.</p>
        )}
        <div className="min-h-0 flex-1">
          {loading && !data ? (
            <p className="p-4 text-xs text-muted-foreground italic">Loading…</p>
          ) : (
            <Suspense
              fallback={
                <p className="p-4 text-xs text-muted-foreground italic">Loading diagram…</p>
              }
            >
              <LandscapeDiagram
                nodes={nodes}
                edges={edges}
                onNodeClick={(nodeId) =>
                  navigate({
                    to: '/building-blocks/$buildingBlockId',
                    params: { buildingBlockId: nodeId },
                  })
                }
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/landscape/diagram')({
  component: LandscapeDiagramRoute,
});
