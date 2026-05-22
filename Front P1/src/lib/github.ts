export interface GhCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    avatar_url: string;
  };
}

// Mapa de colores oficiales para lenguajes comunes de GitHub
export const languageColor: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  PowerShell: "#012456",
};

/**
 * Decodifica una cadena en Base64 con soporte nativo de caracteres UTF-8
 * (Evita problemas con emojis y caracteres latinos acentuados devueltos por la API de GitHub)
 */
export function decodeBase64Utf8(str: string): string {
  try {
    const cleaned = str.replace(/\s/g, "");
    return decodeURIComponent(
      atob(cleaned)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    // Fallback básico si falla la decodificación fina de caracteres
    return atob(str.replace(/\s/g, ""));
  }
}

/**
 * Calcula y retorna una cadena legible del tiempo relativo transcurrido
 */
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
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

const GH_BASE_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

// Genera dinámicamente las cabeceras inyectando el token OAuth de sesión si existe
function getHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("github_token") : null;
  if (token) {
    return {
      ...GH_BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    };
  }
  return GH_BASE_HEADERS;
}

// Cliente de interacción directa con la API pública de GitHub
export const ghApi = {
  async readme(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("README no disponible");
    return res.json();
  },

  async commits(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=6`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Historial de commits no disponible");
    return res.json();
  },

  async repo(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Repositorio no encontrado");
    return res.json();
  },

  async languages(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Estadísticas de lenguaje no disponibles");
    return res.json();
  },
};
