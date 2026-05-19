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
interface DBProject {
  id: number;
  name: string;
  description: string | null;
  repo_url: string;           // ej: "https://github.com/MariAgudelo2/Poi-Bank"
  course: number | null;
  semester: number | null;
  project_type: number | null;
  state: number | null;
  manifest_url: string | null;
  tutor: number | null;
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
      const dbRes = await fetch(`${BACKEND}/projects`);
      if (!dbRes.ok) {
        throw new Error(`Error al obtener proyectos del servidor: ${dbRes.status}`);
      }
      const dbProjects: DBProject[] = await dbRes.json();

      if (dbProjects.length === 0) return [];

      // ── 2. Enriquecer cada proyecto con la GitHub API en paralelo ──────────
      const enriched = await Promise.allSettled(
        dbProjects.map(async (dbProject): Promise<Project | null> => {
          const parsed = parseGitHubUrl(dbProject.repo_url);
          if (!parsed) return null;

          const ghRes = await fetch(
            `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
            { headers: GH_HEADERS }
          );

          if (!ghRes.ok) {
            // Si el repo no existe o es privado, construimos un Project mínimo
            // con los datos que tenemos en la DB
            return buildFallbackProject(dbProject);
          }

          const ghRepo: GitHubRepo = await ghRes.json();
          // Inyectamos los datos de DB en el repo de GitHub para que el mapper
          // pueda usarlos (course, semester, etc.)
          ghRepo._db = dbProject;

          return mapGitHubRepoToProject(ghRepo);
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
  const parsed = parseGitHubUrl(db.repo_url);
  const slug = parsed?.repo ?? String(db.id);

  return {
    id: String(db.id),
    slug,
    name: db.name,
    short: db.description ?? "Sin descripción.",
    course: "Independiente",
    semester: db.semester ? String(db.semester) : "",
    type: "Desarrollo",
    status: "in_progress",
    technologies: [],
    authors: [{ name: slug, initials: slug.slice(0, 2).toUpperCase() }],
    stars: 0,
    forks: 0,
    openIssues: 0,
    qualityScore: 40,
    updatedAt: "—",
    repoUrl: db.repo_url.replace("https://", ""),
    testCoverage: 0,
    activity: [],
    isPrivate: false,
  };
}
