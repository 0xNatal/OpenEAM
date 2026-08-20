import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  contentWidthClassName,
  PageHeader,
  pageBackLinkClassName,
} from '@/components/ui/page-header';
import { ValueStreamDiagram } from '@/components/value-stream/diagram';
import {
  DELETE_VALUE_STREAM,
  ValueStreamFormSheet,
} from '@/components/value-stream/value-stream-form-sheet';
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
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery<ValueStreamDetailData>(VALUE_STREAM_QUERY, {
    variables: { id: valueStreamId },
  });
  const enterpriseId = data?.valueStream?.enterpriseId;
  const { data: capsData } = useQuery<StreamCapabilitiesData>(STREAM_CAPABILITIES_QUERY, {
    variables: { enterpriseId },
    skip: !enterpriseId,
  });
  const [deleteValueStream] = useMutation(DELETE_VALUE_STREAM);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this value stream?')) return;
    await deleteValueStream({ variables: { id: valueStreamId } });
    navigate({ to: '/value-streams' });
  };

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
        action={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      />

      {/* Diagram */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 shadow-xs">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Click a stage to explore its business capabilities and business processes
        </p>
        <ValueStreamDiagram stream={stream} capabilities={capsData?.businessCapabilities ?? []} />
      </div>

      <ValueStreamFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        enterpriseId={stream.enterpriseId}
        capabilities={capsData?.businessCapabilities ?? []}
        valueStream={stream}
        onSaved={refetch}
      />
    </div>
  );
}

export const Route = createFileRoute('/value-streams/$valueStreamId')({
  component: ValueStreamDetailRoute,
});
