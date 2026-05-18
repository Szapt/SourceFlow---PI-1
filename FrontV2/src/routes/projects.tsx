import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  projects,
  courseColor,
  typeColor,
  allTechnologies,
  ProjectStatus,
  Course,
  ProjectType,
} from "@/data/projects";
import {
  Search,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  Star,
  GitFork,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Proyectos — SourceFlow" },
      {
        name: "description",
        content:
          "Explora todos los proyectos integradores: filtra por curso, tipo, tecnología y estado.",
      },
    ],
  }),
  component: ProjectsPage,
});

const courses: ("Todos" | Course)[] = ["Todos", "PI1", "PI2", "Independiente"];
const statuses: ("Todos" | ProjectStatus)[] = [
  "Todos",
  "complete",
  "in_progress",
  "abandoned",
];
const types: ("Todos" | ProjectType)[] = [
  "Todos",
  "Investigativo",
  "Desarrollo",
  "Emprendimiento",
];
const statusLbl: Record<string, string> = {
  Todos: "Todos los estados",
  complete: "Completos",
  in_progress: "En progreso",
  abandoned: "Abandonados",
};

function ProjectsPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [course, setCourse] = useState<(typeof courses)[number]>("Todos");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Todos");
  const [type, setType] = useState<(typeof types)[number]>("Todos");
  const [techs, setTechs] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const techList = useMemo(() => allTechnologies, []);

  const filtered = projects.filter((p) => {
    if (course !== "Todos" && p.course !== course) return false;
    if (status !== "Todos" && p.status !== status) return false;
    if (type !== "Todos" && p.type !== type) return false;
    if (techs.length > 0 && !techs.every((t) => p.technologies.includes(t)))
      return false;
    if (q && !`${p.name} ${p.short}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  const toggleTech = (t: string) =>
    setTechs((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const clearFilters = () => {
    setCourse("Todos");
    setStatus("Todos");
    setType("Todos");
    setTechs([]);
    setQ("");
  };

  const hasFilters =
    course !== "Todos" ||
    status !== "Todos" ||
    type !== "Todos" ||
    techs.length > 0 ||
    q.length > 0;

  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Proyectos</span>
        </div>
      }
    >
      <div className="px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight">Proyectos</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} de {projects.length} proyectos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar proyecto…"
                className="h-9 w-64 rounded-md border border-border bg-surface pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent-green focus:ring-2 focus:ring-accent-green/15"
              />
            </div>
            <div className="flex h-9 items-center rounded-md border border-border bg-surface p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded",
                  view === "grid" && "bg-muted",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("table")}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded",
                  view === "table" && "bg-muted",
                )}
              >
                <Rows3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>

          <FilterRow label="Curso">
            {courses.map((c) => (
              <Chip
                key={c}
                active={course === c}
                onClick={() => setCourse(c)}
                tone="green"
              >
                {c}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Tipo">
            {types.map((t) => (
              <Chip
                key={t}
                active={type === t}
                onClick={() => setType(t)}
                tone="violet"
              >
                {t}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Estado">
            {statuses.map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
                tone="blue"
              >
                {statusLbl[s]}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Tecnologías">
            {techList.map((t) => (
              <Chip
                key={t}
                active={techs.includes(t)}
                onClick={() => toggleTech(t)}
                tone="mono"
              >
                {t}
              </Chip>
            ))}
          </FilterRow>
        </div>

        {/* Content */}
        {view === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Proyecto</th>
                  <th className="px-4 py-3 text-left font-medium">Curso</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Stack</th>
                  <th className="px-4 py-3 text-left font-medium">Calidad</th>
                  <th className="px-4 py-3 text-left font-medium">Autores</th>
                  <th className="px-4 py-3 text-left font-medium">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to="/projects/$slug"
                        params={{ slug: p.slug }}
                        className="font-medium text-foreground hover:text-accent-green-deep"
                      >
                        {p.name}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {p.short}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                          courseColor[p.course],
                        )}
                      >
                        {p.course}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                          typeColor[p.type],
                        )}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.technologies.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full quality-bar"
                            style={{ width: `${p.qualityScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums">
                          {p.qualityScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1.5">
                        {p.authors.map((a) => (
                          <div
                            key={a.initials}
                            className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-blue/70 text-[9px] font-semibold text-white ring-2 ring-surface"
                          >
                            {a.initials}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {p.stars}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {p.forks}
                        </span>
                        <span>· {p.updatedAt}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-3 first-of-type:border-t-0 first-of-type:pt-0 md:flex-row md:items-center md:gap-3">
      <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone: "green" | "blue" | "violet" | "mono";
}) {
  const activeStyles: Record<typeof tone, string> = {
    green: "border-accent-green/40 bg-accent-green/10 text-accent-green-deep",
    blue: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
    violet: "border-accent-violet/40 bg-accent-violet/10 text-accent-violet",
    mono: "border-foreground/30 bg-foreground/5 text-foreground",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? activeStyles[tone]
          : "border-border text-muted-foreground hover:bg-muted",
        tone === "mono" && "font-mono",
      )}
    >
      {children}
    </button>
  );
}
