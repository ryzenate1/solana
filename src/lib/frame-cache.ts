import { framePath, type Sequence } from './sequences';
type Frame = { image: CanvasImageSource; close: () => void };
type Options = { scene: Sequence; capacity: number; onChange: () => void };

/** Small direction-aware decode window. No React renders or unbounded downloads. */
export class FrameCache {
  readonly frames = new Map<number, Frame>();
  readonly loading = new Map<number, AbortController>();
  private failures = new Map<number, number>();
  private wanted: number[] = [];
  private stopped = false;
  target: number;
  constructor(private options: Options) { this.target = options.scene.firstFrame; }
  request(target: number, direction: number) {
    if (this.stopped) return;
    this.target = target;
    const { scene, capacity } = this.options;
    const candidates = [target];
    for (let i = 1; i <= capacity; i++) candidates.push(target + i * direction, target - i * direction);
    this.wanted = [...new Set(candidates)].filter(n => n >= scene.firstFrame && n <= scene.lastFrame).slice(0, capacity);
    for (const [n, controller] of this.loading) if (!this.wanted.includes(n)) controller.abort();
    this.evict(); this.pump();
  }
  private evict() {
    for (const [n, frame] of this.frames) if (!this.wanted.includes(n)) { frame.close(); this.frames.delete(n); }
  }
  private pump() {
    if (this.stopped) return;
    while (this.loading.size < 2) {
      const next = this.wanted.find(n => !this.frames.has(n) && !this.loading.has(n) && (this.failures.get(n) ?? 0) < 2);
      if (next === undefined) break;
      const controller = new AbortController();
      this.loading.set(next, controller);
      void this.load(next, controller);
    }
  }
  private async load(n: number, controller: AbortController) {
    try {
      const response = await fetch(framePath(this.options.scene, n), { signal: controller.signal, cache: 'force-cache' });
      if (!response.ok) throw new Error(`Frame ${n}: ${response.status}`);
      const blob = await response.blob();
      let frame: Frame;
      if ('createImageBitmap' in window) {
        const bitmap = await createImageBitmap(blob);
        frame = { image: bitmap, close: () => bitmap.close() };
      } else {
        const url = URL.createObjectURL(blob);
        const image = new Image(); image.src = url;
        try { await image.decode(); } catch (error) { URL.revokeObjectURL(url); throw error; }
        frame = { image, close: () => { image.src = ''; URL.revokeObjectURL(url); } };
      }
      if (this.stopped || controller.signal.aborted || !this.wanted.includes(n)) frame.close();
      else this.frames.set(n, frame);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) this.failures.set(n, (this.failures.get(n) ?? 0) + 1);
    } finally {
      this.loading.delete(n);
      if (!this.stopped) { this.options.onChange(); this.pump(); }
    }
  }
  get(n: number) { return this.frames.get(n)?.image; }
  suspend() { this.wanted = []; for (const c of this.loading.values()) c.abort(); for (const f of this.frames.values()) f.close(); this.frames.clear(); }
  dispose() { this.stopped = true; this.suspend(); }
}
