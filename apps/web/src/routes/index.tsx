// Home route ("/"): renders the skeleton landing page and runs the GraphQL
// `ping` query as a backend smoke test.
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createFileRoute } from '@tanstack/react-router';

const PING_QUERY = gql`
  query Ping {
    ping
  }
`;

interface PingData {
  ping: string;
}

function HomeRoute() {
  const { data, loading, error } = useQuery<PingData>(PING_QUERY);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">OpenEAM</h1>
      <p className="mt-2 text-slate-600">Init skeleton — backend smoke test below.</p>

      <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          GraphQL ping
        </h2>
        <div className="mt-3 font-mono text-lg">
          {loading && <span className="text-slate-400">…</span>}
          {error && <span className="text-red-600">error: {error.message}</span>}
          {data && <span className="text-emerald-600">{data.ping}</span>}
        </div>
      </section>
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: HomeRoute,
});
