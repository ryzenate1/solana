# Solar image sequences

This repository currently contains source footage and generated frame assets only.
No website has been implemented. `image/` was empty when inspected; the discovered
source is `video.mp4` in the project root. It remains in its original location.

## Visual source review

Frames 1, 96 and 192 were inspected visually. The sequence moves from a partially
separated panel to an exploded component view and finishes with upright panels.
Labels and leader lines are baked into the footage. Many labels contain garbled
text, and the exploded view includes distorted/malformed component geometry.
These are source-content defects, not conversion defects. They have been retained
without retouching. The files are technically suitable for scroll scrubbing, but
this source needs creative review before use as premium customer-facing imagery.
No clean unlabeled sequence or authentic installation photography was found.

## Files

- `assets/sequence-masters/scene-01/frame_%06d.png`: local archival masters.
- `public/sequences/scene-01/frame_%06d.webp`: deployable lossless WebP sequence.
- `public/sequences/manifest.json`: browser-ready metadata and exact frame timing.
- `assets/sequence-reports/scene-01/`: original FFprobe data, conversion command,
  logs, decoded pixel hashes and exhaustive verification report.
- `scripts/convert_sequences.py`: reproducible extraction and verification workflow.

Frame numbers begin at **1**. Never order filenames as unpadded integers. For scroll
progress `p` clamped to `[0,1]`, use `1 + Math.round(p * (frameCount - 1))` and pad
the result to six digits. For time-based playback, use `timing[].ptsSeconds` and
the stream `timeBase`, rather than inferring frame timestamps from a rounded FPS.
PNG/WebP still files do not themselves encode playback duration; the manifest
and raw source frame report preserve this information separately.

## Fidelity and color

The source has 8-bit YUV 4:2:0 limited-range pixels, SMPTE 170M YUV matrix,
BT.709 primaries and sRGB transfer metadata. The conversion explicitly honors
the source matrix/range. A YUV-to-RGB conversion and chroma reconstruction are
required to represent this video in PNG; preserving the original compressed
video also retains the original YUV samples and metadata.

The conversion uses FFmpeg's bicubic chroma interpolation with accurate rounding
and full chroma interpolation. Width and height are unchanged. There is no FPS
filter, resizing, cropping, tone mapping, sharpening, denoising, color grading,
or artificial detail generation. `-fps_mode passthrough` outputs every decoded
frame once in presentation order. `-noautorotate` prevents an implicit transform.

Masters are **16-bit RGB PNG**, retaining additional fractional precision from
the required color conversion. This does not create new source detail or turn
the original into a 16-bit source. Each PNG carries sRGB color metadata and an
embedded sRGB ICC profile; adding that profile does not re-encode pixels.

WebP supports **8-bit channels** here. `cwebp` reads the 16-bit PNG through libpng,
reducing channels to their high 8 bits, then encodes that RGB rendition genuinely
losslessly. The exact command is recorded in the script:

```text
cwebp -z 9 -lossless -m 6 -q 100 -exact -metadata all input.png -o output.webp
```

For lossless WebP, `-q 100` controls compression effort; `-lossless` selects the
lossless codec. No near-lossless preprocessing is enabled. ICC metadata is copied.
The 16-bit PNG precision is not fully representable in WebP, so PNGs are retained.
Every WebP is checked for the VP8L lossless signature and compared pixel-for-pixel
against the master's 8-bit rendition. Every PNG is fully decoded as 16-bit RGB
and its frame hash compared against a fresh source decode using the recorded
color conversion. The report also checks dimensions, counts, ordering, ICC
profiles, and the source video's SHA-256, size and modification time.

The pipeline deliberately rejects unreviewed color profiles, non-square pixels
and existing output packs. Review HDR/wide-gamut footage before extending it;
do not silently tag such footage as sRGB. Scene IDs follow sorted source paths.
Keep the generated manifest when adding footage so existing IDs can be preserved.

## Deployment

Only `public/sequences/` is intended to be served. PNG masters are outside
`public/`, ignored by Git and excluded by `.vercelignore`, along with sources,
local tooling and archival reports. If using another deployment system, upload
the built Next.js output and required runtime files, not the entire workspace.
Do not import archival PNGs into website code.

## Reproduction

Tools used: Homebrew FFmpeg/FFprobe and libwebp `cwebp`, Python with Pillow.

```sh
brew install ffmpeg webp
uv venv .tools/frame-conversion
uv pip install --python .tools/frame-conversion/bin/python pillow==12.3.0
.tools/frame-conversion/bin/python scripts/convert_sequences.py
```

The script refuses to overwrite existing frame packs. To reproduce in a fresh
workspace, copy the original videos and script there first. It discovers supported
video extensions recursively within `image/` and directly in the project root.
All verification assertions must pass before a scene is added to the manifest.
No website build, lint or frontend checks exist yet.
