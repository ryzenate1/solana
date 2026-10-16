'use client';
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger);
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => { const mm = gsap.matchMedia(); mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(root.current, { y: 24 }, { y: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 92%', once: true } });
  }); return () => mm.revert(); }, { scope: root });
  return <div ref={root} className={className}>{children}</div>;
}
export function ProcessProgress({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => { const mm = gsap.matchMedia(); mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo('.process-progress-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'bottom 65%', scrub: true } });
  }); return () => mm.revert(); }, { scope: root });
  return <div ref={root} className="process-list"><div className="process-progress" aria-hidden="true"><div className="process-progress-fill"/></div>{children}</div>;
}
