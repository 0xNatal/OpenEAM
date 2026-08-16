import {
  BlocksIcon,
  Exchange01Icon,
  Flowchart01Icon,
  Home01Icon,
  MapsIcon,
  Route01Icon,
  Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { EnterpriseSwitcher } from './enterprise-switcher';
import { ThemeToggle } from './theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';
import { TooltipProvider } from './ui/tooltip';

export function AppShell() {
  const isOverview = useRouterState({
    select: (s) => s.location.pathname === '/',
  });
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
    <TooltipProvider delayDuration={200}>
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarHeader className="font-semibold text-base">
            <div className="flex items-center justify-between">
              <span className="px-1 group-data-[collapsible=icon]:hidden">OpenEAM</span>
              <SidebarTrigger size="icon-lg" />
            </div>
            <EnterpriseSwitcher />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isOverview} tooltip="Overview">
                    <Link to="/">
                      <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isValueStreams} tooltip="Value Streams">
                    <Link to="/value-streams">
                      <HugeiconsIcon icon={Route01Icon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Value Streams</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isCapabilities}
                    tooltip="Business Capabilities"
                  >
                    <Link to="/capabilities">
                      <HugeiconsIcon icon={Target01Icon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Business Capabilities
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isBusinessProcesses}
                    tooltip="Business Processes"
                  >
                    <Link to="/business-processes">
                      <HugeiconsIcon icon={Flowchart01Icon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Business Processes
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isBuildingBlocks} tooltip="Building Blocks">
                    <Link to="/building-blocks">
                      <HugeiconsIcon icon={BlocksIcon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Building Blocks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isLandscape} tooltip="Landscape">
                    <Link to="/landscape">
                      <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Landscape</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isDataExchange} tooltip="Data Exchange">
                    <Link to="/data-exchange">
                      <HugeiconsIcon icon={Exchange01Icon} strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Data Exchange</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <ThemeToggle />
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col min-h-screen">
          <main className="flex-1 px-6 pb-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
