import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProjectMedia } from "@/components/project-media";
import { getConnectedProjects, getProject, projects } from "@/lib/projects";

interface ProjectPageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.name,
    description: project.description,
    openGraph: { title: `${project.name} · C2K`, description: project.description, type: "article", images: [] },
    twitter: { card: "summary", title: `${project.name} · C2K`, description: project.description, images: [] },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const connections = getConnectedProjects(project.slug);
  const publicBasis = project.slug === "songsorter"
    ? project.basis.replace("pairwise ranking is absent", "the implemented mechanic is current-track triage")
    : project.basis;

  return (
    <article className="page-shell project-detail" data-accent={project.accent}>
      <Button asChild variant="ghost" size="sm" className="project-back-link"><Link href="/projects"><ArrowLeft aria-hidden="true" size={15} />All projects</Link></Button>
      <header className="project-hero">
        <div className="project-hero-meta"><Badge>{project.category}</Badge><span className="project-lifecycle">{project.lifecycle.replaceAll("-", " ")}</span>{project.workInProgress && <Badge variant="secondary">Work in progress</Badge>}</div>
        <p className="project-route">c2k.page/projects/{project.slug}</p>
        <h1>{project.name}</h1>
        <p className="project-dek">{project.tagline}</p>
        <p className="project-lede">{project.description}</p>
        {!!project.links?.length && <div className="project-links">{project.links.map((link) => <Button key={link.href} asChild variant="outline"><a href={link.href} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight aria-hidden="true" size={15} /><span className="sr-only"> opens in a new tab</span></a></Button>)}</div>}
      </header>

      <ProjectMedia project={project} />

      <Separator />
      <div className="project-detail-grid">
        <section aria-labelledby="story-title"><span className="eyebrow">01 / Story</span><h2 id="story-title">Why it exists</h2><p className="project-story">{project.story}</p></section>
        <aside aria-labelledby="stack-title"><span className="eyebrow">02 / Build</span><h2 id="stack-title">System stack</h2><ul className="stack-list">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul><div className="truth-basis"><strong>{project.confidence} confidence</strong><p>{publicBasis}</p></div></aside>
      </div>

      <section className="highlight-section" aria-labelledby="highlights-title"><span className="eyebrow">03 / Sequence</span><h2 id="highlights-title">How the story resolves</h2><div className="highlight-grid">{project.highlights.map((highlight, index) => <Card key={highlight}><span>{String(index + 1).padStart(2, "0")}</span><p>{highlight}</p></Card>)}</div></section>

      {!!connections.length && <section className="connections-section" aria-labelledby="connections-title"><div className="section-heading"><div><span className="eyebrow">04 / Network</span><h2 id="connections-title">Connected systems</h2></div><Network aria-hidden="true" /></div><div className="connection-grid">{connections.map(({ project: connected, label }) => <Link href={`/projects/${connected.slug}`} key={connected.slug}><small>{label}</small><strong>{connected.name}</strong><span>{connected.tagline}</span><ArrowUpRight aria-hidden="true" size={17} /></Link>)}</div></section>}
    </article>
  );
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
