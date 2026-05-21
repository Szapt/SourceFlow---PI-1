import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DeliveryStatusCard } from "@/components/DeliveryStatusCard";

import { courseColor, typeColor, parseGithubRepo, Project } from "@/data/projects";
import { mapGitHubRepoToProject } from "@/hooks/mapGitHubRepoToProject";
import { GitHubRepo } from "@/hooks/useGitHubRepos";
import {
  Briefcase,
  Github,
  ExternalLink,
  Settings2,
  Upload,
  PencilLine,
  Users,
  GitBranch,
  RefreshCw,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const BACKEND = "http://localhost:8080";

interface BackendProjectResponse {
  id: number;
  name: string;
  description: string | null;
  repoUrl: string;
  manifestUrl?: string;
  courseName?: string;
  semesterName?: string;
  typeName?: string;
  stateName?: string;
  tutorName?: string;
  tutorEmail?: string;
  technologies?: string[];
  studentNames?: string[];
}

const BACKEND = "http://localhost:8080";
const GH_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

// Extrae owner y repo desde una URL de GitHub.
// "https://github.com/MariAgudelo2/Poi-Bank" → { owner: "mariagudelo2", repo: "Poi-Bank" }
function parseRepoPath(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const { pathname } = new URL(repoUrl);
    const parts = pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0].toLowerCase(), repo: parts[1] };
  } catch {
    // Sin protocolo: "github.com/owner/repo"
    const parts = repoUrl.replace(/^github\.com\//, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0].toLowerCase(), repo: parts[1] };
  }
}

type FetchState = "idle" | "loading" | "success" | "error";

export const Route = createFileRoute("/my-project")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("isAuthenticated")) {
      throw redirect({
        to: "/login",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Mi Proyecto — SourceFlow" },
      {
        name: "description",
        content:
          "Espacio de trabajo personal para gestionar y entregar tu proyecto integrador.",
      },
    ],
  }),
  component: MyProjectPage,
});

function MyProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setFetchState("loading");
    setErrorMsg(null);

    async function loadMyProject() {
      // 1. Obtener el username de GitHub del usuario activo desde localStorage
      const githubUsername = localStorage.getItem("github_username")?.toLowerCase() ?? null;

      if (!githubUsername) return null;

      // 2. Obtener todos los proyectos desde el backend (Neon DB)
      const dbRes = await fetch(`${BACKEND}/projects`);
      if (!dbRes.ok) {
        throw new Error(`Error al obtener proyectos del servidor: ${dbRes.status}`);
      }

      interface DBProject {
        id: number;
        name: string;
        description: string | null;
        repoUrl: string;
        course: number | null;
        semester: number | null;
        projectType: number | null;
        state: number | null;
        manifestUrl: string | null;
        tutor: number | null;
      }

      const dbProjects: DBProject[] = await dbRes.json();

      if (dbProjects.length === 0) return null;

      // 3. Para cada proyecto verificar si el usuario activo es owner O colaborador
      //    Consultamos /contributors en paralelo para todos los proyectos.
      interface MatchResult {
        dbProject: DBProject;
        owner: string;
        repo: string;
      }

      const results = await Promise.allSettled(
        dbProjects.map(async (dbProject): Promise<MatchResult | null> => {
          const parsed = parseRepoPath(dbProject.repoUrl);
          if (!parsed) return null;

          const { owner, repo } = parsed;

          // Verificación rápida: ¿el usuario es el owner del repo?
          if (owner === githubUsername) {
            return { dbProject, owner, repo };
          }

          // Verificación extendida: ¿aparece en la lista de colaboradores/contributors?
          try {
            const contribRes = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contributors`,
              { headers: GH_HEADERS }
            );

            if (!contribRes.ok) return null;

            const contributors: { login: string }[] = await contribRes.json();
            const isCollaborator = contributors.some(
              (c) => c.login.toLowerCase() === githubUsername
            );

            return isCollaborator ? { dbProject, owner, repo } : null;
          } catch {
            return null;
          }
        })
      );

      // 4. Tomar el primer proyecto donde el usuario es owner o colaborador
      const match = results
        .filter(
          (r): r is PromiseFulfilledResult<MatchResult> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value)[0];

      if (!match) return null;

      const { dbProject: myDbProject, owner, repo } = match;

      // 5. Enriquecer con datos completos de la GitHub API
      try {
        const ghRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          { headers: GH_HEADERS }
        );

        if (!ghRes.ok) return buildFallback(myDbProject);

        const ghRepo: GitHubRepo = await ghRes.json();
        ghRepo._db = {
          id: myDbProject.id,
          name: myDbProject.name,
          description: myDbProject.description,
          repoUrl: myDbProject.repoUrl,
          course: myDbProject.course,
          semester: myDbProject.semester,
          projectType: myDbProject.projectType,
          state: myDbProject.state,
          manifestUrl: myDbProject.manifestUrl,
          tutor: myDbProject.tutor,
        };

        return mapGitHubRepoToProject(ghRepo);
      } catch {
        return buildFallback(myDbProject);
      }
    }

    function buildFallback(db: {
      id: number;
      name: string;
      description: string | null;
      repoUrl: string;
      semester: number | null;
    }): Project {
      return {
        id: String(db.id),
        slug: db.name.toLowerCase().replace(/\s+/g, "-"),
        name: db.name,
        short: db.description ?? "Sin descripción.",
        course: "Independiente",
        semester: db.semester ? String(db.semester) : "",
        type: "Desarrollo",
        status: "in_progress",
        technologies: [],
        authors: [{ name: "—", initials: "?" }],
        stars: 0,
        forks: 0,
        openIssues: 0,
        qualityScore: 40,
        updatedAt: "—",
        repoUrl: db.repoUrl ? db.repoUrl.replace("https://", "") : "",
        githubRepo: db.repoUrl ?? "",
        testCoverage: 0,
        activity: [],
        documentationLevel: 0,
      };
    }

    loadMyProject()
      .then((result) => {
        if (!cancelled) {
          setProject(result);
          setFetchState("success");
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setErrorMsg(err.message);
          setFetchState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  // ── Estado de carga ────────────────────────────────────────────────────────
  if (fetchState === "idle" || fetchState === "loading") {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Buscando tu proyecto…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Estado de error ────────────────────────────────────────────────────────
  if (fetchState === "error") {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-left">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">No se pudo conectar al servidor</p>
                <p className="mt-0.5 text-xs text-red-400/80">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setTick((t) => t + 1)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Sin proyecto (estado vacío) ────────────────────────────────────────────
  if (!project) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="max-w-md">
            <span className="mb-4 inline-grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface text-muted-foreground">
              <FolderOpen className="h-8 w-8" />
            </span>
            <h1 className="mt-4 font-serif text-2xl tracking-tight">
              Aún no tienes un proyecto
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sube tu proyecto integrador para empezar a gestionarlo desde aquí.
            </p>
            <Link
              to="/new"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Upload className="h-4 w-4" /> Subir mi proyecto
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Proyecto encontrado ────────────────────────────────────────────────────
  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Mi Proyecto</span>
        </div>
      }
    >
      {/* Workspace header */}
      <header className="border-b border-border bg-gradient-to-br from-accent-green-soft/40 via-surface to-surface px-6 pb-8 pt-8 lg:px-10">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent-green-deep">
          <Briefcase className="h-3.5 w-3.5" />
          Espacio de trabajo
        </div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <h1 className="font-serif text-4xl tracking-tight">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {project.short}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  courseColor[project.course],
                )}
              >
                {project.course}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  typeColor[project.type],
                )}
              >
                {project.type}
              </span>
              <StatusBadge status={project.status} />
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {project.semester}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" /> Ver vista pública
            </Link>
            <a
              href={project.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Github className="h-4 w-4" /> Abrir repositorio
            </a>
          </div>
        </div>
      </header>

      {/* Workspace body */}
      <div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-10 lg:px-10">
        <div className="space-y-6 lg:col-span-7">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Settings2 className="h-4 w-4 text-accent-green-deep" />
              Acciones rápidas
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionTile
                icon={PencilLine}
                title="Editar detalles"
                description="Actualiza descripción, stack y autores."
              />
              <ActionTile
                icon={Upload}
                title="Subir documento"
                description="Adjunta el manifiesto o anexos."
              />
              <ActionTile
                icon={Users}
                title="Gestionar equipo"
                description="Invita o remueve colaboradores."
              />
              <ActionTile
                icon={GitBranch}
                title="Sincronizar GitHub"
                description="Refresca commits, issues y README."
                onClick={() => setTick((t) => t + 1)}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Briefcase className="h-4 w-4 text-accent-green-deep" />
              Información del proyecto
            </h2>
            <div className="space-y-4 rounded-xl border border-border bg-surface p-5 text-sm">
              <DetailRow label="Repositorio">
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent-green-deep hover:underline"
                >
                  {project.repoUrl}
                </a>
              </DetailRow>
              <DetailRow label="Equipo">
                <div className="flex flex-wrap gap-2">
                  {project.authors.map((a) => (
                    <span
                      key={a.initials}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-accent-green to-accent-green-mid text-[9px] font-semibold text-white">
                        {a.initials}
                      </span>
                      {a.name}
                    </span>
                  ))}
                </div>
              </DetailRow>
              <DetailRow label="Tecnologías">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.length > 0 ? (
                    project.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin tecnologías registradas</span>
                  )}
                </div>
              </DetailRow>
              <DetailRow label="Última actualización">
                <span className="text-xs text-muted-foreground">
                  {project.updatedAt}
                </span>
              </DetailRow>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-20">
            <DeliveryStatusCard project={project} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function mapBackendProject(data: BackendProjectResponse): Project {
  const githubRepo = data.repoUrl.startsWith("http")
    ? data.repoUrl
    : `https://${data.repoUrl}`;
  const repoUrl = data.repoUrl.replace(/^https?:\/\//, "");
  const parsed = parseGithubRepo(repoUrl);

  const type =
    data.typeName === "Investigativo" ||
      data.typeName === "Desarrollo" ||
      data.typeName === "Emprendimiento"
      ? data.typeName
      : "Desarrollo";

  const course =
    data.courseName === "PI1" ||
      data.courseName === "PI2" ||
      data.courseName === "Independiente"
      ? data.courseName
      : "Independiente";

  const status = data.stateName?.toLowerCase().includes("desarrollo")
    ? "in_progress"
    : data.stateName?.toLowerCase().includes("complet")
      ? "complete"
      : "in_progress";

  const authors = (data.studentNames?.length ? data.studentNames : [data.tutorName || "Equipo"]).map(
    (name) => ({
      name,
      initials: name
        .split(" ")
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2),
    })
  );

  return {
    id: String(data.id),
    slug: parsed?.repo ?? String(data.id),
    name: data.name,
    short: data.description ?? "Sin descripción.",
    course,
    semester: data.semesterName ?? "",
    type,
    status,
    technologies: data.technologies ?? [],
    authors,
    updatedAt: "Actualizado recientemente",
    documentationLevel: 0,
    qualityScore: 0,
    testCoverage: 0,
    stars: 0,
    forks: 0,
    openIssues: 0,
    repoUrl,
    githubRepo,
    activity: [],
  };
}

function ActionTile({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent-green hover:bg-accent-green-soft/30"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent-green-soft text-accent-green-deep">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-40 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
