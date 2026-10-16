'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { validateEnquiry, type Enquiry, type FieldErrors } from '@/lib/enquiry';
export function EnquiryForm({ defaultProperty = '', defaultLocation = '', defaultService = 'installation', estimate = '', configured = false }: { defaultProperty?: string; defaultLocation?: string; defaultService?: string; estimate?: string; configured?: boolean }) {
  const form = useRef<HTMLFormElement>(null), message = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  function focusError(validation: FieldErrors) { const first = Object.keys(validation)[0]; setStep(['service','property','location','requirements','timeframe'].includes(first) ? 1 : 2); requestAnimationFrame(() => (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus()); }
  function next() { const f = Object.fromEntries(new FormData(form.current!)); const validation = validateEnquiry({ ...f, name:'Validation', email:'test@example.com', preference:'email', consent:'yes' }); const relevant = Object.fromEntries(Object.entries(validation.errors).filter(([k])=>['service','property','location','requirements','timeframe'].includes(k))); setErrors(relevant); if(Object.keys(relevant).length) focusError(relevant); else { setStep(2); requestAnimationFrame(()=>document.getElementById('name')?.focus()); } }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(step===1){ next(); return; } if(status==='sending') return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const params = new URLSearchParams(window.location.search); fields.source = (params.get('utm_source') || (estimate ? 'calculator' : defaultService === 'maintenance' ? 'service-desk' : 'website')).slice(0,200);
    const validation = validateEnquiry(fields); setErrors(validation.errors);
    if (!validation.data) { focusError(validation.errors); return; }
    setStatus('sending'); setFeedback('');
    try {
      const response = await fetch('/api/enquiry', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(validation.data), signal:AbortSignal.timeout(15000) }); const result = await response.json();
      if(!response.ok){ if(result.errors) setErrors(result.errors); throw new Error(result.message || 'Your enquiry was not sent. Please try again later.'); }
      setStatus('sent'); setFeedback(`Your request has been delivered. Reference: ${result.reference}. The team will confirm the next step and appointment availability.`);
      window.dispatchEvent(new CustomEvent('solar-event',{detail:{event:'enquiry_delivered',service:validation.data.service,category:validation.data.property}}));
      form.current?.reset();
    } catch(error) { setStatus('error'); setFeedback(error instanceof Error && error.name!=='TimeoutError' && error.name!=='TypeError' ? error.message : 'Your enquiry was not sent. Please check your connection and try again.'); }
    requestAnimationFrame(()=>message.current?.focus());
  }
  const err = (name: keyof Enquiry) => errors[name] ? <span id={`${name}-error`} className="field-error">{errors[name]}</span> : null;
  const attrs = (name: keyof Enquiry) => ({'aria-invalid':!!errors[name], 'aria-describedby':errors[name]?`${name}-error`:undefined});
  return <form ref={form} onSubmit={submit} noValidate className="enquiry-form" aria-busy={status==='sending'}>
    <div className="form-heading"><span className="mono">{step===1?'01 / YOUR PROJECT':'02 / YOUR CONTACT DETAILS'}</span><span className="mono muted">STEP {step} OF 2</span></div>
    {!configured && <p className="form-notice">Online enquiry delivery is being set up. Messages cannot be sent yet.</p>}
    <input type="hidden" name="estimate" value={estimate}/><div hidden aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <div hidden={step!==1}><div className="form-grid">
    <div className="field"><label htmlFor="service">How can we help? *</label><select id="service" name="service" defaultValue={defaultService} {...attrs('service')}><option value="installation">New installation / quotation</option><option value="survey">Site survey</option><option value="maintenance">Maintenance / fault</option><option value="warranty">Warranty / documents</option><option value="renewal">Maintenance renewal</option></select>{err('service')}</div>
    <div className="field"><label htmlFor="property">Property type *</label><select id="property" name="property" defaultValue={defaultProperty} {...attrs('property')}><option value="" disabled>Select property type</option><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option><option value="other">Something else</option></select>{err('property')}</div>
    <div className="field"><label htmlFor="location">Property location *</label><input id="location" name="location" defaultValue={defaultLocation} autoComplete="address-level2" maxLength={200} placeholder="Town, city, or area" {...attrs('location')}/>{err('location')}</div>
    <div className="field"><label htmlFor="timeframe">Project timeframe *</label><select id="timeframe" name="timeframe" defaultValue="exploring" {...attrs('timeframe')}><option value="exploring">Just exploring</option><option value="1-3 months">1–3 months</option><option value="3-6 months">3–6 months</option><option value="as soon as possible">As soon as possible</option></select>{err('timeframe')}</div>
    <div className="field field-full"><label htmlFor="requirements">Requirements or service issue <span>(optional)</span></label><textarea id="requirements" name="requirements" maxLength={3000} rows={4} placeholder="Monthly bill / consumption, roof details, fault code, equipment model, or preferred survey date." {...attrs('requirements')}/>{err('requirements')}</div></div>
    {estimate && <div className="estimate-summary"><span className="mono accent">YOUR CALCULATOR SCENARIO</span><p>{estimate}</p>{err('estimate')}</div>}
    <div className="form-submit"><p>Next: choose how we contact you.</p><Button type="button" onClick={next}>Continue <ArrowUpRight size={16}/></Button></div></div>
    <div hidden={step!==2}><div className="form-grid"><div className="field"><label htmlFor="name">Your name *</label><input id="name" name="name" autoComplete="name" maxLength={120} placeholder="Full name" {...attrs('name')}/>{err('name')}</div><div className="field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" {...attrs('email')}/>{err('email')}</div><div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Required for phone / WhatsApp" {...attrs('phone')}/>{err('phone')}</div><div className="field"><label htmlFor="preference">Contact preference *</label><select id="preference" name="preference" defaultValue="email" {...attrs('preference')}><option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp, if available</option></select>{err('preference')}</div></div>
    <label className="consent"><input type="checkbox" name="consent" value="yes" {...attrs('consent')}/><span>I agree to be contacted about this request. <Link href="/privacy">Read the privacy notice.</Link></span></label>{err('consent')}
    <div className="form-submit"><button type="button" className="text-link" onClick={()=>setStep(1)}>← Project details</button><Button type="submit" disabled={status==='sending'||status==='sent'}>{status==='sending'?<>Sending <LoaderCircle className="spin" size={16}/></>:status==='sent'?<>Delivered <Check size={16}/></>:<>Send enquiry <ArrowUpRight size={17}/></>}</Button></div></div>
    <div ref={message} tabIndex={-1} role="status" aria-live="polite" className={`form-feedback ${status==='error'?'feedback-error':''}`}>{feedback}</div>
  </form>;
}
