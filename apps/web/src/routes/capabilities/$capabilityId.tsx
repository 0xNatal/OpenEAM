import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  CapabilityFormSheet,
  DELETE_BUSINESS_CAPABILITY,
} from '@/components/capabilities/capability-form-sheet';
import { Button } from '@/components/ui/button';
import type { BusinessCapabilityDetail, CapabilityResource } from '@/lib/entities';

const BUSINESS_CAPABILITY_QUERY = gql`
  query BusinessCapability($id: String!) {
    businessCapability(id: $id) {
      id
      enterpriseId
      name
      description
      people {
        id
        name
      }
      resources {
        id
        name
        lifecyclePhase
        __typename
      }
      information {
        id
        name
      }
      businessProcesses {
        id
        name
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

interface BusinessCapabilityData {
  businessCapability: BusinessCapabilityDetail | null;
}

function Quadrant({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Item({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
      {label}
    </div>
  );
}

function ProcessLink({ id, label }: { id: string; label: string }) {
  return (
    <Link
      to="/business-processes/$processId"
      params={{ processId: id }}
      className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-violet-700 dark:text-violet-300 font-medium hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
    >
      {label}
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-xs text-muted-foreground italic">{label}</p>;
}

function ResourceItem({ resource }: { resource: CapabilityResource }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
      <span>{resource.name}</span>
      <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {resource.__typename === 'ArchitectureBuildingBlock' ? 'ABB' : 'SBB'}
      </span>
    </div>
  );
}

function CapabilityDetail({
  cap,
  onEdit,
  onDelete,
}: {
  cap: BusinessCapabilityDetail;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{cap.name}</h1>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        {cap.description && <p className="mt-1 text-sm text-muted-foreground">{cap.description}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {cap.valueStreamStages.length > 0 ? (
            cap.valueStreamStages.map((link) => (
              <Link
                key={`${link.valueStreamId}-${link.stageId}`}
                to="/value-streams/$valueStreamId"
                params={{ valueStreamId: link.valueStreamId }}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                {link.valueStreamName} <span className="opacity-60">›</span> {link.stageName}
              </Link>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">Not part of any value stream yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Quadrant
          title="People"
          subtitle="Actors, stakeholders, business units or partners involved in delivering this capability"
        >
          {cap.people.length > 0 ? (
            cap.people.map((p) => <Item key={p.id} label={p.name} />)
          ) : (
            <EmptyState label="No people defined yet" />
          )}
        </Quadrant>

        <Quadrant
          title="Resources"
          subtitle="Architecture and solution building blocks that realize this capability"
        >
          {cap.resources.length > 0 ? (
            cap.resources.map((r) => <ResourceItem key={r.id} resource={r} />)
          ) : (
            <EmptyState label="No building blocks linked yet" />
          )}
        </Quadrant>

        <Quadrant
          title="Information"
          subtitle="Business data, knowledge, and insight required or consumed"
        >
          {cap.information.length > 0 ? (
            cap.information.map((i) => <Item key={i.id} label={i.name} />)
          ) : (
            <EmptyState label="No information defined yet" />
          )}
        </Quadrant>

        <Quadrant
          title="Business Processes"
          subtitle="Business processes through which this capability is delivered"
        >
          {cap.businessProcesses.length > 0 ? (
            cap.businessProcesses.map((p) => <ProcessLink key={p.id} id={p.id} label={p.name} />)
          ) : (
            <EmptyState label="No processes defined yet" />
          )}
        </Quadrant>
      </div>
    </div>
  );
}

function CapabilityRoute() {
  const { capabilityId } = Route.useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery<BusinessCapabilityData>(
    BUSINESS_CAPABILITY_QUERY,
    { variables: { id: capabilityId } },
  );
  const [deleteBusinessCapability] = useMutation(DELETE_BUSINESS_CAPABILITY, {
    update(cache, _result, { variables }) {
      if (!variables?.id) return;
      cache.evict({ id: cache.identify({ __typename: 'BusinessCapability', id: variables.id }) });
      cache.gc();
    },
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this business capability?')) return;
    await deleteBusinessCapability({ variables: { id: capabilityId } });
    navigate({ to: '/capabilities' });
  };

  if (loading) return <p className="px-6 py-10 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="px-6 py-10 text-sm text-destructive">Failed to load capability.</p>;
  if (!data?.businessCapability) throw notFound();

  return (
    <>
      <CapabilityDetail
        cap={data.businessCapability}
        onEdit={() => setSheetOpen(true)}
        onDelete={handleDelete}
      />
      <CapabilityFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        capability={data.businessCapability}
        enterpriseId={data.businessCapability.enterpriseId}
        onSaved={refetch}
      />
    </>
  );
}

export const Route = createFileRoute('/capabilities/$capabilityId')({
  component: CapabilityRoute,
});
