import data from '@/data/sequences.json';
export type Sequence = { id: string; width: number; height: number; frameCount: number; firstFrame: number; lastFrame: number; basePath: string; pattern: string; poster: string; fit: string; review: string };
export const sequences: Sequence[] = data;
export function progressToFrame(progress: number, first: number, last: number) { return first + Math.round(Math.min(1, Math.max(0, progress)) * (last - first)); }
export function framePath(scene: Sequence, frame: number) { return scene.basePath + scene.pattern.replace('%06d', String(frame).padStart(6, '0')); }
