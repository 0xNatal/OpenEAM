import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  DELETE_BUSINESS_PROCESS,
  ProcessFormSheet,
} from '@/components/business-processes/process-form-sheet';
import { Button } from '@/components/ui/button';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import { useEnterprise } from '@/lib/enterprise';
import type { NamedRef } from '@/lib/entities';

const BUSINESS_PROCESSES_QUERY = gql`
  query BusinessProcessesIndex($enterpriseId: String!) {
    businessProcesses(enterpriseId: $enterpriseId) {
      id
      name
      description
      capabilityId
      triggerEvent
      outcome
      bpmnXml
    }
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
    }
  }
`;

interface BusinessProcessRef extends NamedRef {
  description?: string | null;
  capabilityId: string;
  triggerEvent?: string | null;
  outcome?: string | null;
  bpmnXml?: string | null;
}

interface BusinessProcessesData {
  businessProcesses: BusinessProcessRef[];
  businessCapabilities: NamedRef[];
}

function ProcessCard({
  process,
  onEdit,
  onDelete,
}: {
  process: BusinessProcessRef;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/business-processes/$processId"
          params={{ processId: process.id }}
          className="font-medium text-foreground hover:text-violet-700 dark:hover:text-violet-300"
        >
          {process.name}
        </Link>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
      {!process.bpmnXml && (
        <span className="w-fit rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground italic">
          No diagram yet
        </span>
      )}
    </div>
  );
}

function BusinessProcessesIndexRoute() {
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<BusinessProcessesData>(
    BUSINESS_PROCESSES_QUERY,
    { variables: { enterpriseId: enterprise?.id }, skip: !enterprise },
  );
  const [deleteBusinessProcess] = useMutation(DELETE_BUSINESS_PROCESS, {
    update(cache, _result, { variables }) {
      if (!variables?.id) return;
      cache.evict({ id: cache.identify({ __typename: 'BusinessProcess', id: variables.id }) });
      cache.gc();
    },
  });

  const [editingProcess, setEditingProcess] = useState<BusinessProcessRef | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const capabilities = data?.businessCapabilities ?? [];
  const capabilitiesById = new Map(capabilities.map((c) => [c.id, c]));
  const grouped = (data?.businessProcesses ?? []).reduce<Record<string, BusinessProcessRef[]>>(
    (acc, process) => {
      const key = process.capabilityId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(process);
      return acc;
    },
    {},
  );
  const groupedEntries = Object.entries(grouped).sort(([a], [b]) =>
    (capabilitiesById.get(a)?.name ?? a).localeCompare(capabilitiesById.get(b)?.name ?? b),
  );

  const openCreate = () => {
    setCreating(true);
    setEditingProcess(null);
    setSheetOpen(true);
  };

  const openEdit = (process: BusinessProcessRef) => {
    setCreating(false);
    setEditingProcess(process);
    setSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this business process?')) return;
    await deleteBusinessProcess({ variables: { id } });
    await refetch();
  };

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title="Business Processes"
        action={
          <Button onClick={openCreate} disabled={capabilities.length === 0}>
            New process
          </Button>
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load business processes.</p>}

      <div className="flex flex-col gap-6">
        {groupedEntries.map(([capabilityId, processes]) => {
          const cap = capabilitiesById.get(capabilityId);
          return (
            <div key={capabilityId}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cap?.name ?? capabilityId}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {processes.map((process) => (
                  <ProcessCard
                    key={process.id}
                    process={process}
                    onEdit={() => openEdit(process)}
                    onDelete={() => handleDelete(process.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {data?.businessProcesses.length === 0 && (
          <p className="text-sm text-muted-foreground">No business processes yet.</p>
        )}
      </div>

      <ProcessFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        process={creating ? null : editingProcess}
        capabilities={capabilities}
        onSaved={refetch}
      />
    </div>
  );
}

export const Route = createFileRoute('/business-processes/')({
  component: BusinessProcessesIndexRoute,
});
