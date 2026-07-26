import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import type { BusinessCapabilityDetail, CapabilityResource } from '@/lib/entities';

const BUSINESS_CAPABILITY_QUERY = gql`
  query BusinessCapability($id: String!) {
    businessCapability(id: $id) {
      id
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

function CapabilityDetail({ cap }: { cap: BusinessCapabilityDetail }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{cap.name}</h1>
        {cap.description && <p className="mt-1 text-sm text-muted-foreground">{cap.description}</p>}
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
  const { data, loading, error } = useQuery<BusinessCapabilityData>(BUSINESS_CAPABILITY_QUERY, {
    variables: { id: capabilityId },
  });

  if (loading) return <p className="px-6 py-10 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="px-6 py-10 text-sm text-destructive">Failed to load capability.</p>;
  if (!data?.businessCapability) throw notFound();

  return <CapabilityDetail cap={data.businessCapability} />;
}

export const Route = createFileRoute('/capabilities/$capabilityId')({
  component: CapabilityRoute,
});
