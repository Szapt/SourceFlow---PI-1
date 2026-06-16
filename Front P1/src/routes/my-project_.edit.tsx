import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PencilLine,
  AlertCircle,
  Loader2,
  X,
  Check,
  ArrowLeft,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND = "http://localhost:8080";

interface Technology {
  id: number;
  name: string;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
}

interface BackendProjectResponse {
  id: number;
  name: string;
  description: string | null;
  technologies?: string[];
  studentNames?: string[];
  studentEmails?: string[];
}

export const Route = createFileRoute("/my-project_/edit")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("isAuthenticated")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [{ title: "Editar proyecto — SourceFlow" }],
  }),
  component: EditProjectPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function EditProjectPage() {
  const navigate = useNavigate();
  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") ?? "" : "";

  const [description, setDescription] = useState("");
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([]);
  const [authors, setAuthors] = useState<UserSummary[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const techsQ = useQuery({
    queryKey: ["technologies"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/projects/lookup/technologies`);
      if (!res.ok) throw new Error("Error al cargar tecnologías");
      return res.json() as Promise<Technology[]>;
    },
  });

  const usersQ = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/my-project/users`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json() as Promise<UserSummary[]>;
    },
  });

  useEffect(() => {
    if (techsQ.isLoading || usersQ.isLoading) return;

    const load = async () => {
      try {
        const res = await fetch(`${BACKEND}/my-project`, {
          headers: { "X-User-Email": userEmail, "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const text = await res.text();
        if (!text.trim()) {
          setLoadError("No tienes un proyecto activo en el semestre actual.");
          return;
        }
        const data: BackendProjectResponse = JSON.parse(text);
        setProjectName(data.name);
        setDescription(data.description ?? "");

        if (data.technologies && techsQ.data) {
          setSelectedTechIds(
            techsQ.data
              .filter((t) => data.technologies!.includes(t.name))
              .map((t) => t.id)
          );
        }

        // Match current team members by email (confiable) con fallback a nombre
        if (usersQ.data) {
          const emailSet = new Set(data.studentEmails ?? []);
          const nameSet = new Set(data.studentNames ?? []);

          const matched = usersQ.data.filter(
            (u) => emailSet.has(u.email) || nameSet.has(u.name)
          );
          setAuthors(matched);
        }
      } catch (e: any) {
        setLoadError(e.message || "Error al cargar el proyecto");
      } finally {
        setIsLoadingProject(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techsQ.isLoading, usersQ.isLoading]);

  function toggleTech(id: number) {
    setSelectedTechIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addAuthor(user: UserSummary) {
    if (!authors.find((a) => a.id === user.id)) {
      setAuthors((prev) => [...prev, user]);
    }
    setAuthorSearch("");
    setShowDropdown(false);
  }

  function removeAuthor(id: number) {
    setAuthors((prev) => prev.filter((a) => a.id !== id));
  }

  const filteredUsers = (usersQ.data ?? []).filter(
    (u) =>
      !authors.find((a) => a.id === u.id) &&
      (u.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(authorSearch.toLowerCase()))
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSavedOk(false);
    setIsSaving(true);
    try {
      const res = await fetch(`${BACKEND}/my-project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-User-Email": userEmail },
        body: JSON.stringify({
          description,
          technologyIds: selectedTechIds,
          authorEmails: authors.map((a) => a.email),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      setSavedOk(true);
      setTimeout(() => navigate({ to: "/my-project" }), 1200);
    } catch (err: any) {
      setSaveError(err.message || "Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  }

  const isLoading = isLoadingProject || techsQ.isLoading || usersQ.isLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div className="max-w-md space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Link
              to="/my-project"
              className="inline-flex items-center gap-1.5 text-sm text-accent-green-deep hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link to="/my-project" className="hover:text-foreground">Mi Proyecto</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Editar detalles</span>
        </div>
      }
    >
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-br from-accent-green-soft/40 via-surface to-surface px-6 pb-8 pt-8 lg:px-10">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent-green-deep">
          <PencilLine className="h-3.5 w-3.5" />
          Editar proyecto
        </div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">{projectName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Actualiza la descripción, el stack tecnológico y los autores del proyecto.
            </p>
          </div>
          <Link
            to="/my-project"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="px-6 py-8 lg:px-10">
        <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-8">

          {/* Descripción */}
          <EditSection title="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe brevemente el proyecto..."
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-green focus:ring-2 focus:ring-accent-green/20"
            />
          </EditSection>

          {/* Stack tecnológico */}
          <EditSection
            title="Stack tecnológico"
            hint="Selecciona las que apliquen"
          >
            {techsQ.isError ? (
              <p className="text-xs text-destructive">Error al cargar tecnologías</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(techsQ.data ?? []).map((t) => {
                  const selected = selectedTechIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTech(t.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        selected
                          ? "border-accent-green bg-accent-green-soft text-accent-green-deep"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedTechIds.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedTechIds.length} tecnología{selectedTechIds.length !== 1 ? "s" : ""} seleccionada{selectedTechIds.length !== 1 ? "s" : ""}
              </p>
            )}
          </EditSection>

          {/* Autores */}
          <EditSection
            title="Autores"
            hint="Equipo actual del proyecto"
          >
            {/* Chips de autores actuales — siempre visibles */}
            <div className="min-h-[2.5rem]">
              {authors.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Sin autores asignados. Usa el buscador para agregar.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {authors.map((a) => (
                    <span
                      key={a.id}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green-soft/50 px-2.5 py-1 text-xs"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-green to-accent-green-mid text-[9px] font-semibold text-white">
                        {initials(a.name)}
                      </span>
                      <span className="font-medium text-accent-green-deep">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground">{a.email}</span>
                      <button
                        type="button"
                        onClick={() => removeAuthor(a.id)}
                        title="Quitar autor"
                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Separador + buscador para agregar */}
            <div className="relative mt-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors focus-within:border-accent-green focus-within:ring-2 focus-within:ring-accent-green/20">
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={authorSearch}
                  onChange={(e) => {
                    setAuthorSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="Agregar colaborador por nombre o email..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {authorSearch && (
                  <button
                    type="button"
                    onClick={() => { setAuthorSearch(""); setShowDropdown(false); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {showDropdown && authorSearch.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
                  {filteredUsers.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-muted-foreground">
                      Sin resultados para "{authorSearch}"
                    </p>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {filteredUsers.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onMouseDown={() => addAuthor(u)}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent-green-soft/40"
                          >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-green to-accent-green-mid text-[10px] font-semibold text-white">
                              {initials(u.name)}
                            </span>
                            <span>
                              <span className="block font-medium">{u.name}</span>
                              <span className="block text-[11px] text-muted-foreground">{u.email}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              Los autores que quites aquí serán removidos del equipo al guardar.
            </p>
          </EditSection>

          {/* Feedback */}
          {saveError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{saveError}</p>
            </div>
          )}

          {savedOk && (
            <div className="flex items-center gap-2 rounded-md bg-accent-green-soft px-3 py-2">
              <Check className="h-4 w-4 text-accent-green-deep" />
              <p className="text-xs font-medium text-accent-green-deep">
                Cambios guardados. Redirigiendo...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <Link
              to="/my-project"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving || savedOk}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium transition-opacity",
                isSaving || savedOk
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-accent-green-deep text-white hover:opacity-90"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function EditSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
