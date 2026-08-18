import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  contentWidthClassName,
  PageHeader,
  pageBackLinkClassName,
  TitledCard,
} from '@/components/ui/page-header';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEnterprise } from '@/lib/enterprise';
import type { BuildingBlockRelationship, BuildingBlockRelationshipType } from '@/lib/entities';

const BUILDING_BLOCK_DETAIL_QUERY = gql`
  query BuildingBlockDetail($id: String!, $enterpriseId: String!) {
    buildingBlock(id: $id) {
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
      outgoingRelationships {
        id
        targetBuildingBlockId
        type
        description
        validFrom
        validTo
      }
      incomingRelationships {
        id
        sourceBuildingBlockId
        type
        description
        validFrom
        validTo
      }
      __typename
      ... on ArchitectureBuildingBlock {
        architectureLevel
      }
    }
    buildingBlocks(enterpriseId: $enterpriseId) {
      id
      name
      __typename
    }
  }
`;

const CREATE_BUILDING_BLOCK_RELATIONSHIP = gql`
  mutation CreateBuildingBlockRelationship($input: BuildingBlockRelationshipInput!) {
    createBuildingBlockRelationship(input: $input) {
      id
    }
  }
`;

const DELETE_BUILDING_BLOCK_RELATIONSHIP = gql`
  mutation DeleteBuildingBlockRelationship($id: String!) {
    deleteBuildingBlockRelationship(id: $id)
  }
`;

interface BuildingBlockDetail {
  id: string;
  name: string;
  description?: string | null;
  lifecyclePhase: string;
  validFrom?: string | null;
  validTo?: string | null;
  architectureDomainIds: string[];
  organizationUnitLinks: { organizationUnitId: string }[];
  outgoingRelationships: BuildingBlockRelationship[];
  incomingRelationships: BuildingBlockRelationship[];
  __typename: 'ArchitectureBuildingBlock' | 'SolutionBuildingBlock';
  architectureLevel?: string | null;
}

interface BuildingBlockRef {
  id: string;
  name: string;
  __typename: 'ArchitectureBuildingBlock' | 'SolutionBuildingBlock';
}

interface BuildingBlockDetailData {
  buildingBlock: BuildingBlockDetail | null;
  buildingBlocks: BuildingBlockRef[];
}

const RELATIONSHIP_TYPE_LABEL: Record<BuildingBlockRelationshipType, string> = {
  DEPENDS_ON: 'Depends on',
  DATA_FLOW: 'Data flow',
  HOSTED_ON: 'Hosted on',
};

function Item({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
      {label}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-xs text-muted-foreground italic">{label}</p>;
}

function RelationshipRow({
  relationship,
  otherBlockId,
  otherBlockName,
  onDelete,
}: {
  relationship: BuildingBlockRelationship;
  otherBlockId: string;
  otherBlockName: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {RELATIONSHIP_TYPE_LABEL[relationship.type]}
          </span>
          <Link
            to="/building-blocks/$buildingBlockId"
            params={{ buildingBlockId: otherBlockId }}
            className="truncate font-medium text-violet-700 hover:underline dark:text-violet-300"
          >
            {otherBlockName}
          </Link>
        </div>
        {relationship.description && (
          <p className="truncate text-muted-foreground">{relationship.description}</p>
        )}
        {(relationship.validFrom || relationship.validTo) && (
          <p className="text-muted-foreground">
            {relationship.validFrom ?? '…'} – {relationship.validTo ?? '…'}
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}

interface RelationshipFormState {
  targetBuildingBlockId: string;
  type: BuildingBlockRelationshipType;
  description: string;
  validFrom: string;
  validTo: string;
}

const emptyRelationshipForm: RelationshipFormState = {
  targetBuildingBlockId: '',
  type: 'DEPENDS_ON',
  description: '',
  validFrom: '',
  validTo: '',
};

const selectClassName =
  'h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

function BuildingBlockRoute() {
  const { buildingBlockId } = Route.useParams();
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<BuildingBlockDetailData>(
    BUILDING_BLOCK_DETAIL_QUERY,
    { variables: { id: buildingBlockId, enterpriseId: enterprise?.id }, skip: !enterprise },
  );
  const [createRelationship, { error: createError }] = useMutation(
    CREATE_BUILDING_BLOCK_RELATIONSHIP,
  );
  const [deleteRelationship] = useMutation(DELETE_BUILDING_BLOCK_RELATIONSHIP);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<RelationshipFormState>(emptyRelationshipForm);

  const openCreate = () => {
    setForm(emptyRelationshipForm);
    setSheetOpen(true);
  };

  const handleCreate = async () => {
    if (!form.targetBuildingBlockId) return;
    await createRelationship({
      variables: {
        input: {
          sourceBuildingBlockId: buildingBlockId,
          targetBuildingBlockId: form.targetBuildingBlockId,
          type: form.type,
          description: form.description || null,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
        },
      },
    });
    setSheetOpen(false);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this relationship?')) return;
    await deleteRelationship({ variables: { id } });
    await refetch();
  };

  // The query is skipped until the enterprise context resolves (e.g. on a
  // hard reload straight into this route) — `loading` alone doesn't cover
  // that gap, so treat it the same as loading rather than falling through to
  // "not found" before the query has even had a chance to run.
  if (loading || !enterprise)
    return <p className="px-6 py-8 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="px-6 py-8 text-sm text-destructive">Failed to load building block.</p>;
  if (!data?.buildingBlock) throw notFound();

  const block = data.buildingBlock;
  const otherBlocks = data.buildingBlocks.filter((b) => b.id !== block.id);
  const nameById = new Map(data.buildingBlocks.map((b) => [b.id, b.name]));

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title={block.name}
        back={
          <Link to="/building-blocks" className={pageBackLinkClassName}>
            Building Blocks
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 text-xs">
        <Item label={`Kind: ${block.__typename === 'ArchitectureBuildingBlock' ? 'ABB' : 'SBB'}`} />
        <Item label={`Lifecycle: ${block.lifecyclePhase}`} />
        {block.architectureLevel && <Item label={`Level: ${block.architectureLevel}`} />}
        <Item label={`Valid: ${block.validFrom ?? '…'} – ${block.validTo ?? '…'}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Outgoing relationships</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                What this building block depends on, exchanges data with, or runs on
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={openCreate}
              disabled={otherBlocks.length === 0}
            >
              Add relationship
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            {block.outgoingRelationships.length > 0 ? (
              block.outgoingRelationships.map((rel) => (
                <RelationshipRow
                  key={rel.id}
                  relationship={rel}
                  otherBlockId={rel.targetBuildingBlockId}
                  otherBlockName={nameById.get(rel.targetBuildingBlockId) ?? 'Unknown'}
                  onDelete={() => handleDelete(rel.id)}
                />
              ))
            ) : (
              <EmptyState label="No relationships yet" />
            )}
          </div>
        </div>

        <TitledCard
          title="Incoming relationships"
          subtitle="Other building blocks that depend on, exchange data with, or run on this one"
        >
          {block.incomingRelationships.length > 0 ? (
            block.incomingRelationships.map((rel) => (
              <RelationshipRow
                key={rel.id}
                relationship={rel}
                otherBlockId={rel.sourceBuildingBlockId}
                otherBlockName={nameById.get(rel.sourceBuildingBlockId) ?? 'Unknown'}
                onDelete={() => handleDelete(rel.id)}
              />
            ))
          ) : (
            <EmptyState label="No relationships yet" />
          )}
        </TitledCard>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New relationship</SheetTitle>
            <SheetDescription>
              From {block.name} to another building block in this enterprise.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-6 py-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Target building block
              <select
                className={selectClassName}
                value={form.targetBuildingBlockId}
                onChange={(e) => setForm({ ...form, targetBuildingBlockId: e.target.value })}
              >
                <option value="">—</option>
                {otherBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.__typename === 'ArchitectureBuildingBlock' ? 'ABB' : 'SBB'})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Type
              <select
                className={selectClassName}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as BuildingBlockRelationshipType })
                }
              >
                <option value="DEPENDS_ON">Depends on</option>
                <option value="DATA_FLOW">Data flow</option>
                <option value="HOSTED_ON">Hosted on</option>
              </select>
            </label>

            <label
              htmlFor="rel-description"
              className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
            >
              Description
              <Input
                id="rel-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label
                htmlFor="rel-valid-from"
                className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
              >
                Valid from
                <Input
                  id="rel-valid-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </label>
              <label
                htmlFor="rel-valid-to"
                className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
              >
                Valid to
                <Input
                  id="rel-valid-to"
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                />
              </label>
            </div>
          </div>

          {createError && <p className="px-6 text-sm text-destructive">{createError.message}</p>}

          <SheetFooter>
            <Button onClick={handleCreate} disabled={!form.targetBuildingBlockId}>
              Create
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createFileRoute('/building-blocks/$buildingBlockId')({
  component: BuildingBlockRoute,
});
