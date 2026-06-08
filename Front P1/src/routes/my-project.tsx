import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DeliveryStatusCard } from "@/components/DeliveryStatusCard";

import { courseColor, typeColor, parseGithubRepo, Project } from "@/data/projects";
import {
  Briefcase,
  Github,
  ExternalLink,
  Settings2,
  Upload,
  PencilLine,
  Users,
  GitBranch,
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
  submissionDate?: string;
  isSubmissionAvailable?: boolean;
  technologies?: string[];
  studentNames?: string[];
}

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (userEmail) {
        headers["X-User-Email"] = userEmail;
      }

      try {
        const response = await fetch(`${BACKEND}/my-project`, {
          headers,
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Error al cargar tu proyecto: ${response.status}`);
        }

        const text = await response.text();
        const data: BackendProjectResponse | null = text.trim().length
          ? JSON.parse(text)
          : null;

        if (data) {
          setProject(mapBackendProject(data));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="max-w-md">
            <p className="text-sm text-muted-foreground">Cargando tu proyecto...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="max-w-md">
            <h1 className="font-serif text-2xl">Aún no has subido ningún proyecto en el semestre actual.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sube tu proyecto integrador para empezar a gestionarlo desde aquí.
            </p>
            <Link
              to="/new"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Subir mi proyecto
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

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
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
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
    testCoverage: 0,
    stars: 0,
    forks: 0,
    openIssues: 0,
    repoUrl,
    githubRepo,
    submissionDate: data.submissionDate ?? undefined,
    isSubmissionAvailable: data.isSubmissionAvailable ?? false,
    activity: [],
  };
}

function ActionTile({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
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
