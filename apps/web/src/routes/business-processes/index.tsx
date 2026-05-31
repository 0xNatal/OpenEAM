import { createFileRoute, Link } from '@tanstack/react-router';
import { BUSINESS_PROCESSES } from '@/data/business-processes';
import { getCapability } from '@/data/capabilities';

function BusinessProcessesIndexRoute() {
  const grouped = BUSINESS_PROCESSES.reduce<Record<string, typeof BUSINESS_PROCESSES>>(
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Processes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational processes that deliver business capabilities.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([capabilityId, processes]) => {
          const cap = getCapability(capabilityId);
          return (
            <div key={capabilityId}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {cap?.name ?? capabilityId}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {processes.map((process) => (
                  <Link
                    key={process.id}
                    to="/business-processes/$processId"
                    params={{ processId: process.id }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-xs"
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
