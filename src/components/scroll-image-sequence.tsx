'use client';
/* The poster is intentionally a plain <img>: never transcode archival WebP through Next's image optimizer. */
/* eslint-disable @next/next/no-img-element */
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FrameCache } from '@/lib/frame-cache';
import { progressToFrame, type Sequence } from '@/lib/sequences';
gsap.registerPlugin(ScrollTrigger);

export function ScrollImageSequence({ scene, children, fit = 'contain', headingId = 'hero-heading' }: { scene: Sequence; children?: ReactNode; fit?: 'contain' | 'cover'; headingId?: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const element = root.current!, surface = canvas.current!, box = stage.current!;
    const context = surface.getContext('2d', { alpha: true });
    if (!context) return;
    const mm = gsap.matchMedia();
    mm.add({ animated: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 900px)' }, media => {
      if (!media.conditions?.animated) { surface.dataset.mode = 'poster'; return; }
      surface.dataset.mode = 'animated';
      const capacity = media.conditions.desktop ? 8 : 4;
      surface.dataset.maxCache = String(capacity);
      let target = scene.firstFrame, drawn = -1, direction = 1, raf = 0, active = true, destroyed = false;
      const draw = () => {
        raf = 0;
        surface.dataset.cacheSize = String(cache.frames.size);
        surface.dataset.activeLoads = String(cache.loading.size);
        const image = cache.get(target);
        if (!image || drawn === target || destroyed) return;
        const scale = (fit === 'cover' ? Math.max : Math.min)(surface.width / scene.width, surface.height / scene.height);
        const width = scene.width * scale, height = scene.height * scale;
        context.clearRect(0, 0, surface.width, surface.height);
        context.drawImage(image, (surface.width - width) / 2, (surface.height - height) / 2, width, height);
        surface.style.opacity = '1';
        surface.dataset.frame = String(target);
        drawn = target;
      };
      const scheduleDraw = () => { if (!raf && !destroyed) raf = requestAnimationFrame(draw); };
      const cache = new FrameCache({ scene, capacity, onChange: scheduleDraw });
      const resize = () => {
        const rect = box.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, media.conditions?.desktop ? 1.5 : 1.25);
        surface.width = Math.round(rect.width * dpr); surface.height = Math.round(rect.height * dpr);
        drawn = -1; scheduleDraw();
      };
      const observer = new ResizeObserver(resize); observer.observe(box); resize();
      const visibility = new IntersectionObserver(entries => {
        active = entries[0].isIntersecting;
        if (active) cache.request(target, direction); else cache.suspend();
      }, { rootMargin: '200px' }); visibility.observe(element);
      const playhead = { progress: 0 };
      const update = () => {
        const frame = progressToFrame(playhead.progress, scene.firstFrame, scene.lastFrame);
        if (frame !== target) { direction = frame >= target ? 1 : -1; target = frame; }
        surface.dataset.targetFrame = String(target);
        element.style.setProperty('--scene-progress', String(playhead.progress));
        if (active) cache.request(target, direction);
        scheduleDraw();
      };
      const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: 'top top', end: () => `+=${window.innerHeight * (media.conditions?.desktop ? 1.05 : .65)}`, pin: true, scrub: .35, anticipatePin: 1, invalidateOnRefresh: true } });
      timeline.to(playhead, { progress: 1, duration: 1, ease: 'none', onUpdate: update }, 0);
      timeline.to('.hero-copy', { y: -24, opacity: .42, duration: .5, ease: 'none' }, .5);
      timeline.to('.sequence-note', { opacity: 1, y: 0, duration: .25 }, .65);
      update();
      return () => { destroyed = true; cache.dispose(); observer.disconnect(); visibility.disconnect(); if (raf) cancelAnimationFrame(raf); surface.style.opacity = '0'; };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [scene.id, scene.firstFrame, scene.lastFrame, fit], revertOnUpdate: true });
  return <section ref={root} className="hero" aria-labelledby={headingId}>
    <div className="hero-grid" aria-hidden="true"/>
    <div ref={stage} className="sequence-stage" aria-hidden="true">
      <img className="sequence-poster" src={scene.poster} alt="" width={scene.width} height={scene.height} fetchPriority="high" />
      <canvas ref={canvas} className="sequence-canvas" data-sequence={scene.id}/>
    </div>
    {children}
  </section>;
}
