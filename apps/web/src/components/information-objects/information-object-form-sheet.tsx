import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
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
import { Textarea } from '@/components/ui/textarea';

export const CREATE_INFORMATION_OBJECT = gql`
  mutation CreateInformationObject($input: InformationObjectInput!) {
    createInformationObject(input: $input) {
      id
    }
  }
`;

export const UPDATE_INFORMATION_OBJECT = gql`
  mutation UpdateInformationObject($id: String!, $input: InformationObjectInput!) {
    updateInformationObject(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_INFORMATION_OBJECT = gql`
  mutation DeleteInformationObject($id: String!) {
    deleteInformationObject(id: $id)
  }
`;

export interface InformationObjectFormValue {
  id: string;
  name: string;
  description?: string | null;
}

interface FormState {
  name: string;
  description: string;
}

const emptyForm: FormState = { name: '', description: '' };

// Deliberately plain: an information object is a name and a description, one
// level, no system-level counterpart beneath it (docs/DECISIONS.md D-13).
// What "information object" should mean is a standing question for review, so
// this stays cheap to change rather than elaborate.
export function InformationObjectFormSheet({
  open,
  onOpenChange,
  informationObject,
  enterpriseId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  informationObject: InformationObjectFormValue | null;
  enterpriseId: string;
  onSaved: () => void;
}) {
  const [createInformationObject, { error: createError }] = useMutation(CREATE_INFORMATION_OBJECT);
  const [updateInformationObject, { error: updateError }] = useMutation(UPDATE_INFORMATION_OBJECT);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(
      informationObject
        ? {
            name: informationObject.name,
            description: informationObject.description ?? '',
          }
        : emptyForm,
    );
  }, [open, informationObject]);

  const handleSubmit = async () => {
    const input = {
      enterpriseId,
      name: form.name,
      description: form.description || null,
    };
    if (informationObject) {
      await updateInformationObject({ variables: { id: informationObject.id, input } });
    } else {
      await createInformationObject({ variables: { input } });
    }
    onOpenChange(false);
    onSaved();
  };

  const mutationError = createError ?? updateError;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {informationObject ? 'Edit information object' : 'New information object'}
          </SheetTitle>
          <SheetDescription>
            Something the enterprise knows about, named in business language and independent of
            whichever system happens to hold it.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-2">
          <label
            htmlFor="info-name"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Name
            <Input
              id="info-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Expense Claim"
            />
            <span className="font-normal">
              A business term, not a table name. If it sounds like a system, it is probably a
              building block.
            </span>
          </label>

          <label
            htmlFor="info-description"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Description
            <Textarea
              id="info-description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>

        {mutationError && <p className="px-6 text-sm text-destructive">{mutationError.message}</p>}

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={!form.name}>
            {informationObject ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
