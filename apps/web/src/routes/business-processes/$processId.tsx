import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import {
  DELETE_BUSINESS_PROCESS,
  ProcessFormSheet,
} from '@/components/business-processes/process-form-sheet';
import { Button } from '@/components/ui/button';
import {
  contentWidthClassName,
  PageHeader,
  pageBackLinkClassName,
  TitledCard,
} from '@/components/ui/page-header';
import type { BusinessProcess, NamedRef } from '@/lib/entities';

// bpmn-js is heavy; only load it when a diagram is actually shown.
const BpmnViewer = lazy(() => import('@/components/bpmn/bpmn-viewer'));

const BUSINESS_PROCESS_QUERY = gql`
  query BusinessProcess($id: String!) {
    businessProcess(id: $id) {
      id
      enterpriseId
      name
      description
      capabilityId
      triggerEvent
      outcome
      bpmnXml
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

// The edit sheet's capability dropdown, scoped to the process's enterprise.
const ENTERPRISE_CAPABILITIES_QUERY = gql`
  query EnterpriseCapabilities($enterpriseId: String!) {
    businessCapabilities(enterpriseId: $enterpriseId) {
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

interface EnterpriseCapabilitiesData {
  businessCapabilities: NamedRef[];
}

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

function BusinessProcessDetail({
  process,
  cap,
  onEdit,
  onDelete,
}: {
  process: BusinessProcess;
  cap?: NamedRef;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title={process.name}
        back={
          <Link to="/business-processes" className={pageBackLinkClassName}>
            <ChevronLeft className="size-3.5" />
            Business Processes
          </Link>
        }
        action={
          <>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </>
        }
      />

      <div className="mb-4 rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Process Flow</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              BPMN diagram of this process; its tasks define the steps below
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/business-processes/$processId/model" params={{ processId: process.id }}>
              {process.bpmnXml ? 'Edit diagram' : 'Create diagram'}
            </Link>
          </Button>
        </div>
        {process.bpmnXml ? (
          <Suspense
            fallback={<p className="text-xs text-muted-foreground italic">Loading diagram…</p>}
          >
            <BpmnViewer xml={process.bpmnXml} />
          </Suspense>
        ) : (
          <EmptyState label="No diagram modeled yet" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TitledCard
          title="Business Capability"
          subtitle="The business capability this process contributes to"
        >
          {cap ? (
            <Link
              to="/capabilities/$capabilityId"
              params={{ capabilityId: cap.id }}
              className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground font-medium hover:border-foreground/30 transition-colors"
            >
              {cap.name}
            </Link>
          ) : (
            <EmptyState label="No capability linked" />
          )}
        </TitledCard>

        <TitledCard title="Trigger" subtitle="What initiates this process">
          {process.triggerEvent ? (
            <Item label={process.triggerEvent} />
          ) : (
            <EmptyState label="No trigger defined yet" />
          )}
        </TitledCard>

        <TitledCard title="Steps" subtitle="Ordered activities that make up this process">
          {process.steps.length > 0 ? (
            process.steps.map((s) => <Item key={s.id} label={s.name} />)
          ) : (
            <EmptyState label="No steps yet — add named tasks to the diagram above" />
          )}
        </TitledCard>

        <TitledCard title="Outcome" subtitle="What this process produces or delivers">
          {process.outcome ? (
            <Item label={process.outcome} />
          ) : (
            <EmptyState label="No outcome defined yet" />
          )}
        </TitledCard>
      </div>
    </div>
  );
}

function BusinessProcessRoute() {
  const { processId } = Route.useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery<BusinessProcessData>(BUSINESS_PROCESS_QUERY, {
    variables: { id: processId },
  });
  const [deleteBusinessProcess] = useMutation(DELETE_BUSINESS_PROCESS, {
    update(cache, _result, { variables }) {
      if (!variables?.id) return;
      cache.evict({ id: cache.identify({ __typename: 'BusinessProcess', id: variables.id }) });
      cache.gc();
    },
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const capabilityId = data?.businessProcess?.capabilityId;
  const { data: capData } = useQuery<CapabilityNameData>(CAPABILITY_NAME_QUERY, {
    variables: { id: capabilityId },
    skip: !capabilityId,
  });

  const enterpriseId = data?.businessProcess?.enterpriseId;
  const { data: capsData } = useQuery<EnterpriseCapabilitiesData>(ENTERPRISE_CAPABILITIES_QUERY, {
    variables: { enterpriseId },
    skip: !enterpriseId,
  });

  const handleDelete = async () => {
    if (!window.confirm('Delete this business process?')) return;
    await deleteBusinessProcess({ variables: { id: processId } });
    navigate({ to: '/business-processes' });
  };

  if (loading) return <p className="px-6 py-8 text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="px-6 py-8 text-sm text-destructive">Failed to load process.</p>;
  if (!data?.businessProcess) throw notFound();

  return (
    <>
      <BusinessProcessDetail
        process={data.businessProcess}
        cap={capData?.businessCapability ?? undefined}
        onEdit={() => setSheetOpen(true)}
        onDelete={handleDelete}
      />
      <ProcessFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        process={data.businessProcess}
        capabilities={capsData?.businessCapabilities ?? []}
        onSaved={refetch}
      />
    </>
  );
}

export const Route = createFileRoute('/business-processes/$processId')({
  component: BusinessProcessRoute,
});
