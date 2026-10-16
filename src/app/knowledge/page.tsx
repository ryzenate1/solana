import { PageIntro } from '@/components/page-intro';
import { KnowledgeCentre } from '@/components/knowledge-centre';
export const metadata = { title: 'Solar knowledge — English & Tamil', description: 'Practical solar guides for homes, businesses and maintenance, in English and Tamil.' };
export default function Knowledge() { return <main id="main-content"><PageIntro label="KNOWLEDGE / ENGLISH & தமிழ்" title={<>Understand more.<br/>Decide with confidence.</>} text="Practical answers about your roof, electricity use, investment and long-term system care."/><section className="section-shell studio-page"><KnowledgeCentre/></section></main>; }
