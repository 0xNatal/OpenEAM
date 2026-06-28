import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { MiniChevronStrip } from '@/components/value-stream/diagram';

const VALUE_STREAMS_QUERY = gql`
  query ValueStreamsIndex {
    valueStreams {
      id
      name
      description
      stages {
        id
        name
      }
    }
  }
`;

interface ValueStreamSummary {
  id: string;
  name: string;
  description?: string | null;
  stages: { id: string; name: string }[];
}

interface ValueStreamsData {
  valueStreams: ValueStreamSummary[];
}

function ValueStreamsIndexRoute() {
  const { data, loading, error } = useQuery<ValueStreamsData>(VALUE_STREAMS_QUERY);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Value Streams</h1>
        <p className="mt-1 text-sm text-slate-500">
          End-to-end flows that deliver value to stakeholders of this enterprise.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load value streams.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.valueStreams.map((vs) => (
          <Link
            key={vs.id}
            to="/value-streams/$valueStreamId"
            params={{ valueStreamId: vs.id }}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden hover:border-violet-300 hover:shadow-md transition-all duration-150"
          >
            {/* Mini chevron strip preview */}
            <div className="px-4 pt-4 pb-2">
              <MiniChevronStrip stages={vs.stages.map((s) => s.name)} />
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 gap-3 px-4 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
                  {vs.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {vs.description}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  {vs.stages.length} stages
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/value-streams/')({
  component: ValueStreamsIndexRoute,
});
