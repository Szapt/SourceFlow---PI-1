import { ReactNode, useState, useEffect } from "react";
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
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        setInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length > 0) {
        setInitials(parts[0].substring(0, 2).toUpperCase());
      }
    }
  }, []);

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
            {/* notifications removed */}
            <Button asChild size="sm" className="h-8 gap-1.5">
              <Link to="/new">
                <Plus className="h-3.5 w-3.5" />
                Nuevo proyecto
              </Link>
            </Button>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-[10px] text-white grid place-items-center font-semibold">
              {initials}
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
