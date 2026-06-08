import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND = "http://localhost:8080";

interface Course {
  id: number;
  name: string;
  description?: string;
}

interface Semester {
  id: number;
  name: string;
  startDate: string;
  fechaFin: string;
}

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Subir proyecto — FacSis" },
      {
        name: "description",
        content:
          "Publica un nuevo proyecto académico en el repositorio.",
      },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<any>(null);
  const [userUsername, setUserUsername] = useState<string | null>(null);

  // Cargar cursos y semestres dinámicamente
  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/projects/lookup/courses`);
      if (!res.ok) throw new Error("Error al cargar cursos");
      return res.json() as Promise<Course[]>;
    },
  });

  const semestersQ = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/projects/lookup/semesters`);
      if (!res.ok) throw new Error("Error al cargar semestres");
      return res.json() as Promise<Semester[]>;
    },
  });

  // Form fields after validation
  const [course, setCourse] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [techs, setTechs] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // Set default values cuando carguen cursos y semestres
  React.useEffect(() => {
    if (coursesQ.data && coursesQ.data.length > 0 && !course) {
      setCourse(coursesQ.data[0].name);
    }
  }, [coursesQ.data, course]);

  React.useEffect(() => {
    if (semestersQ.data && semestersQ.data.length > 0 && !semester) {
      setSemester(semestersQ.data[0].name);
    }
  }, [semestersQ.data, semester]);

  async function validateAndLoadRepo() {
    if (!repoUrl.trim()) {
      setValidationError("Por favor ingresa una URL de repositorio");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Parse GitHub URL
      const urlPattern = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i;
      const match = repoUrl.trim().match(urlPattern);

      if (!match) {
        setValidationError("URL inválida. Usa: https://github.com/usuario/repositorio");
        setIsValidating(false);
        return;
      }

      const owner = match[1];
      const repo = match[2];

      // Get current user's username from localStorage or auth
      const currentUserEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
      // You might need to fetch the username from your backend based on email
      // For now, we'll try to get it from user data or assume it matches
      let currentUsername = typeof window !== "undefined" ? (localStorage.getItem("github_username") || localStorage.getItem("userUsername")) : null;

      // Validate repo exists on GitHub
      const ghResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      
      if (!ghResponse.ok) {
        if (ghResponse.status === 404) {
          setValidationError("Repositorio no encontrado en GitHub");
        } else {
          setValidationError("Error al validar repositorio en GitHub");
        }
        setIsValidating(false);
        return;
      }

      const ghRepoData = await ghResponse.json();

      // If we don't have the username yet, we need to get it from backend
      if (!currentUsername && currentUserEmail) {
        // Call your backend to get the username for this email
        try {
          const userResponse = await fetch(`http://localhost:8080/api/user/username`, {
            headers: {
              "X-User-Email": currentUserEmail,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            currentUsername = userData.username;
            localStorage.setItem("userUsername", currentUsername);
          }
        } catch (e) {
          console.error("Could not fetch user username:", e);
        }
      }

      // Verify owner matches current user
      if (currentUsername && owner.toLowerCase() !== currentUsername.toLowerCase()) {
        setValidationError(`El repositorio debe ser tuyo. Propietario: ${owner}, usuario actual: ${currentUsername}`);
        setIsValidating(false);
        return;
      }

      // Success
      setRepoData(ghRepoData);
      setUserUsername(owner);
      setTechs([]); // Reset techs for new repo
      setTechInput("");
      setValidationError(null);
    } catch (error: any) {
      setValidationError(error.message || "Error al validar repositorio");
    } finally {
      setIsValidating(false);
    }
  }

  function addTech() {
    if (techInput.trim() && !techs.includes(techInput.trim())) {
      setTechs([...techs, techInput.trim()]);
      setTechInput("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoData) return;

    // TODO: Send to backend
    console.log({
      repo: repoUrl,
      course,
      semester,
      techs,
    });
  }

  // Phase 1: Repo URL input
  if (!repoData) {
    return (
      <AppShell
        breadcrumb={<span className="font-medium text-foreground">Nuevo proyecto</span>}
      >
        <div className="px-6 py-8 lg:px-10">
          <div>
            <h1 className="font-serif text-3xl tracking-tight">
              Publicar nuevo proyecto
            </h1>
            <p className="text-sm text-muted-foreground">
              Comienza por enlazar tu repositorio de GitHub.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-md space-y-6">
              <Field label="Enlace del repositorio" required>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      validateAndLoadRepo();
                    }
                  }}
                  placeholder="https://github.com/usuario/proyecto"
                  className="input font-mono text-sm"
                />
              </Field>

              {validationError && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-xs text-destructive">{validationError}</p>
                </div>
              )}

              <button
                onClick={validateAndLoadRepo}
                disabled={isValidating || !repoUrl.trim()}
                className={cn(
                  "w-full h-10 rounded-md px-4 text-sm font-medium transition-all flex items-center justify-center gap-2",
                  isValidating || !repoUrl.trim()
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-accent-blue text-white hover:opacity-90",
                )}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Validar repositorio"
                )}
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Phase 2: Additional fields after repo validation
  return (
    <AppShell
      breadcrumb={<span className="font-medium text-foreground">Nuevo proyecto</span>}
    >
      <div className="px-6 py-8 lg:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl tracking-tight">
              Completar información
            </h1>
            <p className="text-sm text-muted-foreground">
              Repositorio validado: <span className="font-mono text-foreground">{repoData.full_name}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setRepoData(null);
              setRepoUrl("");
              setCourse(coursesQ.data?.[0]?.name ?? null);
              setSemester(semestersQ.data?.[0]?.name ?? null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cambiar repositorio
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form */}
          <form className="space-y-6 lg:col-span-2" onSubmit={handleSubmit}>
            <div className="rounded-lg border border-accent-emerald/30 bg-accent-emerald/5 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-emerald mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Repositorio verificado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {repoData.description || "Sin descripción"} • {repoData.stargazers_count} estrellas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Curso" required>
                <div className="flex gap-1.5">
                  {coursesQ.isLoading ? (
                    <div className="text-xs text-muted-foreground">Cargando cursos...</div>
                  ) : coursesQ.isError ? (
                    <div className="text-xs text-destructive">Error al cargar cursos</div>
                  ) : (
                    coursesQ.data?.map((c: Course) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourse(c.name)}
                        className={cn(
                          "flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                          course === c.name
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              </Field>

              <Field label="Semestre" required>
                <select
                  value={semester ?? ""}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input"
                >
                  {semestersQ.isLoading ? (
                    <option>Cargando semestres...</option>
                  ) : semestersQ.isError ? (
                    <option>Error al cargar semestres</option>
                  ) : (
                    semestersQ.data?.map((s: Semester) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>

            <Field label="Tecnologías" hint="Pulsa Enter para agregar">
              <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-surface p-2 focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-accent-blue/15">
                {techs.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTechs(techs.filter((x) => x !== t))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  placeholder="Ej. React, TypeScript…"
                  className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => {
                  setRepoData(null);
                  setRepoUrl("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-accent-blue text-white px-5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Publicar proyecto
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs font-medium">
        <span>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
      <style>{`
        .input {
          width: 100%;
          height: 2.5rem;
          border: 1px solid var(--input);
          background: var(--surface);
          border-radius: 0.5rem;
          padding: 0 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px oklch(0.55 0.18 255 / 0.15);
        }
      `}</style>
    </div>
  );
}
