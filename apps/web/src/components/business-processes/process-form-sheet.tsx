import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { NamedRef } from '@/lib/entities';

export const CREATE_BUSINESS_PROCESS = gql`
  mutation CreateBusinessProcess($input: BusinessProcessInput!) {
    createBusinessProcess(input: $input) {
      id
    }
  }
`;

export const UPDATE_BUSINESS_PROCESS = gql`
  mutation UpdateBusinessProcess($id: String!, $input: BusinessProcessInput!) {
    updateBusinessProcess(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_BUSINESS_PROCESS = gql`
  mutation DeleteBusinessProcess($id: String!) {
    deleteBusinessProcess(id: $id)
  }
`;

export interface ProcessFormValue {
  id: string;
  name: string;
  description?: string | null;
  capabilityId: string;
  triggerEvent?: string | null;
  outcome?: string | null;
}

interface FormState {
  name: string;
  description: string;
  capabilityId: string;
  triggerEvent: string;
  outcome: string;
}

function emptyForm(defaultCapabilityId: string): FormState {
  return {
    name: '',
    description: '',
    capabilityId: defaultCapabilityId,
    triggerEvent: '',
    outcome: '',
  };
}

function toFormState(process: ProcessFormValue): FormState {
  return {
    name: process.name,
    description: process.description ?? '',
    capabilityId: process.capabilityId,
    triggerEvent: process.triggerEvent ?? '',
    outcome: process.outcome ?? '',
  };
}

// Shared create/edit sheet: the process list opens it in create mode
// (process: null) or edit mode from a card; the process detail page opens
// it in edit mode for the process it's showing.
export function ProcessFormSheet({
  open,
  onOpenChange,
  process,
  capabilities,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: ProcessFormValue | null;
  capabilities: NamedRef[];
  onSaved: () => void;
}) {
  const [createBusinessProcess, { error: createError }] = useMutation(CREATE_BUSINESS_PROCESS);
  const [updateBusinessProcess, { error: updateError }] = useMutation(UPDATE_BUSINESS_PROCESS);
  const [form, setForm] = useState<FormState>(emptyForm(''));

  // Reset the form to the current process whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setForm(process ? toFormState(process) : emptyForm(capabilities[0]?.id ?? ''));
  }, [open, process, capabilities]);

  const handleSubmit = async () => {
    const input = {
      name: form.name,
      description: form.description || null,
      capabilityId: form.capabilityId,
      triggerEvent: form.triggerEvent || null,
      outcome: form.outcome || null,
    };

    if (process) {
      await updateBusinessProcess({ variables: { id: process.id, input } });
    } else {
      await createBusinessProcess({ variables: { input } });
    }
    onOpenChange(false);
    onSaved();
  };

  const mutationError = createError ?? updateError;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{process ? 'Edit process' : 'New process'}</SheetTitle>
          <SheetDescription>
            An operational process that delivers a business capability. Its diagram and steps are
            modeled separately.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-2">
          <label
            htmlFor="proc-name"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Name
            <Input
              id="proc-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label
            htmlFor="proc-description"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Description
            <Input
              id="proc-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <label
            htmlFor="proc-capability"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Business capability
            <Select
              value={form.capabilityId}
              onValueChange={(v) => setForm({ ...form, capabilityId: v })}
            >
              <SelectTrigger id="proc-capability" className="w-full">
                <SelectValue placeholder="Select a capability" />
              </SelectTrigger>
              <SelectContent>
                {capabilities.map((cap) => (
                  <SelectItem key={cap.id} value={cap.id}>
                    {cap.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label
            htmlFor="proc-trigger"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Trigger
            <Input
              id="proc-trigger"
              value={form.triggerEvent}
              onChange={(e) => setForm({ ...form, triggerEvent: e.target.value })}
            />
          </label>

          <label
            htmlFor="proc-outcome"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Outcome
            <Input
              id="proc-outcome"
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
            />
          </label>
        </div>

        {mutationError && <p className="px-6 text-sm text-destructive">{mutationError.message}</p>}

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={!form.name || !form.capabilityId}>
            {process ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
