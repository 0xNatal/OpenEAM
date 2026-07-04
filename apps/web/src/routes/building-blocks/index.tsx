import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute } from '@tanstack/react-router';
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
import type {
  ArchitectureDomain,
  ArchitectureLevel,
  BuildingBlock,
  BuildingBlockKind,
  LifecyclePhase,
  OrganizationUnit,
} from '@/lib/entities';

const BUILDING_BLOCKS_QUERY = gql`
  query BuildingBlocksIndex {
    buildingBlocks {
      id
      name
      description
      lifecyclePhase
      validFrom
      validTo
      architectureDomainIds
      organizationUnitLinks {
        organizationUnitId
      }
      __typename
      ... on ArchitectureBuildingBlock {
        architectureLevel
      }
    }
    architectureDomains {
      id
      name
      isDefault
    }
    organizationUnits {
      id
      name
      parentId
    }
  }
`;

const CREATE_BUILDING_BLOCK = gql`
  mutation CreateBuildingBlock($input: BuildingBlockInput!) {
    createBuildingBlock(input: $input) {
      id
    }
  }
`;

const UPDATE_BUILDING_BLOCK = gql`
  mutation UpdateBuildingBlock($id: String!, $input: BuildingBlockInput!) {
    updateBuildingBlock(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_BUILDING_BLOCK = gql`
  mutation DeleteBuildingBlock($id: String!) {
    deleteBuildingBlock(id: $id)
  }
`;

interface BuildingBlocksData {
  buildingBlocks: BuildingBlock[];
  architectureDomains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
}

interface FormState {
  kind: BuildingBlockKind;
  name: string;
  description: string;
  architectureLevel: ArchitectureLevel | '';
  lifecyclePhase: LifecyclePhase;
  validFrom: string;
  validTo: string;
  architectureDomainIds: string[];
  organizationUnitIds: string[];
}

const emptyForm: FormState = {
  kind: 'ARCHITECTURE',
  name: '',
  description: '',
  architectureLevel: '',
  lifecyclePhase: 'PLANNED',
  validFrom: '',
  validTo: '',
  architectureDomainIds: [],
  organizationUnitIds: [],
};

function toFormState(block: BuildingBlock): FormState {
  return {
    kind: block.__typename === 'ArchitectureBuildingBlock' ? 'ARCHITECTURE' : 'SOLUTION',
    name: block.name,
    description: block.description ?? '',
    architectureLevel: block.architectureLevel ?? '',
    lifecyclePhase: block.lifecyclePhase,
    validFrom: block.validFrom ?? '',
    validTo: block.validTo ?? '',
    architectureDomainIds: block.architectureDomainIds,
    organizationUnitIds: block.organizationUnitLinks.map((l) => l.organizationUnitId),
  };
}

const selectClassName =
  'h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

function BuildingBlockForm({
  form,
  setForm,
  domains,
  organizationUnits,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  domains: ArchitectureDomain[];
  organizationUnits: OrganizationUnit[];
}) {
  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <div className="flex flex-col gap-4 px-6 py-2">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Kind
        <select
          className={selectClassName}
          value={form.kind}
          onChange={(e) =>
            setForm({
              ...form,
              kind: e.target.value as BuildingBlockKind,
              architectureLevel: e.target.value === 'SOLUTION' ? '' : form.architectureLevel,
            })
          }
        >
          <option value="ARCHITECTURE">Architecture Building Block (ABB)</option>
          <option value="SOLUTION">Solution Building Block (SBB)</option>
        </select>
      </label>

      <label htmlFor="bb-name" className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Name
        <Input
          id="bb-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>

      <label
        htmlFor="bb-description"
        className="flex flex-col gap-1 text-xs font-medium text-slate-600"
      >
        Description
        <Input
          id="bb-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      {form.kind === 'ARCHITECTURE' && (
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Architecture level
          <select
            className={selectClassName}
            value={form.architectureLevel}
            onChange={(e) =>
              setForm({ ...form, architectureLevel: e.target.value as ArchitectureLevel | '' })
            }
          >
            <option value="">—</option>
            <option value="STRATEGIC">Strategic</option>
            <option value="SEGMENT">Segment</option>
            <option value="CAPABILITY">Capability</option>
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Lifecycle phase
        <select
          className={selectClassName}
          value={form.lifecyclePhase}
          onChange={(e) => setForm({ ...form, lifecyclePhase: e.target.value as LifecyclePhase })}
        >
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="PHASING_OUT">Phasing out</option>
          <option value="RETIRED">Retired</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label
          htmlFor="bb-valid-from"
          className="flex flex-col gap-1 text-xs font-medium text-slate-600"
        >
          Valid from
          <Input
            id="bb-valid-from"
            type="date"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          />
        </label>
        <label
          htmlFor="bb-valid-to"
          className="flex flex-col gap-1 text-xs font-medium text-slate-600"
        >
          Valid to
          <Input
            id="bb-valid-to"
            type="date"
            value={form.validTo}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs font-medium text-slate-600">
          Architecture domains (at least one)
        </legend>
        <div className="flex flex-col gap-1 rounded-md border border-slate-200 p-2">
          {domains.map((domain) => (
            <label key={domain.id} className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.architectureDomainIds.includes(domain.id)}
                onChange={() =>
                  setForm({
                    ...form,
                    architectureDomainIds: toggle(form.architectureDomainIds, domain.id),
                  })
                }
              />
              {domain.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs font-medium text-slate-600">Organization units</legend>
        <div className="flex flex-col gap-1 rounded-md border border-slate-200 p-2">
          {organizationUnits.length === 0 && (
            <p className="text-xs text-slate-400">No organization units yet.</p>
          )}
          {organizationUnits.map((unit) => (
            <label key={unit.id} className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.organizationUnitIds.includes(unit.id)}
                onChange={() =>
                  setForm({
                    ...form,
                    organizationUnitIds: toggle(form.organizationUnitIds, unit.id),
                  })
                }
              />
              {unit.name}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function BuildingBlocksIndexRoute() {
  const { data, loading, error, refetch } = useQuery<BuildingBlocksData>(BUILDING_BLOCKS_QUERY);
  const [createBuildingBlock, { error: createError }] = useMutation(CREATE_BUILDING_BLOCK);
  const [updateBuildingBlock, { error: updateError }] = useMutation(UPDATE_BUILDING_BLOCK);
  const [deleteBuildingBlock] = useMutation(DELETE_BUILDING_BLOCK);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const domains = data?.architectureDomains ?? [];
  const organizationUnits = data?.organizationUnits ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (block: BuildingBlock) => {
    setEditingId(block.id);
    setForm(toFormState(block));
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    const input = {
      kind: form.kind,
      name: form.name,
      description: form.description || null,
      architectureLevel: form.kind === 'ARCHITECTURE' ? form.architectureLevel || null : null,
      lifecyclePhase: form.lifecyclePhase,
      validFrom: form.validFrom || null,
      validTo: form.validTo || null,
      architectureDomainIds: form.architectureDomainIds,
      organizationUnitIds: form.organizationUnitIds,
    };

    if (editingId) {
      await updateBuildingBlock({ variables: { id: editingId, input } });
    } else {
      await createBuildingBlock({ variables: { input } });
    }
    setSheetOpen(false);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this building block?')) return;
    await deleteBuildingBlock({ variables: { id } });
    await refetch();
  };

  const mutationError = createError ?? updateError;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Building Blocks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Architecture building blocks (needed capabilities) and solution building blocks
            (implementations), assigned to architecture domains and organization units.
          </p>
        </div>
        <Button onClick={openCreate}>New building block</Button>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load building blocks.</p>}
      {mutationError && <p className="mb-4 text-sm text-red-600">{mutationError.message}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Kind</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Lifecycle</th>
              <th className="px-4 py-2">Valid</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {(data?.buildingBlocks ?? []).map((block) => (
              <tr key={block.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 font-medium text-slate-800">{block.name}</td>
                <td className="px-4 py-2 text-slate-500">
                  {block.__typename === 'ArchitectureBuildingBlock' ? 'ABB' : 'SBB'}
                </td>
                <td className="px-4 py-2 text-slate-500">{block.architectureLevel ?? '—'}</td>
                <td className="px-4 py-2 text-slate-500">{block.lifecyclePhase}</td>
                <td className="px-4 py-2 text-slate-500">
                  {block.validFrom ?? '…'} – {block.validTo ?? '…'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(block)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(block.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {data?.buildingBlocks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                  No building blocks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit building block' : 'New building block'}</SheetTitle>
            <SheetDescription>
              An ABB describes a needed capability; an SBB is what implements it.
            </SheetDescription>
          </SheetHeader>
          <BuildingBlockForm
            form={form}
            setForm={setForm}
            domains={domains}
            organizationUnits={organizationUnits}
          />
          <SheetFooter>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || form.architectureDomainIds.length === 0}
            >
              {editingId ? 'Save changes' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createFileRoute('/building-blocks/')({
  component: BuildingBlocksIndexRoute,
});
