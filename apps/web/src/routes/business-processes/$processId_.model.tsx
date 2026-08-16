import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { lazy, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// bpmn-js is heavy; only load it when the editor route is visited.
const BpmnModeler = lazy(() => import('@/components/bpmn/bpmn-modeler'));

const PROCESS_DIAGRAM_QUERY = gql`
  query BusinessProcessDiagram($id: String!) {
    businessProcess(id: $id) {
      id
      name
      bpmnXml
    }
  }
`;

// Returning bpmnXml and steps keeps the normalized Apollo cache (and thus the
// detail page) in sync without a refetch.
const UPDATE_DIAGRAM_MUTATION = gql`
  mutation UpdateBusinessProcessDiagram($id: String!, $bpmnXml: String!) {
    updateBusinessProcessDiagram(id: $id, bpmnXml: $bpmnXml) {
      id
      bpmnXml
      steps {
        id
        name
      }
    }
  }
`;

interface ProcessDiagramData {
  businessProcess: { id: string; name: string; bpmnXml: string | null } | null;
}

function ModelBusinessProcessRoute() {
  const { processId } = Route.useParams();
  const { data, loading, error } = useQuery<ProcessDiagramData>(PROCESS_DIAGRAM_QUERY, {
    variables: { id: processId },
  });
  const [updateDiagram] = useMutation(UPDATE_DIAGRAM_MUTATION);

  const handleSave = useCallback(
    async (bpmnXml: string) => {
      await updateDiagram({ variables: { id: processId, bpmnXml } });
    },
    [updateDiagram, processId],
  );

  if (loading) return <p className="px-6 py-10 text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="px-6 py-10 text-sm text-destructive">Failed to load process.</p>;
  if (!data?.businessProcess) throw notFound();

  const process = data.businessProcess;

  return (
    // Fill the viewport minus the main padding (p-6): the modeler canvas
    // needs a bounded height to lay out.
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button asChild variant="ghost">
          <Link to="/business-processes/$processId" params={{ processId: process.id }}>
            ← Back
          </Link>
        </Button>
        <p className="text-sm font-semibold text-foreground">{process.name} — Process Model</p>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={<p className="p-4 text-xs text-muted-foreground italic">Loading editor…</p>}
        >
          <BpmnModeler xml={process.bpmnXml} onSave={handleSave} />
        </Suspense>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/business-processes/$processId_/model')({
  component: ModelBusinessProcessRoute,
});
