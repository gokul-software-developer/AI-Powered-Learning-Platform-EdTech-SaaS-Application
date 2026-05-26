import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Outlet } from "react-router-dom"

const Dash = () => {
  return (
    <SidebarProvider className="flex min-h-screen">
    <AppSidebar />
    <main className="relative flex-1 min-h-screen">
      <main className="z-50 top-1 right-1 fixed">
      <SidebarTrigger />
      </main>
      <Outlet />
    </main>
  </SidebarProvider>
  )
}

export default Dash