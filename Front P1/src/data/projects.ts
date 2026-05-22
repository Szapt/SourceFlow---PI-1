export type ProjectStatus = "complete" | "in_progress" | "abandoned";
export type Course = "PI1" | "PI2" | "Independiente";
export type ProjectType = "Investigativo" | "Desarrollo" | "Emprendimiento";

export interface ActivityItem {
  who: string;
  initials: string;
  what: string;
  time: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  short: string;
  course: Course;
  type: ProjectType;
  status: ProjectStatus;
  technologies: string[];
  authors: { name: string; initials: string }[];
  updatedAt: string;
  semester: string;
  documentationLevel: number; // 0-100
  qualityScore: number; // 0-100
  testCoverage: number; // 0-100
  stars: number;
  forks: number;
  openIssues: number;
  repoUrl: string;
  githubRepo: string; // full URL https://github.com/owner/repo
  activity: ActivityItem[];
}

export function parseGithubRepo(url: string | null | undefined): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = url.match(/github\.com[\/:]([^\/]+)\/([^/.]+)(?:\.git)?\/?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "sigma-attendance",
    name: "SIGMA — Asistencia Biométrica",
    short:
      "Sistema de control de asistencia con reconocimiento facial para aulas de ingeniería.",
    course: "PI2",
    type: "Desarrollo",
    status: "in_progress",
    technologies: ["Python", "FastAPI", "React", "PostgreSQL", "OpenCV"],
    authors: [
      { name: "María Restrepo", initials: "MR" },
      { name: "Andrés Gómez", initials: "AG" },
    ],
    updatedAt: "hace 2 días",
    semester: "2025-1",
    documentationLevel: 78,
    qualityScore: 82,
    testCoverage: 64,
    stars: 24,
    forks: 7,
    openIssues: 5,
    repoUrl: "github.com/sourceflow/sigma-attendance",
    githubRepo: "https://github.com/ageitgey/face_recognition",
    activity: [
      { who: "Andrés Gómez", initials: "AG", what: "abrió un PR #57: caché de embeddings", time: "12m" },
      { who: "María Restrepo", initials: "MR", what: "actualizó README", time: "5h" },
      { who: "Andrés Gómez", initials: "AG", what: "cerró issue #41", time: "1d" },
    ],
  },
  {
    id: "2",
    slug: "campus-routing",
    name: "Campus Routing Engine",
    short:
      "Algoritmo de rutas óptimas dentro del campus con accesibilidad para personas con movilidad reducida.",
    course: "Independiente",
    type: "Investigativo",
    status: "complete",
    technologies: ["TypeScript", "Next.js", "Mapbox", "Dijkstra"],
    authors: [
      { name: "Laura Vélez", initials: "LV" },
      { name: "Camilo Ortiz", initials: "CO" },
      { name: "Sofía Marín", initials: "SM" },
    ],
    updatedAt: "hace 3 semanas",
    semester: "2024-2",
    documentationLevel: 94,
    qualityScore: 91,
    testCoverage: 88,
    stars: 47,
    forks: 12,
    openIssues: 2,
    repoUrl: "github.com/sourceflow/campus-routing",
    githubRepo: "https://github.com/Project-OSRM/osrm-backend",
    activity: [
      { who: "Laura Vélez", initials: "LV", what: "publicó documentación final", time: "3sem" },
      { who: "Sofía Marín", initials: "SM", what: "marcó proyecto como completo", time: "3sem" },
    ],
  },
  {
    id: "3",
    slug: "gradehub",
    name: "GradeHub — Gestor Académico",
    short:
      "Plataforma para registro y análisis de calificaciones con dashboards docentes.",
    course: "PI1",
    type: "Desarrollo",
    status: "in_progress",
    technologies: ["React", "Node.js", "MongoDB", "Tailwind"],
    authors: [
      { name: "Juan Pulido", initials: "JP" },
      { name: "Daniela Ríos", initials: "DR" },
    ],
    updatedAt: "hoy",
    semester: "2025-1",
    documentationLevel: 52,
    qualityScore: 61,
    testCoverage: 28,
    stars: 11,
    forks: 3,
    openIssues: 14,
    repoUrl: "github.com/sourceflow/gradehub",
    githubRepo: "https://github.com/appwrite/appwrite",
    activity: [
      { who: "Juan Pulido", initials: "JP", what: "creó issue #14: validación de CSV", time: "3h" },
      { who: "Daniela Ríos", initials: "DR", what: "subió mockups al EAP", time: "1d" },
    ],
  },
  {
    id: "4",
    slug: "iot-lab-monitor",
    name: "IoT Lab Monitor",
    short:
      "Monitoreo en tiempo real de laboratorios con sensores ESP32 y panel de telemetría.",
    course: "PI2",
    type: "Desarrollo",
    status: "complete",
    technologies: ["C++", "MQTT", "InfluxDB", "Grafana", "ESP32"],
    authors: [
      { name: "Tomás Henao", initials: "TH" },
      { name: "Valentina Ruiz", initials: "VR" },
    ],
    updatedAt: "hace 1 mes",
    semester: "2024-2",
    documentationLevel: 86,
    qualityScore: 84,
    testCoverage: 71,
    stars: 33,
    forks: 9,
    openIssues: 1,
    repoUrl: "github.com/sourceflow/iot-lab-monitor",
    githubRepo: "https://github.com/home-assistant/core",
    activity: [
      { who: "Tomás Henao", initials: "TH", what: "marcó proyecto como completo", time: "1mes" },
      { who: "Valentina Ruiz", initials: "VR", what: "publicó manifiesto de entrega", time: "1mes" },
    ],
  },
  {
    id: "5",
    slug: "thesis-recommender",
    name: "Thesis Recommender",
    short:
      "Motor de recomendación de temas de grado basado en intereses y desempeño académico.",
    course: "Independiente",
    type: "Investigativo",
    status: "in_progress",
    technologies: ["Python", "scikit-learn", "FastAPI", "Vue"],
    authors: [{ name: "Mateo Caicedo", initials: "MC" }],
    updatedAt: "hace 5 días",
    semester: "2025-1",
    documentationLevel: 67,
    qualityScore: 73,
    testCoverage: 55,
    stars: 18,
    forks: 4,
    openIssues: 8,
    repoUrl: "github.com/sourceflow/thesis-recommender",
    githubRepo: "https://github.com/scikit-learn/scikit-learn",
    activity: [
      { who: "Mateo Caicedo", initials: "MC", what: "actualizó dataset y métricas", time: "5d" },
      { who: "Mateo Caicedo", initials: "MC", what: "abrió issue #8: re-entrenamiento", time: "1sem" },
    ],
  },
  {
    id: "6",
    slug: "club-eventos",
    name: "Club de Eventos UNI",
    short:
      "Aplicación móvil para gestión de eventos estudiantiles con check-in vía QR.",
    course: "PI1",
    type: "Emprendimiento",
    status: "abandoned",
    technologies: ["Flutter", "Firebase"],
    authors: [
      { name: "Isabela Núñez", initials: "IN" },
      { name: "Pedro Salas", initials: "PS" },
    ],
    updatedAt: "hace 8 meses",
    semester: "2024-1",
    documentationLevel: 24,
    qualityScore: 38,
    testCoverage: 0,
    stars: 4,
    forks: 1,
    openIssues: 19,
    repoUrl: "github.com/sourceflow/club-eventos",
    githubRepo: "https://github.com/flutter/samples",
    activity: [
      { who: "Isabela Núñez", initials: "IN", what: "última actualización del repositorio", time: "8mes" },
    ],
  },
  {
    id: "7",
    slug: "exam-proctor",
    name: "Exam Proctor AI",
    short:
      "Vigilancia ética de exámenes en línea con detección de comportamiento anómalo.",
    course: "Independiente",
    type: "Investigativo",
    status: "in_progress",
    technologies: ["Python", "TensorFlow", "Django", "WebRTC"],
    authors: [
      { name: "Natalia Cárdenas", initials: "NC" },
      { name: "Esteban Pardo", initials: "EP" },
    ],
    updatedAt: "hace 1 semana",
    semester: "2025-1",
    documentationLevel: 71,
    qualityScore: 76,
    testCoverage: 60,
    stars: 29,
    forks: 6,
    openIssues: 11,
    repoUrl: "github.com/sourceflow/exam-proctor",
    githubRepo: "https://github.com/tensorflow/tensorflow",
    activity: [
      { who: "Natalia Cárdenas", initials: "NC", what: "subió paper de referencia al EAP", time: "1sem" },
      { who: "Esteban Pardo", initials: "EP", what: "abrió PR #22: detección de mirada", time: "4d" },
    ],
  },
  {
    id: "8",
    slug: "library-search",
    name: "Library Search v2",
    short:
      "Buscador semántico para la biblioteca de ingeniería con búsqueda vectorial.",
    course: "PI2",
    type: "Desarrollo",
    status: "complete",
    technologies: ["Rust", "Qdrant", "Svelte", "PostgreSQL"],
    authors: [
      { name: "Felipe Acosta", initials: "FA" },
      { name: "Carolina Mejía", initials: "CM" },
    ],
    updatedAt: "hace 2 meses",
    semester: "2024-2",
    documentationLevel: 89,
    qualityScore: 87,
    testCoverage: 79,
    stars: 41,
    forks: 8,
    openIssues: 3,
    repoUrl: "github.com/sourceflow/library-search",
    githubRepo: "https://github.com/qdrant/qdrant",
    activity: [
      { who: "Felipe Acosta", initials: "FA", what: "publicó manifiesto de entrega", time: "2mes" },
      { who: "Carolina Mejía", initials: "CM", what: "agregó sección de pruebas al EAP", time: "2mes" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const statusLabel: Record<ProjectStatus, string> = {
  complete: "Completo",
  in_progress: "En progreso",
  abandoned: "Abandonado",
};

export const courseColor: Record<Course, string> = {
  PI1: "bg-[oklch(0.95_0.04_260)] text-[oklch(0.4_0.18_260)]",
  PI2: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.38_0.14_150)]",
  Independiente: "bg-[oklch(0.96_0.03_55)] text-[oklch(0.45_0.16_55)]",
};

export const typeColor: Record<ProjectType, string> = {
  Investigativo: "bg-[oklch(0.95_0.04_290)] text-[oklch(0.42_0.2_290)]",
  Desarrollo: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.38_0.14_150)]",
  Emprendimiento: "bg-[oklch(0.96_0.05_45)] text-[oklch(0.46_0.16_45)]",
};

// All technologies present across the dataset (deduped & sorted)
export const allTechnologies: string[] = Array.from(
  new Set(projects.flatMap((p) => p.technologies)),
).sort();
