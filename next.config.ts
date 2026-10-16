import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader: false, reactStrictMode: true, async headers() { return [{ source: '/sequences/:scene/:frame.webp', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }]; } };
export default config;
