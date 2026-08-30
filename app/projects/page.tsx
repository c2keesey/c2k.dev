import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects, projectCategories } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects", description: `A typed atlas of ${projects.length} connected projects spanning software, hardware, automation, and infrastructure.` };

export default function ProjectsPage() {
  return (
    <div className="page-shell projects-page">
      <header className="page-heading projects-heading">
        <div><span className="eyebrow">Project atlas / {String(projects.length).padStart(2, "0")} nodes</span><h1>Everything connects.</h1><p>Products, tools, hardware, and background loops—now driven by one canonical model on every screen.</p></div>
        <div className="category-cloud" aria-label="Project categories">{projectCategories.map((category) => <span key={category}>{category}</span>)}</div>
      </header>
      <div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.slug} />)}</div>
    </div>
  );
}
