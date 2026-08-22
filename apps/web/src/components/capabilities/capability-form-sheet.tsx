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
import { Textarea } from '@/components/ui/textarea';
import { CAPABILITY_DIRECTION_LABEL, CAPABILITY_DIRECTIONS } from '@/lib/capability-direction';
import type { CapabilityDirection } from '@/lib/entities';
import { SELECT_EMPTY_VALUE } from '@/lib/utils';

export const CREATE_BUSINESS_CAPABILITY = gql`
  mutation CreateBusinessCapability($input: BusinessCapabilityInput!) {
    createBusinessCapability(input: $input) {
      id
    }
  }
`;

export const UPDATE_BUSINESS_CAPABILITY = gql`
  mutation UpdateBusinessCapability($id: String!, $input: BusinessCapabilityInput!) {
    updateBusinessCapability(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_BUSINESS_CAPABILITY = gql`
  mutation DeleteBusinessCapability($id: String!) {
    deleteBusinessCapability(id: $id)
  }
`;

export interface CapabilityFormValue {
  id: string;
  name: string;
  description?: string | null;
  direction?: CapabilityDirection | null;
}

interface FormState {
  name: string;
  description: string;
  direction: CapabilityDirection | '';
}

const emptyForm: FormState = { name: '', description: '', direction: '' };

// Shared create/edit sheet: the capabilities list opens it in create mode
// (capability: null) or edit mode from a card; the capability detail page
// opens it in edit mode for the capability it's showing.
export function CapabilityFormSheet({
  open,
  onOpenChange,
  capability,
  enterpriseId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability: CapabilityFormValue | null;
  // The enterprise a new capability is created in (edits keep their own).
  enterpriseId: string;
  onSaved: () => void;
}) {
  const [createBusinessCapability, { error: createError }] = useMutation(
    CREATE_BUSINESS_CAPABILITY,
  );
  const [updateBusinessCapability, { error: updateError }] = useMutation(
    UPDATE_BUSINESS_CAPABILITY,
  );
  const [form, setForm] = useState<FormState>(emptyForm);

  // Reset the form to the current capability whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setForm(
      capability
        ? {
            name: capability.name,
            description: capability.description ?? '',
            direction: capability.direction ?? '',
          }
        : emptyForm,
    );
  }, [open, capability]);

  const handleSubmit = async () => {
    const input = {
      enterpriseId,
      name: form.name,
      description: form.description || null,
      direction: form.direction || null,
    };
    if (capability) {
      await updateBusinessCapability({ variables: { id: capability.id, input } });
    } else {
      await createBusinessCapability({ variables: { input } });
    }
    onOpenChange(false);
    onSaved();
  };

  const mutationError = createError ?? updateError;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{capability ? 'Edit capability' : 'New capability'}</SheetTitle>
          <SheetDescription>
            A business capability describes what the business does, independent of how.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-2">
          <label
            htmlFor="cap-name"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Name
            <Input
              id="cap-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label
            htmlFor="cap-description"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Description
            <Textarea
              id="cap-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <label
            htmlFor="cap-direction"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Direction
            <Select
              value={form.direction || SELECT_EMPTY_VALUE}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  direction: v === SELECT_EMPTY_VALUE ? '' : (v as CapabilityDirection),
                })
              }
            >
              <SelectTrigger id="cap-direction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_EMPTY_VALUE}>Not set</SelectItem>
                {CAPABILITY_DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {CAPABILITY_DIRECTION_LABEL[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {mutationError && <p className="px-6 text-sm text-destructive">{mutationError.message}</p>}

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={!form.name}>
            {capability ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
