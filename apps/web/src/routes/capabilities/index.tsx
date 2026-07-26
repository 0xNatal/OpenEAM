import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { BusinessCapabilitySummary } from '@/lib/entities';

const BUSINESS_CAPABILITIES_QUERY = gql`
  query BusinessCapabilities {
    businessCapabilities {
      id
      name
      description
      businessProcesses {
        id
      }
      resources {
        id
      }
      valueStreamStages {
        valueStreamId
        valueStreamName
        stageId
        stageName
      }
    }
  }
`;

interface BusinessCapabilitiesData {
  businessCapabilities: BusinessCapabilitySummary[];
}

function CapabilityCard({ cap }: { cap: BusinessCapabilitySummary }) {
  const [firstStage, ...restStages] = cap.valueStreamStages;

  return (
    <Link
      to="/capabilities/$capabilityId"
      params={{ capabilityId: cap.id }}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-sm hover:border-violet-300 dark:hover:border-violet-700 transition-colors shadow-xs"
    >
      <span className="font-medium text-foreground hover:text-violet-700 dark:hover:text-violet-300">
        {cap.name}
      </span>

      {cap.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{cap.description}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {firstStage ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            {firstStage.valueStreamName} <span className="opacity-60">›</span>{' '}
            {firstStage.stageName}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">No value stream yet</span>
        )}
        {restStages.length > 0 && (
          <span className="text-[10px] text-muted-foreground">+{restStages.length} more</span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>
          {cap.businessProcesses.length} process{cap.businessProcesses.length === 1 ? '' : 'es'}
        </span>
        <span>
          {cap.resources.length} resource{cap.resources.length === 1 ? '' : 's'}
        </span>
      </div>
    </Link>
  );
}

function CapabilitiesIndexRoute() {
  const { data, loading, error } = useQuery<BusinessCapabilitiesData>(BUSINESS_CAPABILITIES_QUERY);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Capabilities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business capabilities shared across value streams.
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load capabilities.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.businessCapabilities.map((cap) => (
          <CapabilityCard key={cap.id} cap={cap} />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/capabilities/')({
  component: CapabilitiesIndexRoute,
});
