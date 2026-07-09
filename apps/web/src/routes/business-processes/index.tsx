import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { NamedRef } from '@/lib/entities';

const BUSINESS_PROCESSES_QUERY = gql`
  query BusinessProcessesIndex {
    businessProcesses {
      id
      name
      capabilityId
    }
    businessCapabilities {
      id
      name
    }
  }
`;

interface BusinessProcessRef extends NamedRef {
  capabilityId: string;
}

interface BusinessProcessesData {
  businessProcesses: BusinessProcessRef[];
  businessCapabilities: NamedRef[];
}

function BusinessProcessesIndexRoute() {
  const { data, loading, error } = useQuery<BusinessProcessesData>(BUSINESS_PROCESSES_QUERY);

  const capabilitiesById = new Map((data?.businessCapabilities ?? []).map((c) => [c.id, c]));
  const grouped = (data?.businessProcesses ?? []).reduce<Record<string, BusinessProcessRef[]>>(
    (acc, process) => {
      const key = process.capabilityId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(process);
      return acc;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Processes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational processes that deliver business capabilities.
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load business processes.</p>}

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([capabilityId, processes]) => {
          const cap = capabilitiesById.get(capabilityId);
          return (
            <div key={capabilityId}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cap?.name ?? capabilityId}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {processes.map((process) => (
                  <Link
                    key={process.id}
                    to="/business-processes/$processId"
                    params={{ processId: process.id }}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300 transition-colors shadow-xs"
                  >
                    {process.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/business-processes/')({
  component: BusinessProcessesIndexRoute,
});
