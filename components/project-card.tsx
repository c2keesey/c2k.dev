import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-card-link" aria-label={`Open ${project.name} project page`}>
      <Card className="project-card" data-accent={project.accent} data-priority={priority || undefined}>
        <div className="project-card-topline">
          <Badge variant="outline">{project.category}</Badge>
          <span className="project-lifecycle">{project.lifecycle.replaceAll("-", " ")}</span>
        </div>
        <div>
          <p className="project-index">/{project.slug}</p>
          <h2>{project.name}</h2>
          <p className="project-tagline">{project.tagline}</p>
        </div>
        <p className="project-description">{project.description}</p>
        <div className="project-card-footer">
          <span>{project.stack.slice(0, 3).join(" · ")}</span>
          <ArrowUpRight aria-hidden="true" size={18} />
        </div>
      </Card>
    </Link>
  );
}
