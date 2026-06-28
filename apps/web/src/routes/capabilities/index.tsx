import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { NamedRef } from '@/lib/entities';

const BUSINESS_CAPABILITIES_QUERY = gql`
  query BusinessCapabilities {
    businessCapabilities {
      id
      name
    }
  }
`;

interface BusinessCapabilitiesData {
  businessCapabilities: NamedRef[];
}

function CapabilitiesIndexRoute() {
  const { data, loading, error } = useQuery<BusinessCapabilitiesData>(BUSINESS_CAPABILITIES_QUERY);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Capabilities</h1>
        <p className="mt-1 text-sm text-slate-500">
          Business capabilities shared across value streams.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load capabilities.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data?.businessCapabilities.map((cap) => (
          <Link
            key={cap.id}
            to="/capabilities/$capabilityId"
            params={{ capabilityId: cap.id }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-xs"
          >
            {cap.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/capabilities/')({
  component: CapabilitiesIndexRoute,
});
