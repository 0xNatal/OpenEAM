import { Outlet } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar'
import { EnterpriseSwitcher } from './enterprise-switcher'

export function AppShell() {
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
              <SidebarMenuButton>Dashboard</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
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
  )
}
