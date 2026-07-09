import { Check, Monitor, Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Theme, useTheme } from '@/lib/theme';

const systemOption = { value: 'system', label: 'System', icon: Monitor } as const;

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  systemOption,
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const active = options.find((o) => o.value === theme) ?? systemOption;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <active.icon className="shrink-0" />
              <span>Theme: {active.label}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setTheme(option.value)}
                className="gap-2"
              >
                <option.icon className="size-4 shrink-0" />
                <span>{option.label}</span>
                {option.value === theme && <Check className="ml-auto shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
