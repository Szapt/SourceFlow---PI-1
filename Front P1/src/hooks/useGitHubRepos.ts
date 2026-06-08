import { useEffect, useState } from "react";
import { Project } from "@/data/projects";
import { mapGitHubRepoToProject } from "./mapGitHubRepoToProject";

export type FetchState = "idle" | "loading" | "success" | "error";

export interface UseGitHubReposResult {
  projects: Project[];
  state: FetchState;
  error: string | null;
  refetch: () => void;
}

// ── Shape de la tabla `projects` en Neon ──────────────────────────────────────
type DbReference = number | string | { id?: number; name?: string } | null;

interface DBProject {
  id: number;
  name: string;
  description: string | null;
  repoUrl: string;           // ej: "https://github.com/MariAgudelo2/Poi-Bank"
  course: DbReference;
  semester: DbReference;
  projectType: DbReference;
  state: DbReference;
  manifestUrl: string | null;
  tutor: DbReference;
  technologies?: string[];
}

function dbReferenceName(ref: DbReference): string {
  if (ref == null) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "number") return String(ref);
  return ref.name ?? (ref.id != null ? String(ref.id) : "");
}

// ── GitHub API shape ──────────────────────────────────────────────────────────
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  visibility: "public" | "private" | "internal";
  watchers_count: number;
  homepage: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  // Campos extra inyectados desde la DB para preservar info institucional
  _db?: DBProject;
}

const BACKEND = "http://localhost:8080";
const GH_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

/**
 * Extrae el owner y el repo name desde una GitHub URL.
 * "https://github.com/MariAgudelo2/Poi-Bank" → { owner: "MariAgudelo2", repo: "Poi-Bank" }
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

/**
 * Fetches projects from the SourceFlow backend (Neon DB),
 * then enriches each one with live data from the GitHub API.
 *
 * Flow:
 *   1. GET /api/projects          → lista de proyectos con repo_url
 *   2. Para cada repo_url         → GET api.github.com/repos/{owner}/{repo}
 *   3. mapGitHubRepoToProject()   → convierte al modelo interno Project
 */
export function useGitHubRepos(_options?: {
  username?: string | null;
  token?: string | null;
}): UseGitHubReposResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setError(null);

    async function load(): Promise<Project[]> {
      // ── 1. Obtener proyectos desde el backend ──────────────────────────────
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const dbRes = await fetch(`${BACKEND}/projects`, { headers });
      if (!dbRes.ok) {
        throw new Error(`Error al obtener proyectos del servidor: ${dbRes.status}`);
      }
      // Backend now returns flattened DTOs (ProjectResponseDTO) with fields like
      // `semesterName`, `typeName`, `stateName`, `courseName`, `technologies`.
      // Normalize into the DBProject shape expected by the rest of the flow.
      const raw = await dbRes.json();
      const dbProjects: DBProject[] = (raw || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? null,
        repoUrl: r.repoUrl ?? r.repo_url ?? "",
        // Prefer flattened names from DTO; fall back to legacy relational shape
        course: r.courseName ?? r.course ?? null,
        semester: r.semesterName ?? r.semester ?? null,
        projectType: r.typeName ?? r.projectType ?? null,
        state: r.stateName ?? r.state ?? null,
        manifestUrl: r.manifestUrl ?? r.manifest_url ?? null,
        tutor: r.tutor ?? null,
        technologies: r.technologies ?? undefined,
      }));

      if (dbProjects.length === 0) return [];

      // ── 2. Enriquecer cada proyecto con la GitHub API en paralelo ──────────
      const enriched = await Promise.allSettled(
        dbProjects.map(async (dbProject): Promise<Project | null> => {
          try {
            const parsed = parseGitHubUrl(dbProject.repoUrl);
            if (!parsed) return buildFallbackProject(dbProject);

            const ghRes = await fetch(
              `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
              { headers: GH_HEADERS }
            );

            if (!ghRes.ok) {
              return buildFallbackProject(dbProject);
            }

            const ghRepo: GitHubRepo = await ghRes.json();
            ghRepo._db = dbProject;

            return mapGitHubRepoToProject(ghRepo);
          } catch (e) {
            console.error("Error al enriquecer repositorio con GitHub:", e);
            return buildFallbackProject(dbProject);
          }
        })
      );

      return enriched
        .filter(
          (r): r is PromiseFulfilledResult<Project> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);
    }

    load()
      .then((result) => {
        if (!cancelled) {
          setProjects(result);
          setState("success");
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setState("error");
        }
      });

    return () => { cancelled = true; };
  }, [tick]);

  return {
    projects,
    state,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}

// ── Fallback: proyecto sin datos de GitHub (repo privado o no encontrado) ─────

function buildFallbackProject(db: DBProject): Project {
  const parsed = parseGitHubUrl(db.repoUrl);
  const slug = parsed?.repo ?? String(db.id);

  return {
    id: String(db.id),
    slug,
    name: db.name,
    short: db.description ?? "Sin descripción.",
    course: "Independiente",
    semester: dbReferenceName(db.semester),
    type: "Desarrollo",
    status: "in_progress",
    technologies: [],
    authors: [{ name: slug, initials: slug.slice(0, 2).toUpperCase() }],
    stars: 0,
    forks: 0,
    openIssues: 0,
    updatedAt: "—",
    repoUrl: db.repoUrl ? db.repoUrl.replace("https://", "") : "",
    testCoverage: 0,
    activity: [],
    isPrivate: false,
  };
}
