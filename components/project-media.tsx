import type { Project } from "@/lib/projects";

export function ProjectMedia({ project }: { project: Project }) {
  if (project.slug === "agent-console") {
    return (
      <figure className="project-media-slot agent-console-media" data-slot="bespoke-project-media" data-media-key="agent-console" data-asset-slot="agent-console-primary" data-project="agent-console" aria-labelledby="agent-console-caption">
        <div className="console-phone" aria-hidden="true">
          <div className="console-phone-bar"><i />Agent Console <span>Private</span></div>
          <div className="console-message human"><small>Human</small>Ship the approved foundation.</div>
          <div className="console-event"><i />Automation Conductor admitted work</div>
          <div className="console-message agent"><small>System</small>Worker isolated. PR and exact-revision deployment gates are armed.</div>
          <div className="console-input">Message the resident agent…</div>
        </div>
        <div className="lifecycle-rail" aria-hidden="true">
          {[
            ["01", "Human", "intent + authority"], ["02", "Conductor", "provenance + admission"],
            ["03", "Worker", "isolated worktree"], ["04", "PR / CI", "verified change"], ["05", "Deploy", "exact revision"],
          ].map(([index, title, copy]) => <div key={index}><span>{index}</span><i /><strong>{title}</strong><small>{copy}</small></div>)}
        </div>
        <figcaption id="agent-console-caption"><strong>Representative local demo.</strong> No live service, private history, host data, or authenticated endpoint is loaded.</figcaption>
      </figure>
    );
  }

  return (
    <figure className="project-media-slot system-map-media" data-slot="bespoke-project-media" data-media-key={project.slug} data-asset-slot={`${project.slug}-primary`} data-project={project.slug} aria-labelledby={`${project.slug}-media-caption`}>
      <div className="media-grid" aria-hidden="true">
        <span className="media-node media-node-core">{project.name}</span>
        {project.highlights.map((highlight, index) => <span className={`media-node media-node-${index + 1}`} key={highlight}>{highlight}</span>)}
        <i className="media-line line-1" /><i className="media-line line-2" /><i className="media-line line-3" />
      </div>
      <figcaption id={`${project.slug}-media-caption`}>{project.name} system view · {project.stack.slice(0, 3).join(" + ")} organized around {project.highlights.length} verified operating outcomes.</figcaption>
    </figure>
  );
}
