import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import type { BusinessProcess, NamedRef } from '@/lib/entities';

const BUSINESS_PROCESS_QUERY = gql`
  query BusinessProcess($id: String!) {
    businessProcess(id: $id) {
      id
      name
      description
      capabilityId
      triggerEvent
      outcome
      steps {
        id
        name
      }
    }
  }
`;

const CAPABILITY_NAME_QUERY = gql`
  query CapabilityName($id: String!) {
    businessCapability(id: $id) {
      id
      name
    }
  }
`;

interface BusinessProcessData {
  businessProcess: BusinessProcess | null;
}

interface CapabilityNameData {
  businessCapability: NamedRef | null;
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Item({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
      {label}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-xs text-slate-400 italic">{label}</p>;
}

function BusinessProcessDetail({ process, cap }: { process: BusinessProcess; cap?: NamedRef }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{process.name}</h1>
        {process.description && (
          <p className="mt-1 text-sm text-slate-500">{process.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section
          title="Business Capability"
          subtitle="The business capability this process contributes to"
        >
          {cap ? (
            <Link
              to="/capabilities/$capabilityId"
              params={{ capabilityId: cap.id }}
              className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-violet-700 font-medium hover:border-violet-300 transition-colors"
            >
              {cap.name}
            </Link>
          ) : (
            <EmptyState label="No capability linked" />
          )}
        </Section>

        <Section title="Trigger" subtitle="What initiates this process">
          {process.triggerEvent ? (
            <Item label={process.triggerEvent} />
          ) : (
            <EmptyState label="No trigger defined yet" />
          )}
        </Section>

        <Section title="Steps" subtitle="Ordered activities that make up this process">
          {process.steps.length > 0 ? (
            process.steps.map((s) => <Item key={s.id} label={s.name} />)
          ) : (
            <EmptyState label="No steps defined yet" />
          )}
        </Section>

        <Section title="Outcome" subtitle="What this process produces or delivers">
          {process.outcome ? (
            <Item label={process.outcome} />
          ) : (
            <EmptyState label="No outcome defined yet" />
          )}
        </Section>
      </div>
    </div>
  );
}

function BusinessProcessRoute() {
  const { processId } = Route.useParams();
  const { data, loading, error } = useQuery<BusinessProcessData>(BUSINESS_PROCESS_QUERY, {
    variables: { id: processId },
  });

  const capabilityId = data?.businessProcess?.capabilityId;
  const { data: capData } = useQuery<CapabilityNameData>(CAPABILITY_NAME_QUERY, {
    variables: { id: capabilityId },
    skip: !capabilityId,
  });

  if (loading) return <p className="px-6 py-10 text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="px-6 py-10 text-sm text-red-600">Failed to load process.</p>;
  if (!data?.businessProcess) throw notFound();

  return (
    <BusinessProcessDetail
      process={data.businessProcess}
      cap={capData?.businessCapability ?? undefined}
    />
  );
}

export const Route = createFileRoute('/business-processes/$processId')({
  component: BusinessProcessRoute,
});
