import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export interface Enterprise {
  id: string;
  name: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function EnterpriseSwitcher({
  enterprises,
  defaultEnterpriseId,
}: {
  enterprises: Enterprise[];
  defaultEnterpriseId: string;
}) {
  const [activeId, setActiveId] = React.useState(defaultEnterpriseId);
  const active = enterprises.find((e) => e.id === activeId) ?? enterprises[0];

  if (!active) return null;

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
                {initials(active.name)}
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="text-xs text-muted-foreground">Enterprise</span>
                <span className="font-medium truncate">{active.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            {enterprises.map((enterprise) => (
              <DropdownMenuItem
                key={enterprise.id}
                onSelect={() => setActiveId(enterprise.id)}
                className="gap-2"
              >
                <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {initials(enterprise.name)}
                </div>
                <span className="truncate">{enterprise.name}</span>
                {enterprise.id === activeId && <Check className="ml-auto shrink-0" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <div className="flex size-6 items-center justify-center rounded border">
                <Plus className="size-3.5" />
              </div>
              Create enterprise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
