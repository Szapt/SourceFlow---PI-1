import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityIndicator } from "@/components/QualityIndicator";
import { courseColor } from "@/data/projects";
import { mapGitHubRepoToProject } from "@/hooks/mapGitHubRepoToProject";
import type { GitHubRepo } from "@/hooks/useGitHubRepos";
import {
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  GitBranch,
  FileText,
  Code2,
  ListChecks,
  BookOpen,
  GitCommit,
  Activity,
  Lock,
  Globe,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — SourceFlow` },
      { name: "description", content: `Repositorio ${params.slug} en GitHub` },
    ],
  }),
  component: ProjectDetail,
});

// ── Tipos de la GitHub API que usamos en este archivo ────────────────────────

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  user: { login: string };
  labels: { name: string; color: string }[];
  html_url: string;
}

interface GitHubLanguages {
  [lang: string]: number;
}

// ── Hook: carga toda la info de un repo individual ────────────────────────────

function useRepoDetail(username: string | null, slug: string) {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [languages, setLanguages] = useState<GitHubLanguages>({});
  const [readme, setReadme] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError("No se encontró el nombre de usuario. Por favor inicia sesión.");
      setState("error");
      return;
    }

    let cancelled = false;
    setState("loading");
    setError(null);

    const base = `https://api.github.com/repos/${username}/${slug}`;
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    async function load() {
      // Todas las llamadas en paralelo para máxima velocidad
      const [repoRes, commitsRes, issuesRes, langsRes, readmeRes] =
        await Promise.all([
          fetch(base, { headers }),
          fetch(`${base}/commits?per_page=10`, { headers }),
          fetch(`${base}/issues?state=open&per_page=20`, { headers }),
          fetch(`${base}/languages`, { headers }),
          fetch(`${base}/readme`, {
            headers: { ...headers, Accept: "application/vnd.github.raw+json" },
          }),
        ]);

      if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error(`Repositorio "${slug}" no encontrado.`);
        throw new Error(`Error ${repoRes.status} al cargar el repositorio.`);
      }

      const repoData: GitHubRepo = await repoRes.json();
      const commitsData: GitHubCommit[] = commitsRes.ok ? await commitsRes.json() : [];
      const issuesData: GitHubIssue[] = issuesRes.ok ? await issuesRes.json() : [];
      const langsData: GitHubLanguages = langsRes.ok ? await langsRes.json() : {};
      const readmeText = readmeRes.ok ? await readmeRes.text() : null;

      if (!cancelled) {
        setRepo(repoData);
        setCommits(commitsData);
        setIssues(issuesData);
        setLanguages(langsData);
        setReadme(readmeText);
        setState("success");
      }
    }

    load().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setState("error");
      }
    });

    return () => { cancelled = true; };
  }, [username, slug]);

  return { repo, commits, issues, languages, readme, state, error };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? "es" : ""}`;
  return `hace ${Math.floor(months / 12)} año${Math.floor(months / 12) > 1 ? "s" : ""}`;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "code", label: "Código", icon: Code2 },
  { id: "issues", label: "Issues", icon: ListChecks },
  { id: "docs", label: "README", icon: BookOpen },
] as const;

// ── Componente principal ──────────────────────────────────────────────────────

function ProjectDetail() {
  const { slug } = Route.useParams();
  const username = typeof window !== "undefined"
    ? localStorage.getItem("github_username")
    : null;
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");

  const { repo, commits, issues, languages, readme, state, error } =
    useRepoDetail(username, slug);

  const project = repo ? mapGitHubRepoToProject(repo) : null;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <AppShell
        breadcrumb={
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-foreground">Proyectos</Link>
            <span>/</span>
            <span className="font-medium text-foreground">{slug}</span>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-8 lg:px-10">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-surface" />
          <div className="h-4 w-96 animate-pulse rounded bg-surface" />
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state === "error" || !project || !repo) {
    return (
      <AppShell
        breadcrumb={
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-foreground">Proyectos</Link>
            <span>/</span>
            <span className="font-medium text-foreground">{slug}</span>
          </div>
        }
      >
        <div className="grid min-h-[60vh] place-items-center px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{error ?? "Repositorio no encontrado."}</p>
            <Link to="/projects" className="mt-4 inline-block text-sm text-accent-green-deep hover:underline">
              Volver a proyectos
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-foreground">Proyectos</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{project.name}</span>
        </div>
      }
    >
      {/* ── Header ── */}
      <div className="border-b border-border px-6 pt-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", courseColor[project.course])}>
            {project.course}
          </span>
          {repo.private ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Privado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Globe className="h-2.5 w-2.5" /> Público
            </span>
          )}
          <StatusBadge status={project.status} />
          {repo.fork && (
            <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Fork
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-4xl tracking-tight">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.short}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium">
              <Star className="h-3.5 w-3.5" /> Star{" "}
              <span className="font-mono text-xs text-muted-foreground">{project.stars}</span>
            </div>
            <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium">
              <GitFork className="h-3.5 w-3.5" /> Fork{" "}
              <span className="font-mono text-xs text-muted-foreground">{project.forks}</span>
            </div>
            <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium">
              <Eye className="h-3.5 w-3.5" />
              <span className="font-mono text-xs text-muted-foreground">{repo.watchers_count ?? 0}</span>
            </div>
            <a
              href={repo.html_url}
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
                  {issues.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="px-6 py-8 lg:px-10">
        {tab === "overview" && (
          <OverviewTab repo={repo} project={project} languages={languages} commits={commits} />
        )}
        {tab === "code" && (
          <CodeTab repo={repo} commits={commits} />
        )}
        {tab === "issues" && (
          <IssuesTab issues={issues} repoUrl={repo.html_url} />
        )}
        {tab === "docs" && (
          <ReadmeTab readme={readme} repoName={repo.name} />
        )}
      </div>
    </AppShell>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({
  repo,
  project,
  languages,
  commits,
}: {
  repo: GitHubRepo;
  project: ReturnType<typeof mapGitHubRepoToProject>;
  languages: GitHubLanguages;
  commits: GitHubCommit[];
}) {
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6 lg:col-span-2">

        {/* Actividad reciente (últimos commits) */}
        {commits.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="h-4 w-4" /> Actividad reciente
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <ul className="divide-y divide-border">
                {commits.slice(0, 5).map((c) => (
                  <li key={c.sha} className="flex items-start gap-3 px-4 py-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[10px] font-semibold text-white">
                      {initials(c.author?.login ?? c.commit.author.name)}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate leading-snug">
                        <span className="font-medium">{c.author?.login ?? c.commit.author.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {c.commit.message.split("\n")[0]}
                        </span>
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {relativeDate(c.commit.author.date)}
                      </span>
                    </div>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {c.sha.slice(0, 7)}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Descripción / About */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="h-4 w-4" /> Acerca del repositorio
          </h2>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3 text-sm">
            {repo.description && <p>{repo.description}</p>}
            {repo.homepage && (
              <a href={repo.homepage} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent-green-deep hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> {repo.homepage}
              </a>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {repo.topics.map((t) => (
                <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground sm:grid-cols-3">
              <span>🍴 Branch por defecto: <strong className="text-foreground">{repo.default_branch}</strong></span>
              <span>📅 Creado: <strong className="text-foreground">{new Date(repo.created_at).toLocaleDateString("es-CO")}</strong></span>
              <span>🔄 Último push: <strong className="text-foreground">{relativeDate(repo.pushed_at)}</strong></span>
            </div>
          </div>
        </section>

        {/* Lenguajes */}
        {totalBytes > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Lenguajes
            </h2>
            <div className="rounded-xl border border-border bg-surface p-5">
              {/* Barra de colores */}
              <div className="flex h-2.5 overflow-hidden rounded-full">
                {Object.entries(languages).map(([lang, bytes]) => (
                  <div
                    key={lang}
                    style={{ width: `${(bytes / totalBytes) * 100}%` }}
                    className="first:rounded-l-full last:rounded-r-full"
                    title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(languages).map(([lang, bytes]) => (
                  <span key={lang} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{lang}</span>
                    {((bytes / totalBytes) * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold">Calidad del proyecto</h3>
          <div className="mt-4 space-y-3">
            <QualityIndicator label="Calidad general" value={project.qualityScore} />
            <QualityIndicator label="Documentación" value={repo.description ? 70 : 20} />
            <QualityIndicator label="Cobertura de pruebas" value={project.testCoverage} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div>
              <div className="font-mono text-lg">{repo.stargazers_count}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stars</div>
            </div>
            <div>
              <div className="font-mono text-lg">{repo.forks_count}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Forks</div>
            </div>
            <div>
              <div className="font-mono text-lg">{repo.open_issues_count}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Issues</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Stack</h3>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <span key={t} className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:bg-muted"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs">{repo.full_name}</span>
          </div>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        </a>
      </aside>
    </div>
  );
}

// ── Tab: Código / Commits ─────────────────────────────────────────────────────

function CodeTab({ repo, commits }: { repo: GitHubRepo; commits: GitHubCommit[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-sm">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          {repo.default_branch}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{repo.open_issues_count} issues abiertos</span>
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent-green-deep hover:underline"
        >
          Abrir en GitHub <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {commits.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          No se encontraron commits recientes.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {commits.map((c) => (
            <li key={c.sha} className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-b-0">
              <GitCommit className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{c.commit.message.split("\n")[0]}</span>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {c.sha.slice(0, 7)}
              </code>
              <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-green/80 to-accent-green-mid/70 text-[9px] font-semibold text-white">
                {initials(c.author?.login ?? c.commit.author.name)}
              </div>
              <span className="w-16 text-right text-xs text-muted-foreground">
                {relativeDate(c.commit.author.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tab: Issues ───────────────────────────────────────────────────────────────

function IssuesTab({ issues, repoUrl }: { issues: GitHubIssue[]; repoUrl: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
        <span className="font-semibold">{issues.length} issues abiertos</span>
        <a
          href={`${repoUrl}/issues/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Nuevo issue <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {issues.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No hay issues abiertos. ¡Todo en orden!
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {issues.map((i) => (
            <li key={i.number} className="flex items-center gap-3 px-5 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-accent-emerald" />
              <div className="min-w-0 flex-1">
                <a
                  href={i.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium hover:text-accent-green-deep"
                >
                  {i.title}
                </a>
                <p className="text-xs text-muted-foreground">
                  #{i.number} abierto {relativeDate(i.created_at)} por {i.user.login}
                </p>
              </div>
              <div className="hidden gap-1 md:flex">
                {i.labels.map((l) => (
                  <span
                    key={l.name}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    style={{ borderColor: `#${l.color}40`, color: `#${l.color}` }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tab: README ───────────────────────────────────────────────────────────────

function ReadmeTab({ readme, repoName }: { readme: string | null; repoName: string }) {
  if (!readme) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        Este repositorio no tiene un README.md.
      </div>
    );
  }

  // Renderizado básico de Markdown como texto preformateado.
  // Si tienes react-markdown instalado puedes reemplazar el <pre> por <ReactMarkdown>.
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <BookOpen className="h-4 w-4" /> README.md — {repoName}
      </div>
      <pre className="prose-doc whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
        {readme}
      </pre>
    </div>
  );
}
