import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { ProjectGallery } from '@/components/project-gallery';
import { Closing } from '@/components/footer';
export const metadata: Metadata = { title: 'The project journal', description: 'A place for verified Universal Solar installations and original project photography.' };
export default function Projects() { return <main id="main-content"><PageIntro label="THE PROJECT JOURNAL" title={<>Energy in<br/>its element.</>} text="The measure of a solar installation is how thoughtfully it belongs to its setting. This is where those stories will live."/><section className="section-shell projects-page"><ProjectGallery/></section><Closing/></main>; }
