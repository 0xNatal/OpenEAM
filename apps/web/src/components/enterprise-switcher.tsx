import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Check, ChevronsUpDown, Pencil, Plus, Trash2 } from 'lucide-react';
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

const DELETE_ENTERPRISE = gql`
  mutation DeleteEnterprise($id: String!) {
    deleteEnterprise(id: $id)
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

// Always set as inline style (never mixed with a Tailwind bg-*/text-*
// class) — falling back to var(--sidebar-primary...) rather than a
// literal color when unset, so an uncustomized avatar still resolves to
// the current theme's value instead of a fixed one. Inline style, even a
// var() reference, beats a plain (non-!important) class-based rule
// regardless of the ancestor's specificity tricks — which matters here:
// DropdownMenuItem forces every descendant's text color on hover/focus
// (see its `focus:**:text-accent-foreground`), and a Tailwind class on the
// avatar itself can't reliably out-specificity that without `!important`,
// which would then also block a real per-enterprise custom color.
function avatarStyle(e: Pick<Enterprise, 'avatarBgColor' | 'avatarTextColor'>) {
  return {
    backgroundColor: e.avatarBgColor || 'var(--sidebar-primary)',
    color: e.avatarTextColor || 'var(--sidebar-primary-foreground)',
  };
}

// A free-form bg/text color can end up close to the sidebar's own
// background in either theme (a white avatar in light mode, a black one in
// dark mode) — border-border is the app's themed "visible against the
// current surface" token (light grey on light, faint white-on-dark), so it
// keeps the avatar's edge legible regardless of what color was picked.
const AVATAR_BORDER = 'border border-border';

interface CreateEnterpriseData {
  createEnterprise: { id: string };
}

export function EnterpriseSwitcher() {
  const { enterprises, enterprise, setEnterpriseId, refetch } = useEnterprise();
  const [createEnterprise, { error: createError }] =
    useMutation<CreateEnterpriseData>(CREATE_ENTERPRISE);
  const [updateEnterprise, { error: updateError }] = useMutation(UPDATE_ENTERPRISE);
  const [deleteEnterprise] = useMutation(DELETE_ENTERPRISE);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    goal: '',
    avatarBgColor: '',
    avatarTextColor: '',
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', goal: '', avatarBgColor: '', avatarTextColor: '' });
    setSheetOpen(true);
  };

  const openEdit = (e: Enterprise) => {
    setEditingId(e.id);
    setForm({
      name: e.name,
      description: e.description ?? '',
      goal: e.goal ?? '',
      avatarBgColor: e.avatarBgColor ?? '',
      avatarTextColor: e.avatarTextColor ?? '',
    });
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    const input = {
      name: form.name,
      description: form.description || null,
      goal: form.goal || null,
      avatarBgColor: form.avatarBgColor || null,
      avatarTextColor: form.avatarTextColor || null,
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

  // Cascades to every entity modeled within it (see enterprises.service.ts),
  // so this needs a clear, specific warning — not the generic one-liner
  // other list pages use for a single row. If the deleted enterprise was
  // the selected one, useEnterprise()'s own fallback (first remaining
  // enterprise, or null) takes over once refetch() drops it from the list.
  const handleDelete = async (e: Enterprise) => {
    const confirmed = window.confirm(
      `Delete "${e.name}"? This permanently deletes everything modeled in it — capabilities, ` +
        'value streams, business processes, and building blocks. This cannot be undone.',
    );
    if (!confirmed) return;
    await deleteEnterprise({ variables: { id: e.id } });
    refetch();
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
              <div
                className={`flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold ${AVATAR_BORDER}`}
                style={avatarStyle(enterprise ?? {})}
              >
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
            // Radix returns focus to the trigger button when the menu
            // closes; unlike a mouse click, that's a programmatic focus()
            // call, which the browser's :focus-visible heuristic treats as
            // real keyboard focus — so the trigger's focus ring lingers
            // after picking an enterprise, even though nothing else in the
            // sidebar leaves a ring behind after a plain click.
            onCloseAutoFocus={(event) => event.preventDefault()}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
          >
            {enterprises.map((e: Enterprise) => (
              <DropdownMenuItem key={e.id} onSelect={() => setEnterpriseId(e.id)} className="gap-2">
                <div
                  className={`flex aspect-square size-6 shrink-0 items-center justify-center rounded text-xs font-semibold ${AVATAR_BORDER}`}
                  style={avatarStyle(e)}
                >
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
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${e.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(e);
                  }}
                >
                  <Trash2 className="size-3.5" />
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

            <div className="flex gap-4">
              <label
                htmlFor="ent-avatar-bg"
                className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground"
              >
                Avatar background
                <div className="flex items-center gap-2">
                  <input
                    id="ent-avatar-bg"
                    type="color"
                    className="h-7 w-10 cursor-pointer rounded border border-input bg-input/20"
                    value={form.avatarBgColor || '#171717'}
                    onChange={(e) => setForm({ ...form, avatarBgColor: e.target.value })}
                  />
                  {form.avatarBgColor && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => setForm({ ...form, avatarBgColor: '' })}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </label>

              <label
                htmlFor="ent-avatar-text"
                className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground"
              >
                Avatar text
                <div className="flex items-center gap-2">
                  <input
                    id="ent-avatar-text"
                    type="color"
                    className="h-7 w-10 cursor-pointer rounded border border-input bg-input/20"
                    value={form.avatarTextColor || '#ffffff'}
                    onChange={(e) => setForm({ ...form, avatarTextColor: e.target.value })}
                  />
                  {form.avatarTextColor && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => setForm({ ...form, avatarTextColor: '' })}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </label>
            </div>
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
