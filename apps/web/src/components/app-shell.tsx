import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { EnterpriseSwitcher } from './enterprise-switcher';
import { ThemeToggle } from './theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';

export function AppShell() {
  const isValueStreams = useRouterState({
    select: (s) => s.location.pathname.startsWith('/value-streams'),
  });
  const isCapabilities = useRouterState({
    select: (s) => s.location.pathname.startsWith('/capabilities'),
  });
  const isBusinessProcesses = useRouterState({
    select: (s) => s.location.pathname.startsWith('/business-processes'),
  });
  const isBuildingBlocks = useRouterState({
    select: (s) => s.location.pathname.startsWith('/building-blocks'),
  });
  const isLandscape = useRouterState({
    select: (s) => s.location.pathname.startsWith('/landscape'),
  });
  const isDataExchange = useRouterState({
    select: (s) => s.location.pathname.startsWith('/data-exchange'),
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold text-base">
          <EnterpriseSwitcher
            enterprises={[
              { id: '1', name: 'Enterprise 1' },
              { id: '2', name: 'Enterprise 2' },
            ]}
            defaultEnterpriseId="1"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isValueStreams}>
                <Link to="/value-streams">Value Streams</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isCapabilities}>
                <Link to="/capabilities">Business Capabilities</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isBusinessProcesses}>
                <Link to="/business-processes">Business Processes</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isBuildingBlocks}>
                <Link to="/building-blocks">Building Blocks</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isLandscape}>
                <Link to="/landscape">Landscape</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isDataExchange}>
                <Link to="/data-exchange">Data Exchange</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-1 flex-col min-h-screen">
        <header className="flex h-14 items-center border-b px-4 gap-3">
          <SidebarTrigger />
          <span className="font-semibold text-lg">OpenEAM</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
