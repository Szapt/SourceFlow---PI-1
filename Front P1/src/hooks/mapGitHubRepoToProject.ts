import { Project, ProjectStatus, ProjectType, Course } from "@/data/projects";
import { GitHubRepo } from "./useGitHubRepos";

type DbReference = number | string | { id?: number; name?: string } | null | undefined;

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

function dbReferenceName(ref: DbReference): string | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "string") return ref;
  if (typeof ref === "number") return String(ref);
  return ref.name ?? (ref.id != null ? String(ref.id) : undefined);
}

function dbReferenceId(ref: DbReference): number | undefined {
  if (typeof ref === "number") return ref;
  if (typeof ref === "string" && /^\d+$/.test(ref)) return Number(ref);
  if (ref && typeof ref === "object" && ref.id != null) return ref.id;
  return undefined;
}

function deriveTechnologies(repo: GitHubRepo): string[] {
  const techs = new Set<string>();
  if (repo.language) techs.add(repo.language);
  repo.topics.forEach((t) => techs.add(t));
  return Array.from(techs).slice(0, 12);
}

function deriveCourse(repo: GitHubRepo): Course {
  const tokens = [repo.name, ...repo.topics].join(" ").toLowerCase();
  if (tokens.includes("pi1") || tokens.includes("proyecto-integrador-1")) return "PI1";
  if (tokens.includes("pi2") || tokens.includes("proyecto-integrador-2")) return "PI2";
  return "Independiente";
}

function deriveType(repo: GitHubRepo): ProjectType {
  const tokens = [repo.name, ...repo.topics, repo.description ?? ""].join(" ").toLowerCase();
  if (tokens.includes("investigacion") || tokens.includes("research") || tokens.includes("paper")) return "Investigativo";
  if (tokens.includes("startup") || tokens.includes("saas") || tokens.includes("emprendimiento")) return "Emprendimiento";
  return "Desarrollo";
}

function deriveStatus(repo: GitHubRepo): ProjectStatus {
  if (repo.archived || repo.disabled) return "abandoned";
  const monthsInactive = (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsInactive > 6) return "abandoned";
  return "in_progress";
}

function deriveAuthors(repo: GitHubRepo): Project["authors"] {
  const name = repo.owner.login;
  return [{ name, initials: name.slice(0, 2).toUpperCase() }];
}

// Mapeo de IDs numericos de la DB a los tipos del modelo interno
const courseMap: Record<number, Course> = { 1: "PI1", 2: "PI2", 3: "Independiente" };
const typeMap: Record<number, ProjectType> = { 1: "Investigativo", 2: "Desarrollo", 3: "Emprendimiento" };

export function mapGitHubRepoToProject(repo: GitHubRepo): Project {
  const db = repo._db;
  // Slug = ID numérico de la BD cuando existe, así el refresh siempre
  // resuelve por `String(p.id) === slug` sin depender de parsear URLs.
  const slug = db ? String(db.id) : repo.name;

  return {
    id: db ? String(db.id) : String(repo.id),
    slug,
    name: db?.name ?? repo.name,
    short: db?.description ?? repo.description ?? "Sin descripción.",
    course: (() => {
      const name = dbReferenceName(db?.course);
      if (name === "PI1" || name === "PI2" || name === "Independiente") return name as Course;
      const id = dbReferenceId(db?.course);
      return id != null && courseMap[id] ? courseMap[id] : deriveCourse(repo);
    })(),
    semester: dbReferenceName(db?.semester) ?? "",
    type: (() => {
      const name = dbReferenceName(db?.projectType);
      if (name === "Investigativo" || name === "Desarrollo" || name === "Emprendimiento") return name as ProjectType;
      const id = dbReferenceId(db?.projectType);
      return id != null && typeMap[id] ? typeMap[id] : deriveType(repo);
    })(),
    status: (() => {
      const name = dbReferenceName(db?.state);
      if (name === "complete" || name === "in_progress" || name === "abandoned") return name as ProjectStatus;
      return deriveStatus(repo);
    })(),
    technologies: deriveTechnologies(repo),
    authors: deriveAuthors(repo),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    updatedAt: relativeDate(repo.updated_at),
    // repoUrl: versión sin protocolo para mostrar en UI
    repoUrl: repo.html_url.replace("https://", ""),
    // githubRepo: URL completa — usada por parseGithubRepo() en el detalle
    // para lanzar las queries de README, commits y lenguajes
    githubRepo: repo.html_url,
    testCoverage: 0,
    activity: [],
    isPrivate: repo.private,
  };
}