import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { ValueStreamDiagram } from '@/components/value-stream/diagram';
import type { BusinessCapabilityWithProcesses, ValueStream } from '@/lib/entities';

const VALUE_STREAM_QUERY = gql`
  query ValueStreamDetail($id: String!) {
    valueStream(id: $id) {
      id
      name
      description
      stages {
        id
        name
        capabilityIds
      }
    }
    businessCapabilities {
      id
      name
      businessProcesses {
        id
        name
      }
    }
  }
`;

interface ValueStreamDetailData {
  valueStream: ValueStream | null;
  businessCapabilities: BusinessCapabilityWithProcesses[];
}

function ValueStreamDetailRoute() {
  const { valueStreamId } = Route.useParams();
  const { data, loading, error } = useQuery<ValueStreamDetailData>(VALUE_STREAM_QUERY, {
    variables: { id: valueStreamId },
  });

  if (loading) return <p className="px-6 py-10 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="px-6 py-10 text-sm text-destructive">Failed to load value stream.</p>;
  if (!data?.valueStream) throw notFound();

  const stream = data.valueStream;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Back + header */}
      <div className="mb-8">
        <Link
          to="/value-streams"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-4"
        >
          <ChevronLeft className="size-3.5" />
          Value Streams
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">{stream.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{stream.description}</p>
      </div>

      {/* Diagram */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 shadow-xs">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Click a stage to explore its business capabilities and business processes
        </p>
        <ValueStreamDiagram stream={stream} capabilities={data.businessCapabilities} />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/value-streams/$valueStreamId')({
  component: ValueStreamDetailRoute,
});
