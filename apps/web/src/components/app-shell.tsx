import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import {
  ArrowLeftRight,
  Blocks,
  Home,
  Map as MapIcon,
  Route,
  Table2,
  Target,
  Workflow,
} from 'lucide-react';
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
  // The diagram is the flagship landscape view, so it owns the plain
  // "Landscape" nav entry; the table is a separate, secondary entry (see
  // routes/landscape/index.tsx) — hence an exact match here rather than
  // startsWith, so the two don't both light up together.
  const isLandscapeDiagram = useRouterState({
    select: (s) => s.location.pathname.startsWith('/landscape/diagram'),
  });
  const isLandscapeTable = useRouterState({
    select: (s) => s.location.pathname === '/landscape',
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
                      <Home strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isValueStreams} tooltip="Value Streams">
                    <Link to="/value-streams">
                      <Route strokeWidth={2} />
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
                      <Target strokeWidth={2} />
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
                      <Workflow strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Business Processes
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isBuildingBlocks} tooltip="Building Blocks">
                    <Link to="/building-blocks">
                      <Blocks strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Building Blocks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isLandscapeDiagram} tooltip="Landscape">
                    <Link to="/landscape/diagram">
                      <MapIcon strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Landscape</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isLandscapeTable} tooltip="Landscape Table">
                    <Link to="/landscape">
                      <Table2 strokeWidth={2} />
                      <span className="group-data-[collapsible=icon]:hidden">Landscape Table</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isDataExchange} tooltip="Data Exchange">
                    <Link to="/data-exchange">
                      <ArrowLeftRight strokeWidth={2} />
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
          {/* No padding here — each page's own width class
              (contentWidthClassName/canvasWidthClassName/
              fullBleedCanvasClassName, see ui/page-header.tsx) is the sole
              owner of its spacing. Main used to carry px-6 pb-6 of its own,
              which silently double-padded every page's right/bottom edge
              once those width classes gained their own px-6 pb-8. */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
