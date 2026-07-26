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
import type { BusinessCapabilitySummary } from '@/lib/entities';

const BUSINESS_CAPABILITIES_QUERY = gql`
  query BusinessCapabilities {
    businessCapabilities {
      id
      name
      description
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

const CREATE_BUSINESS_CAPABILITY = gql`
  mutation CreateBusinessCapability($input: BusinessCapabilityInput!) {
    createBusinessCapability(input: $input) {
      id
    }
  }
`;

const UPDATE_BUSINESS_CAPABILITY = gql`
  mutation UpdateBusinessCapability($id: String!, $input: BusinessCapabilityInput!) {
    updateBusinessCapability(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_BUSINESS_CAPABILITY = gql`
  mutation DeleteBusinessCapability($id: String!) {
    deleteBusinessCapability(id: $id)
  }
`;

interface BusinessCapabilitiesData {
  businessCapabilities: BusinessCapabilitySummary[];
}

interface FormState {
  name: string;
  description: string;
}

const emptyForm: FormState = { name: '', description: '' };

function toFormState(cap: BusinessCapabilitySummary): FormState {
  return { name: cap.name, description: cap.description ?? '' };
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
        <Link
          to="/capabilities/$capabilityId"
          params={{ capabilityId: cap.id }}
          className="font-medium text-foreground hover:text-violet-700 dark:hover:text-violet-300"
        >
          {cap.name}
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

function CapabilityForm({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-2">
      <label
        htmlFor="cap-name"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Name
        <Input
          id="cap-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>

      <label
        htmlFor="cap-description"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Description
        <Input
          id="cap-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
    </div>
  );
}

function CapabilitiesIndexRoute() {
  const { data, loading, error, refetch } = useQuery<BusinessCapabilitiesData>(
    BUSINESS_CAPABILITIES_QUERY,
  );
  const [createBusinessCapability, { error: createError }] = useMutation(
    CREATE_BUSINESS_CAPABILITY,
  );
  const [updateBusinessCapability, { error: updateError }] = useMutation(
    UPDATE_BUSINESS_CAPABILITY,
  );
  const [deleteBusinessCapability] = useMutation(DELETE_BUSINESS_CAPABILITY);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (cap: BusinessCapabilitySummary) => {
    setEditingId(cap.id);
    setForm(toFormState(cap));
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    const input = { name: form.name, description: form.description || null };

    if (editingId) {
      await updateBusinessCapability({ variables: { id: editingId, input } });
    } else {
      await createBusinessCapability({ variables: { input } });
    }
    setSheetOpen(false);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this business capability?')) return;
    await deleteBusinessCapability({ variables: { id } });
    await refetch();
  };

  const mutationError = createError ?? updateError;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Capabilities
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business capabilities shared across value streams.
          </p>
        </div>
        <Button onClick={openCreate}>New capability</Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load capabilities.</p>}
      {mutationError && <p className="mb-4 text-sm text-destructive">{mutationError.message}</p>}

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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit capability' : 'New capability'}</SheetTitle>
            <SheetDescription>
              A business capability describes what the business does, independent of how.
            </SheetDescription>
          </SheetHeader>
          <CapabilityForm form={form} setForm={setForm} />
          <SheetFooter>
            <Button onClick={handleSubmit} disabled={!form.name}>
              {editingId ? 'Save changes' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createFileRoute('/capabilities/')({
  component: CapabilitiesIndexRoute,
});
