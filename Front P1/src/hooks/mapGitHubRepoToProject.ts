import { Project, ProjectStatus, ProjectType, Course } from "@/data/projects";
import { GitHubRepo } from "./useGitHubRepos";

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

function computeQualityScore(repo: GitHubRepo): number {
  let score = 40;
  if (repo.description && repo.description.length > 20) score += 10;
  if (repo.topics.length > 0) score += 10;
  if (repo.stargazers_count > 0) score += Math.min(repo.stargazers_count * 2, 15);
  if (repo.forks_count > 0) score += Math.min(repo.forks_count * 2, 10);
  if (repo.open_issues_count === 0) score += 5;
  if (!repo.fork) score += 10;
  return Math.min(score, 100);
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
  return {
    id: db ? String(db.id) : String(repo.id),
    slug: repo.name,
    name: db?.name ?? repo.name,
    short: db?.description ?? repo.description ?? "Sin descripcion.",
    course: (db?.course && courseMap[db.course]) ? courseMap[db.course] : deriveCourse(repo),
    semester: db?.semester ? String(db.semester) : "",
    type: (db?.project_type && typeMap[db.project_type]) ? typeMap[db.project_type] : deriveType(repo),
    status: deriveStatus(repo),
    technologies: deriveTechnologies(repo),
    authors: deriveAuthors(repo),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    qualityScore: computeQualityScore(repo),
    updatedAt: relativeDate(repo.updated_at),
    repoUrl: repo.html_url.replace("https://", ""),
    testCoverage: 0,
    activity: [],
    isPrivate: repo.private,
  };
}
