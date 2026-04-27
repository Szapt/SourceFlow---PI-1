import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import {
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  GitCommit,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SourceFlow Repositorio Académico" },
      {
        name: "description",
        content:
          "Plataforma centralizada de proyectos estudiantiles de Ingeniería de Sistemas: PI1, PI2 e Independientes.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: any;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif text-3xl tracking-tight">{value}</span>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-accent-green-deep">
          <TrendingUp className="h-3 w-3" />
          {delta}
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const featured = projects.slice(0, 4);

  return (
    <AppShell breadcrumb={<span className="font-medium text-foreground">Dashboard</span>}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-[var(--gradient-hero)]">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative px-6 py-10 lg:px-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-accent-green-deep px-2 py-0.5 font-mono text-white">
              v1.0
            </span>
            <span className="text-muted-foreground">
              Repositorio académico • Facultad de Ingeniería de Sistemas
            </span>
          </div>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight lg:text-5xl">
            Proyectos que continúan,
            <br />
            <span className="text-accent-green-deep">conocimiento que perdura.</span>
          </h1>
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Proyectos activos" value="48" delta="+6" icon={FolderGit2} />
          <Stat label="Completados" value="127" delta="+12" icon={CheckCircle2} />
          <Stat label="Contribuciones" value="312" delta="+24" icon={GitCommit} />
          <Stat label="Cobertura promedio" value="71%" delta="+4%" icon={Activity} />
        </div>

        {/* Featured projects */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Proyectos destacados
              </h2>
              <p className="text-sm text-muted-foreground">
                Una selección curada del semestre
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-green-deep hover:underline"
            >
              Ver todos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
