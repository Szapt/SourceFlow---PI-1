import { ProjectStatus, statusLabel } from "@/data/projects";
import { cn } from "@/lib/utils";

const styles: Record<ProjectStatus, string> = {
  complete:
    "bg-[oklch(0.95_0.05_160)] text-[oklch(0.38_0.12_160)] ring-[oklch(0.85_0.08_160)]",
  in_progress:
    "bg-[oklch(0.95_0.04_250)] text-[oklch(0.4_0.16_250)] ring-[oklch(0.85_0.08_250)]",
  abandoned:
    "bg-[oklch(0.96_0.005_50)] text-[oklch(0.45_0.02_50)] ring-[oklch(0.88_0.005_50)]",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {statusLabel[status]}
    </span>
  );
}
