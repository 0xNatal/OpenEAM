import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { NamedRef } from '@/lib/entities';

const BUSINESS_PROCESSES_QUERY = gql`
  query BusinessProcessesIndex {
    businessProcesses {
      id
      name
      description
      capabilityId
      triggerEvent
      outcome
      bpmnXml
    }
    businessCapabilities {
      id
      name
    }
  }
`;

const CREATE_BUSINESS_PROCESS = gql`
  mutation CreateBusinessProcess($input: BusinessProcessInput!) {
    createBusinessProcess(input: $input) {
      id
    }
  }
`;

const UPDATE_BUSINESS_PROCESS = gql`
  mutation UpdateBusinessProcess($id: String!, $input: BusinessProcessInput!) {
    updateBusinessProcess(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_BUSINESS_PROCESS = gql`
  mutation DeleteBusinessProcess($id: String!) {
    deleteBusinessProcess(id: $id)
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

interface FormState {
  name: string;
  description: string;
  capabilityId: string;
  triggerEvent: string;
  outcome: string;
}

const emptyForm = (defaultCapabilityId: string): FormState => ({
  name: '',
  description: '',
  capabilityId: defaultCapabilityId,
  triggerEvent: '',
  outcome: '',
});

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

function ProcessForm({
  form,
  setForm,
  capabilities,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  capabilities: NamedRef[];
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-2">
      <label
        htmlFor="proc-name"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Name
        <Input
          id="proc-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>

      <label
        htmlFor="proc-description"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Description
        <Input
          id="proc-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Business capability
        <select
          className="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          value={form.capabilityId}
          onChange={(e) => setForm({ ...form, capabilityId: e.target.value })}
        >
          <option value="" disabled>
            Select a capability
          </option>
          {capabilities.map((cap) => (
            <option key={cap.id} value={cap.id}>
              {cap.name}
            </option>
          ))}
        </select>
      </label>

      <label
        htmlFor="proc-trigger"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Trigger
        <Input
          id="proc-trigger"
          value={form.triggerEvent}
          onChange={(e) => setForm({ ...form, triggerEvent: e.target.value })}
        />
      </label>

      <label
        htmlFor="proc-outcome"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Outcome
        <Input
          id="proc-outcome"
          value={form.outcome}
          onChange={(e) => setForm({ ...form, outcome: e.target.value })}
        />
      </label>
    </div>
  );
}

function BusinessProcessesIndexRoute() {
  const { data, loading, error, refetch } =
    useQuery<BusinessProcessesData>(BUSINESS_PROCESSES_QUERY);
  const [createBusinessProcess, { error: createError }] = useMutation(CREATE_BUSINESS_PROCESS);
  const [updateBusinessProcess, { error: updateError }] = useMutation(UPDATE_BUSINESS_PROCESS);
  const [deleteBusinessProcess] = useMutation(DELETE_BUSINESS_PROCESS);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(''));

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
    setEditingId(null);
    setForm(emptyForm(capabilities[0]?.id ?? ''));
    setSheetOpen(true);
  };

  const openEdit = (process: BusinessProcessRef) => {
    setEditingId(process.id);
    setForm({
      name: process.name,
      description: process.description ?? '',
      capabilityId: process.capabilityId,
      triggerEvent: process.triggerEvent ?? '',
      outcome: process.outcome ?? '',
    });
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    const input = {
      name: form.name,
      description: form.description || null,
      capabilityId: form.capabilityId,
      triggerEvent: form.triggerEvent || null,
      outcome: form.outcome || null,
    };

    if (editingId) {
      await updateBusinessProcess({ variables: { id: editingId, input } });
    } else {
      await createBusinessProcess({ variables: { input } });
    }
    setSheetOpen(false);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this business process?')) return;
    await deleteBusinessProcess({ variables: { id } });
    await refetch();
  };

  const mutationError = createError ?? updateError;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Processes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational processes that deliver business capabilities.
          </p>
        </div>
        <Button onClick={openCreate} disabled={capabilities.length === 0}>
          New process
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load business processes.</p>}
      {mutationError && <p className="mb-4 text-sm text-destructive">{mutationError.message}</p>}

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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit process' : 'New process'}</SheetTitle>
            <SheetDescription>
              An operational process that delivers a business capability. Its diagram and steps are
              modeled separately.
            </SheetDescription>
          </SheetHeader>
          <ProcessForm form={form} setForm={setForm} capabilities={capabilities} />
          <SheetFooter>
            <Button onClick={handleSubmit} disabled={!form.name || !form.capabilityId}>
              {editingId ? 'Save changes' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createFileRoute('/business-processes/')({
  component: BusinessProcessesIndexRoute,
});
