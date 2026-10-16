import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/sequences/manifest.json'), 'utf8'));
const sequences = [];
for (const scene of manifest.scenes) {
  if (scene.frameCount !== scene.timing.length) throw new Error(`Timing/count mismatch: ${scene.id}`);
  // Runtime only scrubs the opening study (scene-01 frames 1-18). Later frames
  // are retained locally but are not required for the production build and are
  // excluded from Vercel deploys via .vercelignore.
  const runtimeLast = scene.id === 'scene-01' ? 18 : scene.frameCount;
  for (let i = 1; i <= runtimeLast; i++) {
    await access(path.join(root, 'public', scene.publicAssetPath, `frame_${String(i).padStart(6, '0')}.webp`));
  }
  sequences.push({ id: scene.id, width: scene.width, height: scene.height, frameCount: scene.frameCount, firstFrame: 1, lastFrame: runtimeLast, basePath: scene.publicAssetPath, pattern: scene.frameNamingPattern, poster: scene.posterPath, fit: 'contain', review: 'Opening study selected. Later footage contains distorted geometry and baked-in garbled labels; all original assets retained.' });
}
await mkdir(path.join(root, 'src/data'), { recursive: true });
await writeFile(path.join(root, 'src/data/sequences.json'), JSON.stringify(sequences, null, 2) + '\n');
console.log(`Verified ${manifest.scenes.length} scene(s), runtime frame window present. Runtime manifest generated.`);
