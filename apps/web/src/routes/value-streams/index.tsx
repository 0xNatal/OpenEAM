import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { contentWidthClassName, PageHeader } from '@/components/ui/page-header';
import { MiniChevronStrip } from '@/components/value-stream/diagram';
import { ValueStreamFormSheet } from '@/components/value-stream/value-stream-form-sheet';
import { useEnterprise } from '@/lib/enterprise';

const VALUE_STREAMS_QUERY = gql`
  query ValueStreamsIndex($enterpriseId: String!) {
    valueStreams(enterpriseId: $enterpriseId) {
      id
      name
      description
      stages {
        id
        name
      }
    }
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
    }
  }
`;

interface ValueStreamSummary {
  id: string;
  name: string;
  description?: string | null;
  stages: { id: string; name: string }[];
}

interface ValueStreamsData {
  valueStreams: ValueStreamSummary[];
  businessCapabilities: { id: string; name: string }[];
}

function ValueStreamsIndexRoute() {
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<ValueStreamsData>(VALUE_STREAMS_QUERY, {
    variables: { enterpriseId: enterprise?.id },
    skip: !enterprise,
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        title="Value Streams"
        action={
          <Button onClick={() => setSheetOpen(true)} disabled={!enterprise}>
            New value stream
          </Button>
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">Failed to load value streams.</p>}
      {data?.valueStreams.length === 0 && (
        <p className="text-sm text-muted-foreground">No value streams yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.valueStreams.map((vs) => (
          <Link
            key={vs.id}
            to="/value-streams/$valueStreamId"
            params={{ valueStreamId: vs.id }}
            className="group flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all duration-150"
          >
            {/* Mini chevron strip preview */}
            <div className="px-4 pt-4 pb-2">
              <MiniChevronStrip stages={vs.stages.map((s) => s.name)} />
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 gap-3 px-4 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                  {vs.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {vs.description}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                  {vs.stages.length} stages
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {enterprise && (
        <ValueStreamFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          enterpriseId={enterprise.id}
          capabilities={data?.businessCapabilities ?? []}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/value-streams/')({
  component: ValueStreamsIndexRoute,
});
