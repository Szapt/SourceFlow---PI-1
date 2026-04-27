import { Link } from "@tanstack/react-router";
import { GitFork, Star, AlertCircle, Clock } from "lucide-react";
import { Project, courseColor } from "@/data/projects";
import { StatusBadge } from "./StatusBadge";
import { QualityIndicator } from "./QualityIndicator";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent-blue/40 hover:shadow-[0_4px_16px_oklch(0.55_0.18_255/0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
              courseColor[project.course],
            )}
          >
            {project.course}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {project.semester}
          </span>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground group-hover:text-accent-blue">
        {project.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {project.short}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {project.technologies.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground/75"
          >
            {t}
          </span>
        ))}
        {project.technologies.length > 4 && (
          <span className="text-[10px] font-mono text-muted-foreground">
            +{project.technologies.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <QualityIndicator label="Documentación" value={project.documentationLevel} />
        <QualityIndicator label="Calidad" value={project.qualityScore} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex -space-x-1.5">
          {project.authors.map((a) => (
            <div
              key={a.initials}
              title={a.name}
              className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-blue/80 to-accent-violet/80 text-[9px] font-semibold text-white ring-2 ring-surface"
            >
              {a.initials}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" />
            {project.stars}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {project.forks}
          </span>
          <span className="inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {project.openIssues}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {project.updatedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
