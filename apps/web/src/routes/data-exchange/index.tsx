import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

async function downloadExport() {
  const res = await fetch('/api/data-exchange/export');
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `openeam-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function uploadImport(file: File) {
  const text = await file.text();
  const body = JSON.parse(text);
  const res = await fetch('/api/data-exchange/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message ?? `Import failed (${res.status})`);
  }
}

function DataExchangeRoute() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      await downloadExport();
      setStatus({ kind: 'success', message: 'Export downloaded.' });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Export failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const confirmed = window.confirm(
      'Importing replaces ALL existing business capabilities, processes, and value streams. Continue?',
    );
    if (!confirmed) return;

    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      await uploadImport(file);
      setStatus({
        kind: 'success',
        message: 'Import complete. Reload the relevant pages to see the new data.',
      });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Import failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Exchange</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export the full model (capabilities, processes, value streams) as a single JSON bundle, or
          import one to restore or move data between OpenEAM instances. Import replaces all existing
          data.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Export</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Download the current model as JSON.
          </p>
          <Button className="mt-3" onClick={handleExport} disabled={busy}>
            Export JSON
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Import</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload a JSON bundle. This replaces all existing data.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            className="mt-3"
            variant="destructive"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            Import JSON
          </Button>
        </div>

        {status.kind !== 'idle' && (
          <p
            className={`text-sm ${status.kind === 'error' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}
          >
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/data-exchange/')({
  component: DataExchangeRoute,
});
