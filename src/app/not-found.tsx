import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound() { return <main id="main-content" className="section-shell error-page"><span className="mono accent">404 / A DIFFERENT DIRECTION</span><h1>This page is<br/>out of the picture.</h1><p>The project or page you’re looking for isn’t available.</p><Link className="text-link" href="/">Return to Universal Solar <ArrowUpRight size={18}/></Link></main>; }
