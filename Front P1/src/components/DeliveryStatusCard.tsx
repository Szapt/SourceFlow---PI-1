import { useState } from "react";
import { Send, CheckCircle2, Clock, FileText } from "lucide-react";
import { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

export type FaseEntrega = "DESARROLLO" | "ENTREGA";

const FORM_ENTREGA_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSctsz6K1_CM3SJwFamZprb9anCgJrVpdZJoCGotYCpSYiXlzQ/viewform?usp=header";

const MANIFIESTO_PDF_URL = "https://www.africau.edu/images/default/sample.pdf";

export function DeliveryStatusCard({
  project,
  defaultFase,
}: {
  project: Project;
  defaultFase?: FaseEntrega;
}) {
  const initial: FaseEntrega =
    defaultFase ?? (project.slug === "gradehub" ? "ENTREGA" : "DESARROLLO");
  const [faseEntrega, setFaseEntrega] = useState<FaseEntrega>(initial);
  const isEntrega = faseEntrega === "ENTREGA";

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Estado de Entrega</h3>
        <button
          type="button"
          onClick={() => setFaseEntrega(isEntrega ? "DESARROLLO" : "ENTREGA")}
          className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted"
          title="Alternar fase (demo)"
        >
          {faseEntrega}
        </button>
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          isEntrega
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        )}
      >
        {isEntrega ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        Estado: {isEntrega ? "Entrega Abierta" : "En desarrollo"}
      </span>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {isEntrega
          ? "Ya puedes realizar la entrega oficial de tu proyecto."
          : "El formulario de entrega final se habilitará el 20 de mayo."}
      </p>

      {isEntrega ? (
        <a
          href={FORM_ENTREGA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Send className="h-4 w-4" />
          Realizar Entrega Final
        </a>
      ) : (
        <a
          href={MANIFIESTO_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
        >
          <FileText className="h-4 w-4" />
          Ver Plantilla del Manifiesto
        </a>
      )}
    </div>
  );
}
