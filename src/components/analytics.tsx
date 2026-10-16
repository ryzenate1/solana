'use client';
import { useEffect } from 'react';
// Connect a consent-managed analytics adapter to this event queue. No PII is sent.
export function Analytics() { useEffect(()=>{ const handler = (e: Event)=>{ const detail=(e as CustomEvent).detail; if(!detail||!['calculator_proposal','enquiry_delivered','survey_request_click','phone_click','whatsapp_click'].includes(detail.event))return; const w=window as Window & {dataLayer?: Record<string,string>[]}; (w.dataLayer??=[]).push({event:detail.event,...(detail.tool?{tool:detail.tool}:{}),...(detail.category?{category:detail.category}:{}),...(detail.service?{service:detail.service}:{})}); }; window.addEventListener('solar-event',handler); return ()=>window.removeEventListener('solar-event',handler); },[]); return null; }
