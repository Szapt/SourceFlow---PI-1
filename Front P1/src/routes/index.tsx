import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import {
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  GitCommit,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("isAuthenticated")) {
      throw redirect({
        to: "/login",
      });
    }
  },
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
  loading,
}: {
  label: string;
  value: string;
  delta: string;
  icon: any;
  loading?: boolean;
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
        {loading ? (
          <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
        ) : (
          <>
            <span className="font-serif text-3xl tracking-tight">{value}</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-accent-green-deep">
              <TrendingUp className="h-3 w-3" />
              {delta}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { projects, state, error, refetch } = useGitHubRepos();

  const isLoading = state === "idle" || state === "loading";

  // ── KPIs calculados desde datos reales ────────────────────────────────────
  const activeCount = projects.filter((p) => p.status === "in_progress").length;
  const completedCount = projects.filter((p) => p.status === "complete").length;
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);

  // Primeros 4 proyectos como "destacados"
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
        {/* Banner de error */}
        {state === "error" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">No se pudieron cargar los proyectos</p>
              <p className="mt-0.5 text-xs text-red-400/80">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="shrink-0 rounded-md border border-red-500/40 px-2.5 py-1 text-xs font-medium hover:bg-red-500/20"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Proyectos activos"
            value={String(activeCount)}
            delta={`${activeCount > 0 ? "+" : ""}${activeCount}`}
            icon={FolderGit2}
            loading={isLoading}
          />
          <Stat
            label="Completados"
            value={String(completedCount)}
            delta={`${completedCount > 0 ? "+" : ""}${completedCount}`}
            icon={CheckCircle2}
            loading={isLoading}
          />
          <Stat
            label="Estrellas totales"
            value={String(totalStars)}
            delta={`${totalStars > 0 ? "+" : ""}${totalStars}`}
            icon={GitCommit}
            loading={isLoading}
          />
        </div>

        {/* Featured projects */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Proyectos destacados
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Cargando proyectos…"
                  : `${projects.length} proyecto${projects.length !== 1 ? "s" : ""} en la plataforma`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={isLoading}
                title="Sincronizar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-green-deep hover:underline"
              >
                Ver todos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Skeletons de carga */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-border bg-surface"
                />
              ))}
            </div>
          )}

          {/* Proyectos reales */}
          {!isLoading && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}

          {/* Estado vacío */}
          {state === "success" && projects.length === 0 && (
            <div className="mt-12 grid place-items-center gap-2 text-center">
              <p className="text-sm font-medium text-foreground">
                No hay proyectos registrados en la plataforma aún.
              </p>
              <Link
                to="/new"
                className="mt-2 text-xs text-accent-green-deep hover:underline"
              >
                Sube el primero
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
