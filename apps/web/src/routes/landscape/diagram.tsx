import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type CSSProperties, lazy, Suspense, useEffect, useMemo, useState } from 'react';
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

// Pins the filter bar's theme tokens to their light-mode values (from
// index.css's :root block). The filter pill floats over the diagram
// surface, which stays light in both themes (see landscape-diagram.tsx) —
// without this, LandscapeFilters' dark-mode muted-foreground/border/input
// tokens would wash out against that white background.
const LIGHT_FILTER_TOKENS = {
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--border': 'oklch(0.922 0 0)',
  '--input': 'oklch(0.922 0 0)',
  '--ring': 'oklch(0.708 0 0)',
} as CSSProperties;

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

  // index.css reserves scrollbar width on every page (scrollbar-gutter:
  // stable) so centered content doesn't shift depending on whether a page
  // happens to scroll. This page never scrolls at the body level — the
  // canvas pans/zooms internally — so that reservation is just a dead
  // strip on the right the diagram can't use. Scoped to this route's
  // lifetime rather than touching the global rule, since every other page
  // still wants it.
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'auto';
    return () => {
      document.documentElement.style.scrollbarGutter = '';
    };
  }, []);
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
            filtering doesn't cost the diagram any vertical space. Styled
            light-and-solid regardless of theme, matching the diagram
            surface underneath it (always light — see landscape-diagram.tsx)
            so it stays legible as nodes pan behind it. */}
        <div
          className="absolute left-4 top-4 z-10 flex items-center gap-4 rounded-full border border-neutral-200 bg-white/95 px-4 py-2 text-neutral-900 shadow-sm backdrop-blur"
          style={LIGHT_FILTER_TOKENS}
        >
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
