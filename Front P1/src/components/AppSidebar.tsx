import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Upload,
  GitBranch,
  Search,
  Settings,
  LogOut,
  Briefcase,
  Compass,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Mi Proyecto", url: "/my-project", icon: Briefcase },
  { title: "Explorar Proyectos", url: "/projects", icon: Compass },
  { title: "Documentación", url: "/docs", icon: BookOpen },
  { title: "Subir proyecto", url: "/new", icon: Upload },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-emerald text-white">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">SourceFlow</span>
            <span className="truncate text-[10px] text-muted-foreground">
              Repositorio académico
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* settings removed per request */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
