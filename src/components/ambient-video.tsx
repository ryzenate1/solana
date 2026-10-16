'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
export function AmbientVideo({ src, mobileSrc, poster, label, priority = false }: { src: string; mobileSrc?: string; poster: string; label: string; priority?: boolean }) {
  const root = useRef<HTMLDivElement>(null), video = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false), playByUser = useRef(false);
  const [playing, setPlaying] = useState(false), [failed, setFailed] = useState(false);
  function start() {
    const element = video.current;
    if (!element) return;
    if (!element.getAttribute('src')) { element.src = mobileSrc && window.matchMedia('(max-width: 760px)').matches ? mobileSrc : src; element.load(); }
    void element.play().catch(() => { /* Autoplay may be blocked; the poster and play button remain. */ });
  }
  useEffect(() => {
    const element = video.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let visible = false;
    const update = () => {
      const allowed = (!reduce.matches && !connection?.saveData) || playByUser.current;
      if (visible && !document.hidden && allowed && !pausedByUser.current) {
        if (!element.getAttribute('src')) { element.src = mobileSrc && window.matchMedia('(max-width: 760px)').matches ? mobileSrc : src; element.load(); }
        void element.play().catch(() => {});
      } else element.pause();
      if (!allowed && element.getAttribute('src')) { element.removeAttribute('src'); element.load(); }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .05 });
    observer.observe(root.current!);
    reduce.addEventListener('change', update); connection?.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); reduce.removeEventListener('change', update); connection?.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); element.pause(); element.removeAttribute('src'); element.load(); };
  }, [src, mobileSrc]);
  function toggle() { if (video.current?.paused) { pausedByUser.current = false; playByUser.current = true; start(); } else { pausedByUser.current = true; video.current?.pause(); } }
  return <div ref={root} className={`ambient-video ${playing ? 'is-playing' : ''}`}>
    <img src={poster} alt="" aria-hidden="true" width={768} height={432} fetchPriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'}/>
    <video ref={video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setFailed(true); }}/>
    {failed ? <span className="video-fallback" role="status">Still image shown</span> : <button type="button" className="video-toggle" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}>{playing ? <Pause size={14}/> : <Play size={14}/>}<span>{playing ? 'Pause' : 'Play'} film</span></button>}
  </div>;
}
