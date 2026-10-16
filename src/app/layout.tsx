import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ContactDock } from '@/components/contact-dock';
import { Analytics } from '@/components/analytics';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';
const manrope = localFont({ src: './fonts/manrope.woff2', variable: '--font-manrope', display: 'swap', weight: '200 800' });
const mono = localFont({ src: './fonts/ibm-plex-mono.woff2', variable: '--font-plex', display: 'swap', weight: '400' });
export const metadata: Metadata = { title: { default: 'Universal Solar — A brighter way to power.', template: '%s — Universal Solar' }, description: 'Premium solar installations, designed with precision. Explore considered solar solutions for homes and commercial spaces.', robots: process.env.NEXT_PUBLIC_SITE_URL ? { index: true, follow: true } : { index: false, follow: false }, ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}), openGraph: { title: 'Universal Solar — A brighter way to power.', description: 'Solar energy, considered from every angle.', type: 'website' } };
export const viewport: Viewport = { themeColor: '#080A0C', colorScheme: 'dark' };
function publicNumber(value?: string) { const digits = value?.replace(/[+ ()-]/g, ''); return digits && /^\d{8,15}$/.test(digits) ? digits : undefined; }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${manrope.variable} ${mono.variable}`}><body><a href="#main-content" className="skip-link">Skip to content</a><Analytics/><Header/>{children}<Footer/><ContactDock phone={publicNumber(process.env.BUSINESS_PHONE)} whatsapp={publicNumber(process.env.BUSINESS_WHATSAPP)}/></body></html>; }
