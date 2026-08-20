import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { NamedRef } from '@/lib/entities';

const CREATE_VALUE_STREAM = gql`
  mutation CreateValueStream($input: ValueStreamInput!) {
    createValueStream(input: $input) {
      id
      name
      description
      stages {
        id
        name
      }
    }
  }
`;

// One stage as the form edits it — before saving, a stage has no id of its
// own yet, so the list needs a separate client-only key for React.
interface StageDraft {
  key: string;
  name: string;
  capabilityIds: string[];
}

function emptyStage(): StageDraft {
  return { key: crypto.randomUUID(), name: '', capabilityIds: [] };
}

export function ValueStreamFormSheet({
  open,
  onOpenChange,
  enterpriseId,
  capabilities,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enterpriseId: string;
  capabilities: NamedRef[];
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<StageDraft[]>([emptyStage()]);
  const [createValueStream, { error }] = useMutation(CREATE_VALUE_STREAM);

  // Reset to a blank form each time the sheet opens, so a previous draft
  // doesn't linger into the next "New value stream" click.
  useEffect(() => {
    if (!open) return;
    setName('');
    setDescription('');
    setStages([emptyStage()]);
  }, [open]);

  const updateStage = (key: string, patch: Partial<StageDraft>) =>
    setStages((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const toggleCapability = (stage: StageDraft, capabilityId: string) => {
    const capabilityIds = stage.capabilityIds.includes(capabilityId)
      ? stage.capabilityIds.filter((id) => id !== capabilityId)
      : [...stage.capabilityIds, capabilityId];
    updateStage(stage.key, { capabilityIds });
  };

  const canSubmit = name.trim() !== '' && stages.every((s) => s.name.trim() !== '');

  const handleSubmit = async () => {
    await createValueStream({
      variables: {
        input: {
          enterpriseId,
          name,
          description: description || null,
          stages: stages.map((s) => ({ name: s.name, capabilityIds: s.capabilityIds })),
        },
      },
    });
    onOpenChange(false);
    onCreated();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New value stream</SheetTitle>
          <SheetDescription>
            An end-to-end sequence of stages that delivers value to a stakeholder, triggered by a
            need and ending when it's satisfied — e.g. "Order to Cash", not a single process step.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-2">
          <label
            htmlFor="vs-name"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Name
            <Input id="vs-name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label
            htmlFor="vs-description"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Description
            <Input
              id="vs-description"
              placeholder="Stakeholder: … Trigger: … End state: …"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-medium text-muted-foreground">Stages</legend>
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    aria-label={`Stage ${index + 1} name`}
                    placeholder={`Stage ${index + 1} name`}
                    value={stage.name}
                    onChange={(e) => updateStage(stage.key, { name: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={stages.length === 1}
                    onClick={() => setStages((prev) => prev.filter((s) => s.key !== stage.key))}
                  >
                    <X strokeWidth={2} />
                    <span className="sr-only">Remove stage</span>
                  </Button>
                </div>
                {capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {capabilities.map((cap) => (
                      <label
                        key={cap.id}
                        className="flex items-center gap-1.5 text-xs text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={stage.capabilityIds.includes(cap.id)}
                          onChange={() => toggleCapability(stage, cap.id)}
                        />
                        {cap.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setStages((prev) => [...prev, emptyStage()])}
            >
              <Plus strokeWidth={2} data-icon="inline-start" />
              Add stage
            </Button>
          </fieldset>
        </div>

        {error && <p className="px-6 text-sm text-destructive">{error.message}</p>}

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
