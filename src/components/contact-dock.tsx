'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Wrench, Phone, MessageCircle } from 'lucide-react';
export function ContactDock({ phone, whatsapp }: { phone?: string; whatsapp?: string }) {
  const path = usePathname();
  if (path === '/contact') return null;
  function track(event: string) { window.dispatchEvent(new CustomEvent('solar-event', { detail: { event } })); }
  return <nav className="contact-dock" aria-label="Quick contact"><Link href="/contact?service=survey" onClick={() => track('survey_request_click')}><CalendarDays size={16}/><span>Book a survey</span></Link><Link href="/service"><Wrench size={16}/><span>Service</span></Link>{phone && <a href={`tel:+${phone}`} onClick={() => track('phone_click')}><Phone size={16}/><span>Call</span></a>}{whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(path.startsWith('/service') ? 'Hello, I would like to discuss solar maintenance.' : 'Hello, I would like to discuss a solar installation.')}`} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click')}><MessageCircle size={16}/><span>WhatsApp</span></a>}</nav>;
}
