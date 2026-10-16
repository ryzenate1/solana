'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navigation } from '@/lib/content';
import { Button } from './ui/button';

export function Wordmark() { return <span className="wordmark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 9 16 3l11 6v14l-11 6-11-6V9Z" stroke="currentColor"/><path d="m5 9 11 6 11-6M16 15v14M10.5 6l11 6v14M5 16l11 6 11-6" stroke="currentColor"/></svg><span className="brand-name">UNIVERSAL<span>SOLAR POWER SOLUTIONS</span></span></span>; }
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  useEffect(() => { const update = () => setScrolled(window.scrollY > 24); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <Link href="/" aria-label="Universal Solar home"><Wordmark /></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <Link key={item.label} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav>
    <Button asChild variant="outline" className="header-cta"><Link href="/contact">Let’s talk solar <ArrowUpRight size={15}/></Link></Button>
    <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><button className="menu-trigger" aria-label="Open navigation"><Menu size={24}/></button></Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay className="menu-overlay"/><Dialog.Content className="mobile-menu" aria-describedby={undefined}>
        <Dialog.Title className="sr-only">Navigation</Dialog.Title><div className="menu-top"><Link href="/" onClick={() => setOpen(false)}><Wordmark/></Link><Dialog.Close className="menu-close" aria-label="Close navigation"><X/></Dialog.Close></div>
        <nav aria-label="Mobile navigation">{[...navigation, { label: 'Start a conversation', href: '/contact' }].map((item, i) => <motion.div key={item.href} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: reduced ? 0 : i * .04 }}><Link href={item.href} onClick={() => setOpen(false)}><span className="mono">0{i + 1}</span>{item.label}<ArrowUpRight/></Link></motion.div>)}</nav>
        <p className="mono menu-note">A quieter kind of power.</p>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </header>;
}
