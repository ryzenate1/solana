import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { SystemDiagram } from '@/components/system-diagram';
import { Closing } from '@/components/footer';
import { Reveal } from '@/components/reveal';
import { solutions } from '@/lib/content';
export const metadata: Metadata = { title: 'Solar solutions', description: 'Considered residential and commercial solar solutions, planned around your property.' };
export default function Solutions() { return <main id="main-content"><PageIntro label="SOLUTIONS / BUILT AROUND YOUR WORLD" title={<>Your roof.<br/>A new perspective.</>} text="Every property asks different questions. We start there, designing a solar solution around the building and the life within it."/>{solutions.map(solution => <section id={solution.id} key={solution.id} className="solution-page-section section-shell section-pad"><Reveal className="solution-page-layout"><div><span className="mono accent">{solution.number} / {solution.title.toUpperCase()}</span><h2>{solution.line}</h2><p className="large-copy">{solution.description}</p><ul className="check-list">{solution.details.map(detail => <li key={detail}><Check size={16}/>{detail}</li>)}</ul><Link href={`/solutions/${solution.id}`} className="text-link">Explore your {solution.id === 'residential' ? 'home' : 'commercial'} installation <ArrowUpRight size={16}/></Link></div><SystemDiagram variant={solution.id as 'residential' | 'commercial'}/></Reveal></section>)}<section className="section-shell section-pad quiet-note"><span className="mono">THE RIGHT STARTING POINT</span><h2>First, understand<br/>the possibilities.</h2><p>Roof condition, shading, electrical infrastructure, and energy use all inform the final design. System capacity, equipment, costs, and expected output are established after an assessment.</p></section><Closing/></main>; }
