import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  CapabilityFormSheet,
  DELETE_BUSINESS_CAPABILITY,
} from '@/components/capabilities/capability-form-sheet';
import { Button } from '@/components/ui/button';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import { CAPABILITY_DIRECTION_LABEL, CAPABILITY_DIRECTION_STYLE } from '@/lib/capability-direction';
import { useEnterprise } from '@/lib/enterprise';
import type { BusinessCapabilitySummary } from '@/lib/entities';

const BUSINESS_CAPABILITIES_QUERY = gql`
  query BusinessCapabilities($enterpriseId: String!) {
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
      description
      direction
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

function CapabilityCard({
  cap,
  onEdit,
  onDelete,
}: {
  cap: BusinessCapabilitySummary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [firstStage, ...restStages] = cap.valueStreamStages;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-sm shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/capabilities/$capabilityId"
            params={{ capabilityId: cap.id }}
            className="truncate font-medium text-foreground hover:text-foreground"
          >
            {cap.name}
          </Link>
          {cap.direction && (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${CAPABILITY_DIRECTION_STYLE[cap.direction]}`}
            >
              {CAPABILITY_DIRECTION_LABEL[cap.direction]}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

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
    </div>
  );
}

function CapabilitiesIndexRoute() {
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<BusinessCapabilitiesData>(
    BUSINESS_CAPABILITIES_QUERY,
    { variables: { enterpriseId: enterprise?.id }, skip: !enterprise },
  );
  const [deleteBusinessCapability] = useMutation(DELETE_BUSINESS_CAPABILITY, {
    update(cache, _result, { variables }) {
      if (!variables?.id) return;
      cache.evict({ id: cache.identify({ __typename: 'BusinessCapability', id: variables.id }) });
      cache.gc();
    },
  });

  const [editingCap, setEditingCap] = useState<BusinessCapabilitySummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const openCreate = () => {
    setCreating(true);
    setEditingCap(null);
    setSheetOpen(true);
  };

  const openEdit = (cap: BusinessCapabilitySummary) => {
    setCreating(false);
    setEditingCap(cap);
    setSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this business capability?')) return;
    await deleteBusinessCapability({ variables: { id } });
    await refetch();
  };

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title="Business Capabilities"
        action={
          <Button onClick={openCreate} disabled={!enterprise}>
            New capability
          </Button>
        }
      />

      {!enterprise && !loading && (
        <p className="text-sm text-muted-foreground">Create an enterprise to get started.</p>
      )}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load capabilities.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.businessCapabilities.map((cap) => (
          <CapabilityCard
            key={cap.id}
            cap={cap}
            onEdit={() => openEdit(cap)}
            onDelete={() => handleDelete(cap.id)}
          />
        ))}
        {data?.businessCapabilities.length === 0 && (
          <p className="text-sm text-muted-foreground">No business capabilities yet.</p>
        )}
      </div>

      {enterprise && (
        <CapabilityFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          capability={creating ? null : editingCap}
          enterpriseId={enterprise.id}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/capabilities/')({
  component: CapabilitiesIndexRoute,
});
