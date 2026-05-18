import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getProject,
  parseGithubRepo,
  courseColor,
  typeColor,
  Project,
  statusLabel,
} from "@/data/projects";
import {
  ghApi,
  decodeBase64Utf8,
  relativeTime,
  languageColor,
  GhCommit,
} from "@/lib/github";
import {
  projectDocuments,
  ProjectDocument,
  DocumentType,
} from "@/lib/neon";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  GitFork,
  AlertCircle,
  GitBranch,
  Upload,
  FileText,
  Eye,
  Trash2,
  BookOpen,
  Activity,
  ClipboardCheck,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects_/$slug")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project?.name ?? "Proyecto"} — SourceFlow` },
      { name: "description", content: loaderData?.project?.short ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Proyecto no encontrado</p>
          <Link to="/projects" className="mt-2 inline-block text-accent-green-deep">
            Volver a proyectos
          </Link>
        </div>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <p className="text-sm text-destructive">{error.message}</p>
          <Link to="/projects" className="mt-2 inline-block text-accent-green-deep">
            Volver a proyectos
          </Link>
        </div>
      </div>
    </AppShell>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: Project };
  const gh = parseGithubRepo(project.githubRepo);

  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-foreground">
            Proyectos
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{project.name}</span>
        </div>
      }
    >
      <div className="px-6 pt-6 lg:px-10">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent-green-deep"
        >
          <ArrowLeft className="h-4 w-4" /> Proyectos
        </Link>
      </div>

      {/* SECCIÓN 1 — Header */}
      <header className="border-b border-border px-6 pb-8 pt-4 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <h1 className="font-serif text-4xl tracking-tight">{project.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{project.short}</p>

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

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <a
            href={project.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Github className="h-4 w-4" /> Abrir en GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Body: 70/30 layout */}
      <div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-10 lg:px-10">
        <div className="space-y-10 lg:col-span-7">
          <ReadmeSection gh={gh} />
          <ActivitySection gh={gh} />
        </div>

        <aside className="lg:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-20">
            <ManifestoButtonCard />
            <AttributesCard project={project} gh={gh} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ── README ────────────────────────────────────────────────────────── */

function ReadmeSection({ gh }: { gh: { owner: string; repo: string } | null }) {
  const q = useQuery({
    queryKey: ["gh", "readme", gh?.owner, gh?.repo],
    queryFn: () => ghApi.readme(gh!.owner, gh!.repo),
    enabled: !!gh,
  });

  return (
    <section>
      <SectionTitle icon={BookOpen}>README</SectionTitle>
      <div className="rounded-xl border border-border bg-surface p-6">
        {q.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        {q.isError && (
          <EmptyState>
            Este repositorio no tiene un README disponible.
          </EmptyState>
        )}
        {q.data && (
          <article className="prose-doc max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {decodeBase64Utf8(q.data.content)}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </section>
  );
}

/* ── Actividad reciente ────────────────────────────────────────────── */

function ActivitySection({
  gh,
}: {
  gh: { owner: string; repo: string } | null;
}) {
  const q = useQuery({
    queryKey: ["gh", "commits", gh?.owner, gh?.repo],
    queryFn: () => ghApi.commits(gh!.owner, gh!.repo),
    enabled: !!gh,
  });

  return (
    <section>
      <SectionTitle icon={Activity}>Actividad Reciente</SectionTitle>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {q.isLoading && (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </li>
            ))}
          </ul>
        )}
        {q.isError && (
          <div className="p-6">
            <EmptyState>No hay actividad reciente en este repositorio.</EmptyState>
          </div>
        )}
        {q.data && q.data.length === 0 && (
          <div className="p-6">
            <EmptyState>No hay actividad reciente en este repositorio.</EmptyState>
          </div>
        )}
        {q.data && q.data.length > 0 && (
          <ul className="divide-y divide-border">
            {q.data.map((c: GhCommit) => (
              <li key={c.sha} className="flex items-start gap-3 px-4 py-3">
                {c.author?.avatar_url ? (
                  <img
                    src={c.author.avatar_url}
                    alt={c.commit.author.name}
                    className="h-8 w-8 shrink-0 rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[10px] font-semibold text-white">
                    {initials(c.commit.author.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">
                      {c.commit.author.name}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {firstLine(c.commit.message)}
                    </span>
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {relativeTime(c.commit.author.date)}
                  </span>
                </div>
                <a
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground hover:bg-accent-green-soft hover:text-accent-green-deep"
                >
                  {c.sha.slice(0, 7)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ── EAP & Manifiesto ──────────────────────────────────────────────── */

function DocsSection({ projectId }: { projectId: string }) {
  return (
    <section>
      <SectionTitle icon={ClipboardCheck}>EAP y Manifiesto de Entrega</SectionTitle>
      <div className="space-y-4">
        <DocSlot
          projectId={projectId}
          type="eap"
          title="EAP — Estructura de Análisis del Proyecto"
          description="Documento que detalla el análisis estructural del proyecto."
        />
        <DocSlot
          projectId={projectId}
          type="manifiesto"
          title="Manifiesto de Entrega"
          description="Documento formal de entrega final del proyecto."
        />
      </div>
    </section>
  );
}

/* ── Manifiesto de Entrega (PDF, sidebar) ──────────────────────────── */

const MANIFIESTO_PDF_URL =
  "https://www.africau.edu/images/default/sample.pdf";

function ManifestoButtonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold">Manifiesto de Entrega</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Consulta el documento oficial entregado por el equipo del proyecto.
      </p>
      <a
        href={MANIFIESTO_PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
      >
        <FileText className="h-4 w-4" />
        Ver Manifiesto de Entrega
        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      </a>
    </div>
  );
}

function DocSlot({
  projectId,
  type,
  title,
  description,
}: {
  projectId: string;
  type: DocumentType;
  title: string;
  description: string;
}) {
  // local state used as a refresh trigger after upsert/delete
  const [tick, setTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const doc: ProjectDocument | undefined = (() => {
    void tick;
    return projectDocuments.get(projectId, type);
  })();

  const onFile = async (file: File) => {
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      alert("Solo se permiten archivos PDF o DOCX.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    projectDocuments.upsert({
      project_id: projectId,
      type,
      file_name: file.name,
      file_url: dataUrl,
    });
    setTick((t) => t + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {doc ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent-green-soft text-accent-green-deep">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{doc.file_name}</p>
              <p className="text-[11px] text-muted-foreground">
                Subido {relativeTime(doc.uploaded_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" /> Ver documento
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => {
                projectDocuments.remove(projectId, type);
                setTick((t) => t + 1);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" /> Reemplazar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface-muted px-4 py-8 text-center transition-colors hover:border-accent-green hover:bg-accent-green-soft/30"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Subir archivo PDF o DOCX</p>
          <p className="text-xs text-muted-foreground">
            Aún no se ha subido el documento. Haz clic para seleccionar.
          </p>
        </button>
      )}
    </div>
  );
}

/* ── Atributos del proyecto (sidebar derecho) ──────────────────────── */

function AttributesCard({
  project,
  gh,
}: {
  project: Project;
  gh: { owner: string; repo: string } | null;
}) {
  const repoQ = useQuery({
    queryKey: ["gh", "repo", gh?.owner, gh?.repo],
    queryFn: () => ghApi.repo(gh!.owner, gh!.repo),
    enabled: !!gh,
  });
  const langQ = useQuery({
    queryKey: ["gh", "lang", gh?.owner, gh?.repo],
    queryFn: () => ghApi.languages(gh!.owner, gh!.repo),
    enabled: !!gh,
  });

  const totalLang = langQ.data
    ? Object.values(langQ.data).reduce((s, n) => s + n, 0)
    : 0;
  const langs = langQ.data
    ? Object.entries(langQ.data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-4">
      {/* Equipo */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">Equipo</h3>
        <ul className="space-y-2">
          {project.authors.map((a) => (
            <li key={a.initials} className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent-green to-accent-green-mid text-[10px] font-semibold text-white">
                {a.initials}
              </div>
              <span className="text-sm">{a.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Calidad */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold">Calidad</h3>
        <div className="space-y-4">
          <BarMetric label="Documentación" value={project.documentationLevel} />
          <BarMetric label="Calidad" value={project.qualityScore} />
        </div>
      </div>

      {/* Repositorio */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">Repositorio</h3>
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" /> Rama
            </span>
            <span className="font-mono text-xs">
              {repoQ.data?.default_branch ?? <Skeleton className="inline-block h-3 w-12" />}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Último push</span>
            <span className="text-xs">
              {repoQ.data ? (
                relativeTime(repoQ.data.pushed_at)
              ) : (
                <Skeleton className="inline-block h-3 w-16" />
              )}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-3.5 w-3.5" /> Stars
            </span>
            <span className="font-mono text-xs">
              {repoQ.data?.stargazers_count ?? "—"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <GitFork className="h-3.5 w-3.5" /> Forks
            </span>
            <span className="font-mono text-xs">
              {repoQ.data?.forks_count ?? "—"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" /> Issues abiertos
            </span>
            <span className="font-mono text-xs">
              {repoQ.data?.open_issues_count ?? "—"}
            </span>
          </li>
          {repoQ.data?.license && (
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Scale className="h-3.5 w-3.5" /> Licencia
              </span>
              <span className="text-xs">{repoQ.data.license.spdx_id}</span>
            </li>
          )}
        </ul>
      </div>

      {/* Lenguajes */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">Lenguajes</h3>
        {langQ.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        )}
        {langs.length > 0 && totalLang > 0 && (
          <>
            <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {langs.map(([name, bytes]) => (
                <div
                  key={name}
                  style={{
                    width: `${(bytes / totalLang) * 100}%`,
                    backgroundColor: languageColor[name] ?? "var(--accent-green-mid)",
                  }}
                  title={`${name}: ${((bytes / totalLang) * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <ul className="space-y-1.5">
              {langs.map(([name, bytes]) => (
                <li
                  key={name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          languageColor[name] ?? "var(--accent-green-mid)",
                      }}
                    />
                    {name}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {((bytes / totalLang) * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {langQ.isError && (
          <p className="text-xs text-muted-foreground">
            No se pudieron cargar los lenguajes.
          </p>
        )}
      </div>

      {/* Estado */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-2 text-sm font-semibold">Estado actual</h3>
        <p className="text-xs text-muted-foreground">
          Proyecto{" "}
          <span className="font-medium text-foreground">
            {statusLabel[project.status].toLowerCase()}
          </span>{" "}
          del semestre {project.semester}.
        </p>
      </div>
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-4 w-4 text-accent-green-deep" />
      {children}
    </h2>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
  );
}

function BarMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function firstLine(s: string): string {
  return s.split("\n")[0];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
