import { useNavigate } from "@tanstack/react-router";
import { Send, CheckCircle2, Clock, FileText } from "lucide-react";
import { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const FORM_ENTREGA_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSctsz6K1_CM3SJwFamZprb9anCgJrVpdZJoCGotYCpSYiXlzQ/viewform?usp=header";

export function DeliveryStatusCard({
  project,
}: {
  project: Project;
}) {
  const navigate = useNavigate();
  const isSubmissionAvailable = project.isSubmissionAvailable ?? false;
  const localDateStr = project.submissionDate ? project.submissionDate.replace(/-/g, '/') : "";
  const formattedSubmissionDate = localDateStr
    ? new Date(localDateStr).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Estado de Entrega</h3>
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          isSubmissionAvailable
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        )}
      >
        {isSubmissionAvailable ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        Estado: {isSubmissionAvailable ? "Entrega Abierta" : "En progreso"}
      </span>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {isSubmissionAvailable
          ? "Ya puedes realizar la entrega oficial de tu proyecto."
          : `El formulario de entrega final se habilitará el ${formattedSubmissionDate}.`}
      </p>

      {isSubmissionAvailable ? (
        <a
          href={FORM_ENTREGA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Send className="h-4 w-4" />
          Llenar formulario
        </a>
      ) : (
        <button
          type="button"
          onClick={() => navigate({ to: "/docs" })}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
        >
          <FileText className="h-4 w-4" />
          ¿Qué contiene el Manifiesto?
        </button>
      )}
    </div>
  );
}
