# Conversion completion report

One video discovered: `video.mp4` in the project root. `image/` was empty.

- Scene: `scene-01`
- Source: H.264 High, 1920 × 1080, progressive, 24/1 fps, 8 seconds.
- Source pixel format: 8-bit yuv420p; TV range; SMPTE 170M matrix;
  BT.709 primaries; sRGB transfer; left chroma location.
- Decoded source frames / PNGs / WebPs: **192 / 192 / 192**.
- PNG masters: `assets/sequence-masters/scene-01/`, 16-bit RGB,
  1,260,592,913 bytes (1202.20 MiB).
- Lossless WebPs: `public/sequences/scene-01/`, 8-bit RGB,
  282,680,572 bytes (269.59 MiB).
- Combined frame assets: 1,543,273,485 bytes
  (1471.78 MiB).
- Manifest: `public/sequences/manifest.json`, including all original PTS values.
- Every PNG decoded and matched a fresh 16-bit RGB video decode.
- Every WebP decoded and matched the master's 8-bit rendition exactly.
- All dimensions, frame counts, numeric ordering and ICC profiles passed.
- First, middle and final PNGs inspected visually; representative files verified.
- Source SHA-256, size and modification time unchanged.
- Source SHA-256: `a09541f275e1c6ab29acb153cc26661dbc0080687e009a7540e48329aca42550`.
- Conversion errors: none. Extraction log empty.

WebP cannot preserve the full 16-bit master precision. PNGs remain local, outside
`public/`, with Git and Vercel exclusions. Original compressed footage is retained.
The source has baked-in garbled labels and distorted component geometry, preserved
without retouching; see `SEQUENCES.md` and `visual-review.json`.

Frame packs and timing manifest are technically ready for GSAP/Canvas scroll
animation. The website has not been implemented, per the extraction-only scope.
