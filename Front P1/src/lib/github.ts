// GitHub REST API helpers (public, unauthenticated — 60 req/h por IP)
const BASE = "https://api.github.com";

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface GhRepo {
  default_branch: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: { name: string; spdx_id: string } | null;
  html_url: string;
}

export interface GhCommit {
  sha: string;
  html_url: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  author: { login: string; avatar_url: string } | null;
}

export interface GhReadme {
  content: string;
  encoding: string;
  download_url: string;
}

export const ghApi = {
  repo: (owner: string, repo: string) => gh<GhRepo>(`/repos/${owner}/${repo}`),
  commits: (owner: string, repo: string) =>
    gh<GhCommit[]>(`/repos/${owner}/${repo}/commits?per_page=8`),
  readme: (owner: string, repo: string) =>
    gh<GhReadme>(`/repos/${owner}/${repo}/readme`),
  languages: (owner: string, repo: string) =>
    gh<Record<string, number>>(`/repos/${owner}/${repo}/languages`),
};

export function decodeBase64Utf8(b64: string): string {
  // Remove newlines that GitHub embeds in base64
  const clean = b64.replace(/\n/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

export function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} meses`;
  return `hace ${Math.floor(months / 12)} años`;
}

// Common GitHub language colors
export const languageColor: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  PHP: "#4F5D95",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
};
