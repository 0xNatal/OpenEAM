import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import {
  contentWidthClassName,
  PageHeader,
  pageBackLinkClassName,
} from '@/components/ui/page-header';
import { ValueStreamDiagram } from '@/components/value-stream/diagram';
import type { ValueStream, ValueStreamCapability } from '@/lib/entities';

const VALUE_STREAM_QUERY = gql`
  query ValueStreamDetail($id: String!) {
    valueStream(id: $id) {
      id
      enterpriseId
      name
      description
      stages {
        id
        name
        capabilityIds
      }
    }
  }
`;

// Scoped to the value stream's own enterprise, not the switcher's current one,
// so a direct link renders correctly regardless of context.
const STREAM_CAPABILITIES_QUERY = gql`
  query ValueStreamCapabilities($enterpriseId: String!) {
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
      description
    }
  }
`;

interface ValueStreamDetailData {
  valueStream: (ValueStream & { enterpriseId: string }) | null;
}

interface StreamCapabilitiesData {
  businessCapabilities: ValueStreamCapability[];
}

function ValueStreamDetailRoute() {
  const { valueStreamId } = Route.useParams();
  const { data, loading, error } = useQuery<ValueStreamDetailData>(VALUE_STREAM_QUERY, {
    variables: { id: valueStreamId },
  });
  const enterpriseId = data?.valueStream?.enterpriseId;
  const { data: capsData } = useQuery<StreamCapabilitiesData>(STREAM_CAPABILITIES_QUERY, {
    variables: { enterpriseId },
    skip: !enterpriseId,
  });

  if (loading) return <p className="px-6 py-8 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="px-6 py-8 text-sm text-destructive">Failed to load value stream.</p>;
  if (!data?.valueStream) throw notFound();

  const stream = data.valueStream;

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title={stream.name}
        back={
          <Link to="/value-streams" className={pageBackLinkClassName}>
            <ChevronLeft className="size-3.5" />
            Value Streams
          </Link>
        }
      />

      {/* Diagram */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 shadow-xs">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Click a stage to explore its business capabilities and business processes
        </p>
        <ValueStreamDiagram stream={stream} capabilities={capsData?.businessCapabilities ?? []} />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/value-streams/$valueStreamId')({
  component: ValueStreamDetailRoute,
});
