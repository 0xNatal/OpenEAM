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
      <p className="mt-2 text-muted-foreground">Init skeleton — backend smoke test below.</p>

      <section className="mt-10 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          GraphQL ping
        </h2>
        <div className="mt-3 font-mono text-lg">
          {loading && <span className="text-muted-foreground">…</span>}
          {error && <span className="text-destructive">error: {error.message}</span>}
          {data && <span className="text-emerald-600 dark:text-emerald-400">{data.ping}</span>}
        </div>
      </section>
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: HomeRoute,
});
