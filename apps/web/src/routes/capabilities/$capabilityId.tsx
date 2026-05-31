import { createFileRoute, notFound } from '@tanstack/react-router';
import type { BusinessCapability } from '@/data/capabilities';
import { getBusinessCapability } from '@/data/capabilities';

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

function CapabilityDetail({ cap }: { cap: BusinessCapability }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{cap.name}</h1>
        {cap.description && <p className="mt-1 text-sm text-slate-500">{cap.description}</p>}
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

        <Quadrant title="Resources" subtitle="IT systems, physical assets, and intangible assets">
          {cap.resources.length > 0 ? (
            cap.resources.map((r) => <Item key={r.id} label={r.name} />)
          ) : (
            <EmptyState label="No resources defined yet" />
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
            cap.businessProcesses.map((p) => <Item key={p.id} label={p.name} />)
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
  const cap = getBusinessCapability(capabilityId);
  if (!cap) throw notFound();
  return <CapabilityDetail cap={cap} />;
}

export const Route = createFileRoute('/capabilities/$capabilityId')({
  component: CapabilityRoute,
});
