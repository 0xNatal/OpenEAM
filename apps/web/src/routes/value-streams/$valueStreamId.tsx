import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { ValueStreamDiagram } from '@/components/value-stream/diagram';
import { getValueStream } from '@/data/value-streams';

function ValueStreamDetailRoute() {
  const { valueStreamId } = Route.useParams();
  const stream = getValueStream(valueStreamId);

  if (!stream) throw notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Back + header */}
      <div className="mb-8">
        <Link
          to="/value-streams"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-violet-600 transition-colors mb-4"
        >
          <ChevronLeft className="size-3.5" />
          Value Streams
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{stream.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{stream.description}</p>
      </div>

      {/* Diagram */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 shadow-xs">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Click a stage to explore its business capabilities and business processes
        </p>
        <ValueStreamDiagram stream={stream} />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/value-streams/$valueStreamId')({
  component: ValueStreamDetailRoute,
});
