import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";


const API_URL = import.meta.env.VITE_API_BASE_URL;
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

interface Technology {
  id: number;
  name: string;
}

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Subir proyecto — SourceFlow" },
      {
        name: "description",
        content: "Publica un nuevo proyecto académico en el repositorio.",
      },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();

  // ── Phase-1 state ──────────────────────────────────────────────────────────
  const [repoUrl, setRepoUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<any>(null);

  // ── Lookup queries ─────────────────────────────────────────────────────────
  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects/lookup/courses`);
      if (!res.ok) throw new Error("Error al cargar cursos");
      return res.json() as Promise<Course[]>;
    },
  });

  const semestersQ = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects/lookup/semesters`);
      if (!res.ok) throw new Error("Error al cargar semestres");
      return res.json() as Promise<Semester[]>;
    },
  });

  const techsQ = useQuery({
    queryKey: ["technologies"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects/lookup/technologies`);
      if (!res.ok) throw new Error("Error al cargar tecnologías");
      return res.json() as Promise<Technology[]>;
    },
  });

  // ── Phase-2 form state (IDs, not names) ───────────────────────────────────
  const [courseId, setCourseId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [techIds, setTechIds] = useState<number[]>([]);

  // Set default values when lookups load
  React.useEffect(() => {
    if (coursesQ.data && coursesQ.data.length > 0 && courseId === null) {
      setCourseId(coursesQ.data[0].id);
    }
  }, [coursesQ.data, courseId]);

  React.useEffect(() => {
    if (semestersQ.data && semestersQ.data.length > 0 && semesterId === null) {
      setSemesterId(semestersQ.data[0].id);
    }
  }, [semestersQ.data, semesterId]);

  // ── Submit state ───────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Phase-1: validate GitHub repo ─────────────────────────────────────────
  async function validateAndLoadRepo() {
    if (!repoUrl.trim()) {
      setValidationError("Por favor ingresa una URL de repositorio");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const urlPattern = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i;
      const match = repoUrl.trim().match(urlPattern);

      if (!match) {
        setValidationError("URL inválida. Usa: https://github.com/usuario/repositorio");
        setIsValidating(false);
        return;
      }

      const owner = match[1];
      const repo = match[2];

      const currentUserEmail =
        typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
      const currentUsername =
        typeof window !== "undefined"
          ? localStorage.getItem("github_username") || localStorage.getItem("userUsername")
          : null;

      // 1. Validar que el repo existe en GitHub
      const ghResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!ghResponse.ok) {
        setValidationError(
          ghResponse.status === 404
            ? "Repositorio no encontrado en GitHub"
            : "Error al validar repositorio en GitHub"
        );
        setIsValidating(false);
        return;
      }

      const ghRepoData = await ghResponse.json();

      // 2. Obtener colaboradores del repo
      const collabResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/collaborators`
      );
      const collaborators: { login: string }[] =
        collabResponse.ok ? await collabResponse.json() : [];

      // Logins de todos los que tienen acceso (dueño + colaboradores)
      const allowedLogins = [
        owner.toLowerCase(),
        ...collaborators.map((c) => c.login.toLowerCase()),
      ];

      // 3. Validar si el usuario actual pertenece al repo
      const usernameMatch =
        currentUsername && allowedLogins.includes(currentUsername.toLowerCase());

      // Si no hay username local, intentar resolverlo desde el backend
      let resolvedUsername = currentUsername;
      if (!resolvedUsername && currentUserEmail) {
        try {
          const userResponse = await fetch(`${API_URL}/api/user/username`, {
            headers: { "X-User-Email": currentUserEmail },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            resolvedUsername = userData.username;
            if (resolvedUsername) localStorage.setItem("userUsername", resolvedUsername);
          }
        } catch (e) {
          console.error("No se pudo obtener el username:", e);
        }
      }

      const finalMatch =
        resolvedUsername && allowedLogins.includes(resolvedUsername.toLowerCase());

      if (!finalMatch) {
        setValidationError(
          "El proyecto solo puede ser subido por su creador o un colaborador del repositorio"
        );
        setIsValidating(false);
        return;
      }

      // 4. Éxito — pasar a fase 2
      setRepoData(ghRepoData);
      setTechIds([]);
      setSubmitError(null);
      setValidationError(null);
    } catch (error: any) {
      setValidationError(error.message || "Error al validar repositorio");
    } finally {
      setIsValidating(false);
    }
  }

  // ── Tech toggle ───────────────────────────────────────────────────────────
  function toggleTech(id: number) {
    setTechIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoData || courseId === null || semesterId === null) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const userEmail = localStorage.getItem("userEmail");

    const payload = {
      name: repoData.name,
      description: repoData.description ?? "Sin descripción",
      repoUrl: repoData.html_url,
      courseId,
      semesterId,
      typeId: 2,
      stateId: 2,
      tutorId: 1,
      technologyIds: techIds,
      userEmail: localStorage.getItem("userEmail"),
      repoFullName: repoData.full_name,   // 
    };

    try {
      const res = await fetch(`${API_URL}/projects/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      // Navigate home on success
      navigate({ to: "/" });
    } catch (err: any) {
      setSubmitError(err.message || "Error al publicar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 1: repo URL input
  // ─────────────────────────────────────────────────────────────────────────
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
                    : "bg-accent-blue text-white hover:opacity-90"
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
              Repositorio validado:{" "}
              <span className="font-mono text-foreground">{repoData.full_name}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setRepoData(null);
              setRepoUrl("");
              setCourseId(coursesQ.data?.[0]?.id ?? null);
              setSemesterId(semestersQ.data?.[0]?.id ?? null);
              setTechIds([]);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cambiar repositorio
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form */}
          <form className="space-y-6 lg:col-span-2" onSubmit={handleSubmit}>
            {/* Repo verified banner */}
            <div className="rounded-lg border border-accent-emerald/30 bg-accent-emerald/5 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-emerald mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Repositorio verificado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {repoData.description || "Sin descripción"} •{" "}
                  {repoData.stargazers_count} estrellas
                </p>
              </div>
            </div>

            {/* Course + Semester */}
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
                        onClick={() => setCourseId(c.id)}
                        className={cn(
                          "flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                          courseId === c.id
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-border hover:bg-muted"
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
                  value={semesterId ?? ""}
                  onChange={(e) => setSemesterId(Number(e.target.value))}
                  className="input"
                >
                  {semestersQ.isLoading ? (
                    <option>Cargando semestres...</option>
                  ) : semestersQ.isError ? (
                    <option>Error al cargar semestres</option>
                  ) : (
                    semestersQ.data?.map((s: Semester) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>

            {/* Technologies multi-select */}
            <Field label="Tecnologías" hint="Selecciona las que apliquen">
              {techsQ.isLoading ? (
                <div className="text-xs text-muted-foreground">Cargando tecnologías...</div>
              ) : techsQ.isError ? (
                <div className="text-xs text-destructive">Error al cargar tecnologías</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {techsQ.data?.map((t: Technology) => {
                    const selected = techIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTech(t.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-border hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {selected && <X className="h-3 w-3" />}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Show selected count */}
              {techIds.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {techIds.length} tecnología{techIds.length !== 1 ? "s" : ""} seleccionada
                  {techIds.length !== 1 ? "s" : ""}
                </p>
              )}
            </Field>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">{submitError}</p>
              </div>
            )}

            {/* Actions */}
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
                disabled={isSubmitting || courseId === null || semesterId === null}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium transition-opacity",
                  isSubmitting || courseId === null || semesterId === null
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-accent-blue text-white hover:opacity-90"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  "Publicar proyecto"
                )}
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
