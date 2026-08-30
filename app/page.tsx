import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ActivityPanel } from "@/components/activity-panel";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/projects";

export default function HomePage() {
  const featured = projects.filter((project) => project.featured).slice(0, 3);
  return (
    <div className="page-shell home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-kicker"><span />Christopher Carson Keesey / C2K</div>
        <h1 id="home-title">I build systems that make <em>ambition feel operational.</em></h1>
        <p className="hero-copy">CTO and context engineer at MAIA Analytics. Agent infrastructure, odd hardware, useful automations, and the connective tissue between them—running from the Outer Sunset.</p>
        <div className="hero-actions">
          <Button asChild size="lg"><Link href="/projects">Explore the system <ArrowRight aria-hidden="true" size={17} /></Link></Button>
          <Button asChild size="lg" variant="outline"><a href="https://maia-analytics.com" target="_blank" rel="noreferrer">MAIA Analytics ↗</a></Button>
        </div>
        <div className="hero-social" aria-label="Social profiles">
          <a href="https://github.com/c2keesey" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span>GitHub<span className="sr-only"> (opens in a new tab)</span></a>
          <a href="https://linkedin.com/in/c2keesey" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span>LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
          <a href="https://x.com/c2keesey" target="_blank" rel="noreferrer">𝕏<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </section>

      <section className="home-system-grid" aria-label="System overview">
        <div className="system-stats">
          <div><strong>{projects.length}</strong><span>projects in one typed atlas</span></div>
          <div><strong>05</strong><span>live server contracts</span></div>
          <div><strong>01</strong><span>OptiPlex under the desk</span></div>
        </div>
        <ActivityPanel />
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading"><div><span className="eyebrow">Selected systems</span><h2 id="featured-title">Built to become daily life.</h2></div><Link href="/projects">View all {projects.length} <ArrowRight aria-hidden="true" size={16} /></Link></div>
        <div className="featured-grid">{featured.map((project) => <ProjectCard project={project} priority key={project.slug} />)}</div>
      </section>
    </div>
  );
}
