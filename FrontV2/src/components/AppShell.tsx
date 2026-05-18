import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface Props {
  children: ReactNode;
  breadcrumb?: ReactNode;
}

export function AppShell({ children, breadcrumb }: Props) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex-1 text-sm text-muted-foreground">
              {breadcrumb}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Button asChild size="sm" className="h-8 gap-1.5">
              <Link to="/new">
                <Plus className="h-3.5 w-3.5" />
                Nuevo proyecto
              </Link>
            </Button>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-[10px] text-white grid place-items-center font-semibold">
              MR
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
