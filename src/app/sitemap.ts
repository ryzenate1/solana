import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { const base=process.env.NEXT_PUBLIC_SITE_URL; if(!base)return []; return ['','/solutions','/solutions/residential','/solutions/commercial','/tools','/projects','/about','/service','/knowledge','/contact','/privacy'].map(path=>({url:new URL(path,base).href})); }
