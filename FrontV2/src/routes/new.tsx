import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CheckCircle2, Circle, X, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Subir proyecto — FacSis" },
      {
        name: "description",
        content:
          "Publica un nuevo proyecto académico en el repositorio con validaciones de calidad mínima.",
      },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [course, setCourse] = useState("PI1");
  const [techs, setTechs] = useState<string[]>(["React", "TypeScript"]);
  const [techInput, setTechInput] = useState("");
  const [repo, setRepo] = useState("");
  const [readme, setReadme] = useState("");

  const checks = [
    { label: "Nombre claro (≥ 4 caracteres)", ok: name.trim().length >= 4 },
    { label: "Descripción significativa (≥ 40 caracteres)", ok: desc.trim().length >= 40 },
    { label: "Al menos 2 tecnologías declaradas", ok: techs.length >= 2 },
    { label: "Enlace al repositorio válido", ok: /github\.com|gitlab\.com/.test(repo) },
    { label: "README inicial (≥ 120 caracteres)", ok: readme.trim().length >= 120 },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  function addTech() {
    if (techInput.trim() && !techs.includes(techInput.trim())) {
      setTechs([...techs, techInput.trim()]);
      setTechInput("");
    }
  }

  return (
    <AppShell
      breadcrumb={<span className="font-medium text-foreground">Subir proyecto</span>}
    >
      <div className="px-6 py-8 lg:px-10">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl tracking-tight">
              Publicar nuevo proyecto
            </h1>
            <p className="text-sm text-muted-foreground">
              Documenta tu trabajo para que las próximas generaciones puedan
              continuarlo.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs md:flex">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            Borrador guardado automáticamente
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form */}
          <form
            className="space-y-6 lg:col-span-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Field label="Nombre del proyecto" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. SIGMA — Sistema de asistencia"
                className="input"
              />
            </Field>

            <Field
              label="Descripción corta"
              hint={`${desc.length}/240 — explica el problema y la solución en una o dos frases`}
              required
            >
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 240))}
                rows={3}
                placeholder="Sistema de control de asistencia con reconocimiento facial…"
                className="input resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Curso" required>
                <div className="flex gap-1.5">
                  {["PI1", "PI2", "PI3", "TG"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCourse(c)}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                        course === c
                          ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Semestre">
                <select className="input">
                  <option>2025-1</option>
                  <option>2024-2</option>
                  <option>2024-1</option>
                </select>
              </Field>
            </div>

            <Field label="Tecnologías" hint="Pulsa Enter para agregar" required>
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
                  placeholder="Agregar tecnología…"
                  className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </Field>

            <Field label="Enlace al repositorio" required>
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="https://github.com/usuario/proyecto"
                className="input font-mono text-xs"
              />
            </Field>

            <Field
              label="README / Documentación inicial"
              hint={`${readme.length} caracteres — usa Markdown`}
              required
            >
              <textarea
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                rows={8}
                placeholder={`# Mi Proyecto\n\n## Problema\n…\n\n## Solución\n…\n\n## Cómo correr\n\`\`\`bash\nbun install\nbun run dev\n\`\`\``}
                className="input resize-y font-mono text-xs leading-relaxed"
              />
            </Field>

            <div className="flex items-center justify-between border-t border-border pt-5">
              <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
                Guardar borrador
              </button>
              <button
                type="submit"
                disabled={passed < checks.length}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium",
                  passed === checks.length
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
              >
                <Upload className="h-4 w-4" />
                Publicar proyecto
              </button>
            </div>
          </form>

          {/* Quality side */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Calidad mínima</h3>
                <span className="font-mono text-sm tabular-nums">{score}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${score}%`,
                    background:
                      score === 100
                        ? "var(--accent-emerald)"
                        : score >= 60
                          ? "var(--accent-amber)"
                          : "var(--destructive)",
                  }}
                />
              </div>
              <ul className="mt-4 space-y-2.5">
                {checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn(c.ok ? "text-foreground" : "text-muted-foreground")}>
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
              {passed < checks.length && (
                <p className="mt-4 rounded-md bg-accent-amber/10 px-3 py-2 text-[11px] text-[oklch(0.45_0.13_75)]">
                  Completa todos los criterios para publicar.
                </p>
              )}
            </div>
          </aside>
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
        textarea.input { height: auto; padding: 0.625rem 0.75rem; line-height: 1.5; }
      `}</style>
    </div>
  );
}
