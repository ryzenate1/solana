import { NextResponse } from 'next/server';
import { validateEnquiry } from '@/lib/enquiry';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
  if (origin && origin !== expectedOrigin) return NextResponse.json({ message: 'This request could not be accepted.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ message: 'A JSON enquiry is required.' }, { status: 415 });
  let input: unknown;
  try { const body = await request.text(); if (new TextEncoder().encode(body).length > 10000) return NextResponse.json({ message: 'Your enquiry is too long.' }, { status: 413 }); input = JSON.parse(body); }
  catch { return NextResponse.json({ message: 'The enquiry could not be read.' }, { status: 400 }); }
  const { data, errors } = validateEnquiry(input);
  if (!data) return NextResponse.json({ message: 'Please check the highlighted fields.', errors }, { status: 422 });
  if (data.website) return NextResponse.json({ message: 'This request could not be accepted.' }, { status: 422 });
  const reference = `US-${crypto.randomUUID()}`;
  const endpoint = process.env.ENQUIRY_WEBHOOK_URL;
  if (!endpoint) return NextResponse.json({ message: 'Your enquiry was not sent. Online enquiry delivery is not available yet. Please check back soon.' }, { status: 503 });
  try {
    const destination = new URL(endpoint);
    if (destination.protocol !== 'https:') throw new Error('HTTPS required');
    const response = await fetch(destination, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify({ ...data, acquisitionSource: data.source, reference, source: 'universal-solar-website', leadCategory: ['maintenance','warranty','renewal'].includes(data.service) ? 'service' : data.property, leadStatus: 'new', followUpRequired: true, submittedAt: new Date().toISOString() }), signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store' });
    if (!response.ok) throw new Error('Delivery rejected');
    return NextResponse.json({ message: 'Your enquiry has been delivered.', reference });
  } catch { return NextResponse.json({ message: 'Your enquiry was not sent. The delivery service is unavailable. Please try again later.' }, { status: 502 }); }
}
