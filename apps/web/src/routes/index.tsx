// Home route ("/"): an at-a-glance overview of the current enterprise —
// headline counts, and anything that looks unfinished (a capability with no
// value stream, a process with no diagram) so it's the first thing you see.
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import { useEnterprise } from '@/lib/enterprise';

const OVERVIEW_QUERY = gql`
  query EnterpriseOverview($enterpriseId: String!) {
    valueStreams(enterpriseId: $enterpriseId) {
      id
    }
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
      valueStreamStages {
        valueStreamId
      }
    }
    businessProcesses(enterpriseId: $enterpriseId) {
      id
      name
      bpmnXml
    }
    buildingBlocks(enterpriseId: $enterpriseId) {
      id
      lifecyclePhase
      __typename
    }
  }
`;

interface OverviewCapability {
  id: string;
  name: string;
  valueStreamStages: { valueStreamId: string }[];
}

interface OverviewProcess {
  id: string;
  name: string;
  bpmnXml?: string | null;
}

interface OverviewBuildingBlock {
  id: string;
  lifecyclePhase: string;
  __typename: 'ArchitectureBuildingBlock' | 'SolutionBuildingBlock';
}

interface OverviewData {
  valueStreams: { id: string }[];
  businessCapabilities: OverviewCapability[];
  businessProcesses: OverviewProcess[];
  buildingBlocks: OverviewBuildingBlock[];
}

const LIFECYCLE_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PLANNED: 'Planned',
  PHASING_OUT: 'Phasing out',
  RETIRED: 'Retired',
};

function StatTile({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-violet-300 dark:hover:border-violet-700"
    >
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
  );
}

function HomeRoute() {
  const { enterprise, loading: enterpriseLoading } = useEnterprise();
  const { data, loading } = useQuery<OverviewData>(OVERVIEW_QUERY, {
    variables: { enterpriseId: enterprise?.id },
    skip: !enterprise,
  });

  const capabilitiesWithoutStream = (data?.businessCapabilities ?? []).filter(
    (c) => c.valueStreamStages.length === 0,
  );
  const processesWithoutDiagram = (data?.businessProcesses ?? []).filter((p) => !p.bpmnXml);

  const lifecycleCounts = (data?.buildingBlocks ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.lifecyclePhase] = (acc[b.lifecyclePhase] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className={contentWidthClassName}>
      <PageHeader title={enterprise?.name ?? 'Overview'} />

      {!enterpriseLoading && !enterprise && (
        <p className="text-sm text-muted-foreground">
          No enterprise yet — create one from the switcher in the sidebar to get started.
        </p>
      )}

      {enterprise?.goal && <p className="mb-6 text-sm text-muted-foreground">{enterprise.goal}</p>}

      {enterprise && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              label="Value streams"
              value={data?.valueStreams.length ?? 0}
              to="/value-streams"
            />
            <StatTile
              label="Business capabilities"
              value={data?.businessCapabilities.length ?? 0}
              to="/capabilities"
            />
            <StatTile
              label="Business processes"
              value={data?.businessProcesses.length ?? 0}
              to="/business-processes"
            />
            <StatTile
              label="Building blocks"
              value={data?.buildingBlocks.length ?? 0}
              to="/building-blocks"
            />
          </div>

          {!loading && Object.keys(lifecycleCounts).length > 0 && (
            <div className="mb-8">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Building blocks by lifecycle
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-foreground">
                {Object.entries(lifecycleCounts).map(([phase, count]) => (
                  <span key={phase}>
                    {LIFECYCLE_LABELS[phase] ?? phase}{' '}
                    <span className="text-muted-foreground">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            (capabilitiesWithoutStream.length > 0 || processesWithoutDiagram.length > 0) && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Needs attention
                </h2>
                <div className="flex flex-col gap-2">
                  {capabilitiesWithoutStream.map((c) => (
                    <Link
                      key={c.id}
                      to="/capabilities/$capabilityId"
                      params={{ capabilityId: c.id }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm hover:border-violet-300 dark:hover:border-violet-700"
                    >
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground italic">
                        Not part of any value stream
                      </span>
                    </Link>
                  ))}
                  {processesWithoutDiagram.map((p) => (
                    <Link
                      key={p.id}
                      to="/business-processes/$processId"
                      params={{ processId: p.id }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm hover:border-violet-300 dark:hover:border-violet-700"
                    >
                      <span className="text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground italic">No diagram yet</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomeRoute,
});
