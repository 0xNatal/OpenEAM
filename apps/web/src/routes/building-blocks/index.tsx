import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEnterprise } from '@/lib/enterprise';
import type {
  ArchitectureDomain,
  ArchitectureLevel,
  BuildingBlock,
  BuildingBlockKind,
  LifecyclePhase,
  OrganizationUnit,
} from '@/lib/entities';
import { SELECT_EMPTY_VALUE } from '@/lib/utils';

const BUILDING_BLOCKS_QUERY = gql`
  query BuildingBlocksIndex($enterpriseId: String!) {
    buildingBlocks(enterpriseId: $enterpriseId) {
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
    architectureDomains(enterpriseId: $enterpriseId) {
      id
      name
      isDefault
    }
    organizationUnits(enterpriseId: $enterpriseId) {
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
      <label
        htmlFor="bb-kind"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Kind
        <Select
          value={form.kind}
          onValueChange={(v) =>
            setForm({
              ...form,
              kind: v as BuildingBlockKind,
              architectureLevel: v === 'SOLUTION' ? '' : form.architectureLevel,
            })
          }
        >
          <SelectTrigger id="bb-kind" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ARCHITECTURE">Architecture Building Block (ABB)</SelectItem>
            <SelectItem value="SOLUTION">Solution Building Block (SBB)</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label
        htmlFor="bb-name"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Name
        <Input
          id="bb-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>

      <label
        htmlFor="bb-description"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Description
        <Input
          id="bb-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      {form.kind === 'ARCHITECTURE' && (
        <label
          htmlFor="bb-architecture-level"
          className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
        >
          Architecture level
          <Select
            value={form.architectureLevel || SELECT_EMPTY_VALUE}
            onValueChange={(v) =>
              setForm({
                ...form,
                architectureLevel: v === SELECT_EMPTY_VALUE ? '' : (v as ArchitectureLevel),
              })
            }
          >
            <SelectTrigger id="bb-architecture-level" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY_VALUE}>—</SelectItem>
              <SelectItem value="STRATEGIC">Strategic</SelectItem>
              <SelectItem value="SEGMENT">Segment</SelectItem>
              <SelectItem value="CAPABILITY">Capability</SelectItem>
            </SelectContent>
          </Select>
        </label>
      )}

      <label
        htmlFor="bb-lifecycle-phase"
        className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
      >
        Lifecycle phase
        <Select
          value={form.lifecyclePhase}
          onValueChange={(v) => setForm({ ...form, lifecyclePhase: v as LifecyclePhase })}
        >
          <SelectTrigger id="bb-lifecycle-phase" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PHASING_OUT">Phasing out</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label
          htmlFor="bb-valid-from"
          className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
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
          className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
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
        <legend className="text-xs font-medium text-muted-foreground">
          Architecture domains (at least one)
        </legend>
        <div className="flex flex-col gap-1 rounded-md border border-border p-2">
          {domains.map((domain) => (
            <label key={domain.id} className="flex items-center gap-2 text-xs text-foreground">
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
        <legend className="text-xs font-medium text-muted-foreground">Organization units</legend>
        <div className="flex flex-col gap-1 rounded-md border border-border p-2">
          {organizationUnits.length === 0 && (
            <p className="text-xs text-muted-foreground">No organization units yet.</p>
          )}
          {organizationUnits.map((unit) => (
            <label key={unit.id} className="flex items-center gap-2 text-xs text-foreground">
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
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<BuildingBlocksData>(BUILDING_BLOCKS_QUERY, {
    variables: { enterpriseId: enterprise?.id },
    skip: !enterprise,
  });
  const [createBuildingBlock, { error: createError }] = useMutation(CREATE_BUILDING_BLOCK);
  const [updateBuildingBlock, { error: updateError }] = useMutation(UPDATE_BUILDING_BLOCK);
  const [deleteBuildingBlock] = useMutation(DELETE_BUILDING_BLOCK);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<BuildingBlockKind | ''>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecyclePhase | ''>('');
  const [domainFilter, setDomainFilter] = useState('');
  const [organizationUnitFilter, setOrganizationUnitFilter] = useState('');

  const domains = data?.architectureDomains ?? [];
  const organizationUnits = data?.organizationUnits ?? [];
  const domainNameById = new Map(domains.map((d) => [d.id, d.name]));
  const organizationUnitNameById = new Map(organizationUnits.map((u) => [u.id, u.name]));

  const hasActiveFilters = Boolean(
    search || kindFilter || lifecycleFilter || domainFilter || organizationUnitFilter,
  );

  const clearFilters = () => {
    setSearch('');
    setKindFilter('');
    setLifecycleFilter('');
    setDomainFilter('');
    setOrganizationUnitFilter('');
  };

  const filteredBlocks = useMemo(() => {
    const blocks = data?.buildingBlocks ?? [];
    const q = search.trim().toLowerCase();
    return blocks.filter((block) => {
      if (q) {
        const haystack = `${block.name} ${block.description ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (kindFilter) {
        const blockKind: BuildingBlockKind =
          block.__typename === 'ArchitectureBuildingBlock' ? 'ARCHITECTURE' : 'SOLUTION';
        if (blockKind !== kindFilter) return false;
      }
      if (lifecycleFilter && block.lifecyclePhase !== lifecycleFilter) return false;
      if (domainFilter && !block.architectureDomainIds.includes(domainFilter)) return false;
      if (
        organizationUnitFilter &&
        !block.organizationUnitLinks.some((l) => l.organizationUnitId === organizationUnitFilter)
      )
        return false;
      return true;
    });
  }, [
    data?.buildingBlocks,
    search,
    kindFilter,
    lifecycleFilter,
    domainFilter,
    organizationUnitFilter,
  ]);

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
    if (!enterprise) return;
    const input = {
      enterpriseId: enterprise.id,
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
    <div className={contentWidthClassName}>
      <PageHeader
        title="Building Blocks"
        action={
          <Button onClick={openCreate} disabled={!enterprise}>
            New building block
          </Button>
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load building blocks.</p>}
      {mutationError && <p className="mb-4 text-sm text-destructive">{mutationError.message}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label
          htmlFor="bb-search"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          Search
          <Input
            id="bb-search"
            className="w-48"
            placeholder="Name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label
          htmlFor="bb-kind-filter"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          Kind
          <Select
            value={kindFilter || SELECT_EMPTY_VALUE}
            onValueChange={(v) =>
              setKindFilter(v === SELECT_EMPTY_VALUE ? '' : (v as BuildingBlockKind))
            }
          >
            <SelectTrigger id="bb-kind-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY_VALUE}>All</SelectItem>
              <SelectItem value="ARCHITECTURE">ABB</SelectItem>
              <SelectItem value="SOLUTION">SBB</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label
          htmlFor="bb-lifecycle-filter"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          Lifecycle
          <Select
            value={lifecycleFilter || SELECT_EMPTY_VALUE}
            onValueChange={(v) =>
              setLifecycleFilter(v === SELECT_EMPTY_VALUE ? '' : (v as LifecyclePhase))
            }
          >
            <SelectTrigger id="bb-lifecycle-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY_VALUE}>All</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PHASING_OUT">Phasing out</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label
          htmlFor="bb-domain-filter"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          Domain
          <Select
            value={domainFilter || SELECT_EMPTY_VALUE}
            onValueChange={(v) => setDomainFilter(v === SELECT_EMPTY_VALUE ? '' : v)}
          >
            <SelectTrigger id="bb-domain-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY_VALUE}>All</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label
          htmlFor="bb-org-unit-filter"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          Org unit
          <Select
            value={organizationUnitFilter || SELECT_EMPTY_VALUE}
            onValueChange={(v) => setOrganizationUnitFilter(v === SELECT_EMPTY_VALUE ? '' : v)}
          >
            <SelectTrigger id="bb-org-unit-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_EMPTY_VALUE}>All</SelectItem>
              {organizationUnits.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Kind</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Lifecycle</th>
              <th className="px-4 py-2">Domain</th>
              <th className="px-4 py-2">Org unit</th>
              <th className="px-4 py-2">Valid</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.map((block) => (
              <tr key={block.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium">
                  <Link
                    to="/building-blocks/$buildingBlockId"
                    params={{ buildingBlockId: block.id }}
                    className="text-foreground hover:text-foreground"
                  >
                    {block.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {block.__typename === 'ArchitectureBuildingBlock' ? 'ABB' : 'SBB'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {block.architectureLevel ?? '—'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{block.lifecyclePhase}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {block.architectureDomainIds.length > 0
                    ? block.architectureDomainIds
                        .map((id) => domainNameById.get(id) ?? id)
                        .join(', ')
                    : '—'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {block.organizationUnitLinks.length > 0
                    ? block.organizationUnitLinks
                        .map(
                          (l) =>
                            organizationUnitNameById.get(l.organizationUnitId) ??
                            l.organizationUnitId,
                        )
                        .join(', ')
                    : '—'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
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
            {filteredBlocks.length === 0 && (data?.buildingBlocks.length ?? 0) === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No building blocks yet.
                </td>
              </tr>
            )}
            {filteredBlocks.length === 0 && (data?.buildingBlocks.length ?? 0) > 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {search
                    ? `No building blocks match "${search}".`
                    : 'No building blocks match the selected filters.'}
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
