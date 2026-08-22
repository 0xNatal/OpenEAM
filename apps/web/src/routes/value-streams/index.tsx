import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import {
  DELETE_VALUE_STREAM,
  ValueStreamFormSheet,
  type ValueStreamFormValue,
} from '@/components/value-stream/value-stream-form-sheet';
import { useEnterprise } from '@/lib/enterprise';

const VALUE_STREAMS_QUERY = gql`
  query ValueStreamsIndex($enterpriseId: String!) {
    valueStreams(enterpriseId: $enterpriseId) {
      id
      name
      description
      stages {
        id
        name
        capabilityIds
      }
    }
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
    }
  }
`;

interface ValueStreamSummary extends ValueStreamFormValue {
  stages: Array<{ id: string; name: string; capabilityIds: string[] }>;
}

interface ValueStreamsData {
  valueStreams: ValueStreamSummary[];
  businessCapabilities: { id: string; name: string }[];
}

function ValueStreamCard({
  vs,
  onEdit,
  onDelete,
}: {
  vs: ValueStreamSummary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Pencil strokeWidth={2} />
          <span className="sr-only">Edit</span>
        </Button>
        <Button variant="destructive" size="icon-sm" onClick={onDelete}>
          <Trash2 strokeWidth={2} />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      <Link
        to="/value-streams/$valueStreamId"
        params={{ valueStreamId: vs.id }}
        className="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-border bg-card px-4 py-4 shadow-xs transition-all duration-150 group-hover:border-violet-300 group-hover:shadow-md dark:group-hover:border-violet-700"
      >
        <h2 className="text-base font-semibold text-foreground transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300">
          {vs.name}
        </h2>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400">
          Explore <ArrowRight className="size-3" />
        </span>
      </Link>
    </div>
  );
}

function ValueStreamsIndexRoute() {
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<ValueStreamsData>(VALUE_STREAMS_QUERY, {
    variables: { enterpriseId: enterprise?.id },
    skip: !enterprise,
  });
  const [deleteValueStream] = useMutation(DELETE_VALUE_STREAM, {
    update(cache, _result, { variables }) {
      if (!variables?.id) return;
      cache.evict({ id: cache.identify({ __typename: 'ValueStream', id: variables.id }) });
      cache.gc();
    },
  });

  const [editingStream, setEditingStream] = useState<ValueStreamSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openCreate = () => {
    setEditingStream(null);
    setSheetOpen(true);
  };

  const openEdit = (vs: ValueStreamSummary) => {
    setEditingStream(vs);
    setSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this value stream?')) return;
    await deleteValueStream({ variables: { id } });
    await refetch();
  };

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title="Value Streams"
        action={
          <Button onClick={openCreate} disabled={!enterprise}>
            New value stream
          </Button>
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load value streams.</p>}
      {data?.valueStreams.length === 0 && (
        <p className="text-sm text-muted-foreground">No value streams yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.valueStreams.map((vs) => (
          <ValueStreamCard
            key={vs.id}
            vs={vs}
            onEdit={() => openEdit(vs)}
            onDelete={() => handleDelete(vs.id)}
          />
        ))}
      </div>

      {enterprise && (
        <ValueStreamFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          enterpriseId={enterprise.id}
          capabilities={data?.businessCapabilities ?? []}
          valueStream={editingStream}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/value-streams/')({
  component: ValueStreamsIndexRoute,
});
