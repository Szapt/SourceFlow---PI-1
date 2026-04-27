import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityIndicator } from "@/components/QualityIndicator";
import { getProject, courseColor, Project } from "@/data/projects";
import {
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Code2,
  TestTube2,
  ListChecks,
  BookOpen,
  GitCommit,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$slug")({
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
  component: ProjectDetail,
});

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "docs", label: "Documentación", icon: BookOpen },
  { id: "code", label: "Código", icon: Code2 },
  { id: "tests", label: "Pruebas", icon: TestTube2 },
  { id: "issues", label: "Issues", icon: ListChecks },
] as const;

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: Project };
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");

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
      {/* Header */}
      <div className="border-b border-border px-6 pt-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              courseColor[project.course],
            )}
          >
            {project.course}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {project.semester}
          </span>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-4xl tracking-tight">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {project.short}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
              <Star className="h-3.5 w-3.5" /> Star{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {project.stars}
              </span>
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
              <GitFork className="h-3.5 w-3.5" /> Fork{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {project.forks}
              </span>
            </button>
            <a
              href={`https://${project.repoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Acceder al repositorio
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-accent-green text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.id === "issues" && (
                <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                  {project.openIssues}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        {tab === "overview" && <Overview project={project} />}
        {tab === "docs" && <DocsTab />}
        {tab === "code" && <CodeTab project={project} />}
        {tab === "tests" && <TestsTab project={project} />}
        {tab === "issues" && <IssuesTab project={project} />}
      </div>
    </AppShell>
  );
}

/* ── Overview with Activity + README ── */

function Overview({ project }: { project: Project }) {
  const features = [
    { done: true, txt: "Autenticación de usuarios con JWT" },
    { done: true, txt: "Captura biométrica con OpenCV" },
    { done: true, txt: "Panel docente con métricas en tiempo real" },
    { done: false, txt: "Exportación de reportes a PDF" },
    { done: false, txt: "Integración con Moodle vía LTI 1.3" },
  ];
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Activity */}
        {project.activity.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="h-4 w-4" />
              Actividad reciente
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <ul className="divide-y divide-border">
                {project.activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[10px] font-semibold text-white">
                      {a.initials}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="leading-snug">
                        <span className="font-medium">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.what}</span>
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        hace {a.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* README */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            README.md
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="prose-doc">
              <h1>{project.name}</h1>
              <p>{project.short}</p>

              <h2>Problema</h2>
              <p>
                Este proyecto nació en {project.semester} como respuesta a una
                necesidad identificada dentro de la facultad. El equipo detectó
                una oportunidad de mejora y propuso una solución tecnológica
                viable.
              </p>

              <h2>Stack tecnológico</h2>
              <ul>
                {project.technologies.map((t) => (
                  <li key={t}><strong>{t}</strong></li>
                ))}
              </ul>

              <h2>Configuración del entorno</h2>
              <pre>{`# 1. Clonar el repositorio
git clone https://${project.repoUrl}

# 2. Instalar dependencias
cd ${project.slug} && npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Ejecutar
npm run dev`}</pre>

              <h2>Equipo</h2>
              <ul>
                {project.authors.map((a) => (
                  <li key={a.initials}>{a.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Funcionalidades
          </h2>
          <ul className="rounded-xl border border-border bg-surface">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                {f.done ? (
                  <CheckCircle2 className="h-4 w-4 text-accent-emerald" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    !f.done && "text-muted-foreground line-through",
                  )}
                >
                  {f.txt}
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {f.done ? "implementado" : "pendiente"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold">Calidad del proyecto</h3>
          <div className="mt-4 space-y-3">
            <QualityIndicator label="Documentación" value={project.documentationLevel} />
            <QualityIndicator label="Calidad general" value={project.qualityScore} />
            <QualityIndicator label="Cobertura de pruebas" value={project.testCoverage} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div>
              <div className="font-mono text-lg">{project.stars}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stars</div>
            </div>
            <div>
              <div className="font-mono text-lg">{project.forks}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Forks</div>
            </div>
            <div>
              <div className="font-mono text-lg">{project.openIssues}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Issues</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Equipo</h3>
          <ul className="space-y-2">
            {project.authors.map((a) => (
              <li key={a.initials} className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[10px] font-semibold text-white">
                  {a.initials}
                </div>
                <span className="text-sm">{a.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Stack</h3>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <a
          href={`https://${project.repoUrl}`}
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">{project.repoUrl}</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      </aside>
    </div>
  );
}

function DocsTab() {
  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <p className="text-sm text-muted-foreground">
        Vista resumida — para la documentación completa ver{" "}
        <Link to="/docs" className="text-accent-green-deep underline">
          /docs
        </Link>
        .
      </p>
      <div className="prose-doc mt-4">
        <h1>Guía rápida</h1>
        <h2>Instalación</h2>
        <pre>{`git clone repo.git\ncd repo\nbun install\nbun run dev`}</pre>
        <h2>Arquitectura</h2>
        <p>
          El sistema usa una arquitectura de microservicios con un broker MQTT
          como intermediario entre los nodos sensores y el backend de
          analítica.
        </p>
      </div>
    </div>
  );
}

function CodeTab({ project }: { project: Project }) {
  const commits = [
    { sha: "a3f7b2c", msg: "feat: add face embeddings cache", who: "MR", time: "2h" },
    { sha: "9e1d4f8", msg: "fix: handle low-light frames", who: "AG", time: "1d" },
    { sha: "1c4a823", msg: "docs: update setup guide", who: "MR", time: "3d" },
    { sha: "7b22e09", msg: "refactor: split routers", who: "AG", time: "1w" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-sm">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          main
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{commits.length * 23} commits</span>
        </div>
        <a
          href={`https://${project.repoUrl}`}
          className="inline-flex items-center gap-1 text-xs text-accent-green-deep hover:underline"
        >
          Abrir repositorio <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <ul className="overflow-hidden rounded-xl border border-border bg-surface">
        {commits.map((c) => (
          <li
            key={c.sha}
            className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
          >
            <GitCommit className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate text-sm">{c.msg}</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {c.sha}
            </code>
            <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[9px] font-semibold text-white">
              {c.who}
            </div>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {c.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestsTab({ project }: { project: Project }) {
  const suites = [
    { name: "auth/login.test.ts", passed: 12, failed: 0 },
    { name: "vision/embeddings.test.ts", passed: 24, failed: 1 },
    { name: "api/attendance.test.ts", passed: 18, failed: 0 },
    { name: "ui/dashboard.test.tsx", passed: 9, failed: 2 },
  ];
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
        <h3 className="text-sm font-semibold">Cobertura</h3>
        <div className="mt-4 grid place-items-center">
          <div
            className="grid h-32 w-32 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--accent-emerald) ${
                project.testCoverage * 3.6
              }deg, var(--muted) 0)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-surface">
              <span className="font-mono text-2xl">{project.testCoverage}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface lg:col-span-2">
        <div className="border-b border-border px-5 py-3 text-sm font-semibold">
          Suites
        </div>
        <ul className="divide-y divide-border">
          {suites.map((s) => (
            <li key={s.name} className="flex items-center gap-3 px-5 py-3 text-sm">
              <TestTube2 className="h-4 w-4 text-muted-foreground" />
              <code className="flex-1 font-mono text-xs">{s.name}</code>
              <span className="text-xs text-accent-emerald">
                ✓ {s.passed}
              </span>
              {s.failed > 0 && (
                <span className="text-xs text-destructive">✕ {s.failed}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IssuesTab({ project }: { project: Project }) {
  const issues = [
    { n: 42, title: "Mejorar performance en aulas con +60 estudiantes", labels: ["performance", "p1"], who: "MR", time: "2d" },
    { n: 41, title: "Error en exportación de reportes vacíos", labels: ["bug"], who: "AG", time: "5d" },
    { n: 39, title: "Soporte multi-cámara", labels: ["feature"], who: "—", time: "1w" },
    { n: 35, title: "Documentar endpoints WebSocket", labels: ["docs"], who: "—", time: "2w" },
    { n: 33, title: "Pruebas E2E para flujo de check-in", labels: ["tests"], who: "AG", time: "3w" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
        <span className="font-semibold">
          {project.openIssues} abiertos · 87 cerrados
        </span>
        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Nuevo issue
        </button>
      </div>
      <ul className="divide-y divide-border">
        {issues.map((i) => (
          <li key={i.n} className="flex items-center gap-3 px-5 py-3">
            <AlertCircle className="h-4 w-4 text-accent-emerald" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{i.title}</p>
              <p className="text-xs text-muted-foreground">
                #{i.n} abierto hace {i.time} por {i.who}
              </p>
            </div>
            <div className="hidden gap-1 md:flex">
              {i.labels.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </div>
  );
}
