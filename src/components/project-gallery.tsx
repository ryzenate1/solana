'use client';
import { useState } from 'react';
import { filterProjects } from '@/lib/project-filters';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '@/lib/content';
export function ProjectGallery() {
  const [category, setCategory] = useState('All'), [size, setSize] = useState('all');
  const visible = filterProjects(projects, category, size);
  if (!projects.length) return <div className="project-placeholder"><div className="placeholder-cross a"/><div className="placeholder-cross b"/><span className="mono">THE PROJECT JOURNAL / COMING INTO FOCUS</span><h3>Real spaces.<br/>Considered energy.</h3><p>Our project journal is being prepared.<br/>Verified installations and original photography will appear here.</p><Link href="/contact" className="text-link">Discuss your property <ArrowUpRight size={16}/></Link><span className="placeholder-label mono">PROJECT PHOTOGRAPHY TO FOLLOW</span></div>;
  return <><div className="project-filters"><div className="studio-tabs" aria-label="Project sector">{['All', 'Residential', 'Commercial', 'Industrial'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div><label className="studio-field">System capacity<select value={size} onChange={e => setSize(e.target.value)}><option value="all">All capacities</option><option value="small">Below 10 kWp</option><option value="medium">10–99.9 kWp</option><option value="large">100 kWp and above</option></select></label></div><p className="studio-note" role="status">{visible.length} verified project{visible.length === 1 ? '' : 's'}</p>{!visible.length && <div className="empty-filter"><h3>No projects match these filters.</h3><button className="text-link" onClick={() => { setCategory('All'); setSize('all'); }}>Clear filters ↗</button></div>}<div className="project-gallery">{visible.map(project => <Link key={project.slug} href={`/projects/${project.slug}`} className="project-card"><div className="project-image"><Image src={project.image} alt={project.name} width={1400} height={900}/></div><div className="project-card-caption"><div><span className="mono">{project.category} / {project.location}</span><h3>{project.name}</h3></div><span>{project.capacityKwp !== null ? `${project.capacityKwp} kWp` : ''}<ArrowUpRight size={20}/></span></div></Link>)}</div></>;
}
