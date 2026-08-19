import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Check, ChevronsUpDown, Pencil, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Enterprise, useEnterprise } from '@/lib/enterprise';

const CREATE_ENTERPRISE = gql`
  mutation CreateEnterprise($input: EnterpriseInput!) {
    createEnterprise(input: $input) {
      id
    }
  }
`;

const UPDATE_ENTERPRISE = gql`
  mutation UpdateEnterprise($id: String!, $input: EnterpriseInput!) {
    updateEnterprise(id: $id, input: $input) {
      id
    }
  }
`;

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface CreateEnterpriseData {
  createEnterprise: { id: string };
}

export function EnterpriseSwitcher() {
  const { enterprises, enterprise, setEnterpriseId, refetch } = useEnterprise();
  const [createEnterprise, { error: createError }] =
    useMutation<CreateEnterpriseData>(CREATE_ENTERPRISE);
  const [updateEnterprise, { error: updateError }] = useMutation(UPDATE_ENTERPRISE);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', description: '', goal: '' });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', goal: '' });
    setSheetOpen(true);
  };

  const openEdit = (e: Enterprise) => {
    setEditingId(e.id);
    setForm({ name: e.name, description: e.description ?? '', goal: e.goal ?? '' });
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    const input = {
      name: form.name,
      description: form.description || null,
      goal: form.goal || null,
    };
    if (editingId) {
      await updateEnterprise({ variables: { id: editingId, input } });
      setSheetOpen(false);
      refetch();
      return;
    }
    const result = await createEnterprise({ variables: { input } });
    setSheetOpen(false);
    refetch();
    const newId = result.data?.createEnterprise.id;
    if (newId) setEnterpriseId(newId);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {enterprise ? initials(enterprise.name) : '?'}
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="text-xs text-muted-foreground">Enterprise</span>
                <span className="font-medium truncate">{enterprise?.name ?? 'No enterprise'}</span>
              </div>
              <ChevronsUpDown className="ml-auto shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
          >
            {enterprises.map((e: Enterprise) => (
              <DropdownMenuItem key={e.id} onSelect={() => setEnterpriseId(e.id)} className="gap-2">
                <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {initials(e.name)}
                </div>
                <span className="truncate">{e.name}</span>
                {e.id === enterprise?.id && <Check className="size-3.5 shrink-0" />}
                <button
                  type="button"
                  className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label={`Edit ${e.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(e);
                  }}
                >
                  <Pencil className="size-3.5" />
                </button>
              </DropdownMenuItem>
            ))}
            {enterprises.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem className="gap-2" onSelect={openCreate}>
              <div className="flex size-6 items-center justify-center rounded border">
                <Plus className="size-3.5" />
              </div>
              Create enterprise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit enterprise' : 'New enterprise'}</SheetTitle>
            <SheetDescription>
              The scope of an architecture effort: one or more organizations (or parts of them)
              pursuing a shared goal — a company, a cross-company collaboration, a household.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-6 py-2">
            <label
              htmlFor="ent-name"
              className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
            >
              Name
              <Input
                id="ent-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label
              htmlFor="ent-goal"
              className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
            >
              Shared goal
              <Input
                id="ent-goal"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </label>

            <label
              htmlFor="ent-description"
              className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
            >
              Description
              <Input
                id="ent-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>

          {(createError || updateError) && (
            <p className="px-6 text-sm text-destructive">{(createError ?? updateError)?.message}</p>
          )}

          <SheetFooter>
            <Button onClick={handleSubmit} disabled={!form.name}>
              {editingId ? 'Save' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </SidebarMenu>
  );
}
