#!/usr/bin/env python3
"""Extract, encode and exhaustively verify archival/browser frame packs.

Run with .tools/frame-conversion/bin/python scripts/convert_sequences.py.
Requires ffmpeg, ffprobe, cwebp and Pillow. Never overwrites an existing pack.
Unknown color profiles deliberately require review rather than an sRGB guess.
"""
import concurrent.futures as futures
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import zlib
from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v', '.mpg', '.mpeg', '.mts', '.m2ts', '.ogv'}
REPORTS = ROOT / 'assets/sequence-reports'
PUBLIC = ROOT / 'public/sequences'
ICC = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()


def run(args):
    result = subprocess.run(list(map(str, args)), capture_output=True, check=True)
    return result.stdout


def sha(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n')


def add_icc(path):
    # Insert a PNG ancillary chunk without touching any encoded pixel data.
    data = path.read_bytes()
    payload = b'sRGB\0\0' + zlib.compress(ICC, 9)
    chunk = b'iCCP' + payload
    encoded = struct.pack('>I', len(payload)) + chunk + struct.pack('>I', zlib.crc32(chunk))
    path.write_bytes(data[:33] + encoded + data[33:])


def md5s(data):
    return [line.split(',')[-1].strip() for line in data.decode().splitlines() if not line.startswith('#') and line.strip()]


def main():
    REPORTS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    # Discover image/ recursively and loose project-root videos without moving them.
    sources = sorted(set([p for p in (ROOT / 'image').rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS]
                         + [p for p in ROOT.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS]))
    if not sources:
        raise RuntimeError('No supported source videos found')
    save(REPORTS / 'discovery.json', {'imageFolderVideos': [str(p.relative_to(ROOT)) for p in sources if p.is_relative_to(ROOT / 'image')], 'allSources': [str(p.relative_to(ROOT)) for p in sources]})
    scenes = []
    for index, source in enumerate(sources, 1):
        scene = f'scene-{index:02d}'
        report = REPORTS / scene
        report.mkdir(exist_ok=True)
        before = {'sha256': sha(source), 'sizeBytes': source.stat().st_size, 'mtimeNs': source.stat().st_mtime_ns}
        probe = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_streams', '-show_format', '-of', 'json', source]))
        save(report / 'source-probe.json', probe)
        stream = probe['streams'][0]
        # This preserves the actual discovered source's sRGB transfer/709 primaries.
        # HDR/wide-gamut sources must retain their own profile in a future extension.
        if (stream.get('color_primaries'), stream.get('color_transfer'), stream.get('color_space'), stream.get('color_range')) != ('bt709', 'iec61966-2-1', 'smpte170m', 'tv'):
            raise RuntimeError(f'{source}: unreviewed color properties; refusing an implicit color conversion')
        if stream.get('sample_aspect_ratio', '1:1') not in ('1:1', 'N/A'):
            raise RuntimeError('Non-square pixel source requires display-aspect metadata review')
        frames = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_frames', '-of', 'json', source]))['frames']
        save(report / 'source-frames.json', frames)
        count = int(stream['nb_read_frames'])
        assert len(frames) == count
        masters = ROOT / 'assets/sequence-masters' / scene
        web = PUBLIC / scene
        for folder in (masters, web):
            folder.mkdir(parents=True, exist_ok=True)
            if any(folder.iterdir()):
                raise RuntimeError(f'Refusing to overwrite existing pack: {folder}')
        vf = 'scale=iw:ih:in_color_matrix=smpte170m:in_range=tv:out_range=pc:flags=bicubic+accurate_rnd+full_chroma_int,format=rgb48be'
        command = ['ffmpeg', '-hide_banner', '-v', 'warning', '-xerror', '-n', '-noautorotate', '-i', source, '-map', '0:v:0', '-an', '-sn', '-dn', '-vf', vf, '-fps_mode', 'passthrough', '-c:v', 'png', '-pix_fmt', 'rgb48be', '-compression_level', '9', '-pred', 'mixed', '-color_range', 'pc', '-colorspace', 'rgb', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-start_number', '1', masters / 'frame_%06d.png']
        save(report / 'extraction-command.json', list(map(str, command)))
        print(f'{scene}: extracting {count} full-resolution 16-bit RGB PNGs', flush=True)
        extraction = subprocess.run(list(map(str, command)), capture_output=True, check=True)
        (report / 'extraction.log').write_bytes(extraction.stderr)
        pngs = sorted(masters.glob('*.png'))
        assert [p.name for p in pngs] == [f'frame_{i:06d}.png' for i in range(1, count + 1)]
        for p in pngs:
            add_icc(p)
        # Decode all masters back to 16-bit RGB; compare every frame to a fresh
        # decode of the video using exactly the recorded YUV->RGB conversion.
        reference = run(['ffmpeg', '-v', 'error', '-xerror', '-noautorotate', '-i', source, '-map', '0:v:0', '-vf', vf, '-fps_mode', 'passthrough', '-pix_fmt', 'rgb48be', '-f', 'framemd5', '-'])
        actual = run(['ffmpeg', '-v', 'error', '-xerror', '-framerate', stream['avg_frame_rate'], '-start_number', '1', '-i', masters / 'frame_%06d.png', '-pix_fmt', 'rgb48be', '-f', 'framemd5', '-'])
        (report / 'decoded-source-rgb48.framemd5').write_bytes(reference)
        (report / 'decoded-masters-rgb48.framemd5').write_bytes(actual)
        assert len(md5s(reference)) == count and md5s(reference) == md5s(actual), 'Master pixels differ from decoded reference'
        print(f'{scene}: all PNG pixels verified; encoding WebP (-lossless -z 9 -m 6 -q 100 -exact)', flush=True)

        def encode(p):
            target = web / (p.stem + '.webp')
            result = subprocess.run(['cwebp', '-quiet', '-z', '9', '-lossless', '-m', '6', '-q', '100', '-exact', '-metadata', 'all', str(p), '-o', str(target)], capture_output=True, check=True)
            (report / (p.stem + '.webp.log')).write_bytes(result.stderr)
            with Image.open(p) as master, Image.open(target) as browser:
                master.load()
                browser.load()
                assert master.size == browser.size == (stream['width'], stream['height'])
                assert master.convert('RGB').tobytes() == browser.convert('RGB').tobytes(), f'WebP mismatch: {target}'
                assert browser.info.get('icc_profile') == ICC, 'ICC missing'
            raw = target.read_bytes()
            assert b'VP8L' in raw[:1000], 'WebP is not lossless'
            return {'frame': p.name, 'pngBytes': p.stat().st_size, 'webpBytes': target.stat().st_size, 'pngSha256': sha(p), 'webpSha256': sha(target)}

        results = []
        with futures.ThreadPoolExecutor(max_workers=4) as pool:
            for done, result in enumerate(pool.map(encode, pngs), 1):
                results.append(result)
                if done % 12 == 0 or done == count:
                    print(f'{scene}: {done}/{count} WebPs encoded and pixel-verified', flush=True)
        assert [p.name for p in sorted(web.glob('*.webp'))] == [f'frame_{i:06d}.webp' for i in range(1, count + 1)]
        after = {'sha256': sha(source), 'sizeBytes': source.stat().st_size, 'mtimeNs': source.stat().st_mtime_ns}
        assert before == after, 'Source changed'
        timing = [{'frame': i, 'pts': f.get('pts'), 'ptsSeconds': f.get('pts_time', f.get('best_effort_timestamp_time')), 'durationTicks': f.get('duration'), 'durationSeconds': f.get('duration_time')} for i, f in enumerate(frames, 1)]
        entry = {'id': scene, 'originalVideoFilename': source.name, 'sourcePath': str(source.relative_to(ROOT)), 'sourceSha256': before['sha256'], 'frameCount': count, 'originalFrameRate': stream['r_frame_rate'], 'averageFrameRate': stream['avg_frame_rate'], 'width': stream['width'], 'height': stream['height'], 'durationSeconds': float(stream['duration']), 'timeBase': stream['time_base'], 'startTimeSeconds': stream['start_time'], 'firstFrame': 1, 'lastFrame': count, 'frameNamingPattern': 'frame_%06d.webp', 'publicAssetPath': f'/sequences/{scene}/', 'posterPath': f'/sequences/{scene}/frame_000001.webp', 'masterPath': str(masters.relative_to(ROOT)), 'masterNamingPattern': 'frame_%06d.png', 'pngBitDepth': 16, 'webpBitDepth': 8, 'colorProfile': 'sRGB', 'originalColorProperties': {k: stream.get(k) for k in ('pix_fmt', 'bits_per_raw_sample', 'color_range', 'color_space', 'color_transfer', 'color_primaries', 'chroma_location')}, 'timing': timing, 'sizesBytes': {'png': sum(r['pngBytes'] for r in results), 'webp': sum(r['webpBytes'] for r in results)}}
        scenes.append(entry)
        save(report / 'verification.json', {'decodedFrameCount': count, 'pngFrameCount': len(pngs), 'webpFrameCount': len(results), 'allImagesReadable': True, 'allDimensionsMatch': True, 'numericOrderingContinuous': True, 'allPngPixelsMatchRgb48DecodedReference': True, 'allWebpPixelsMatch8BitPngRendition': True, 'allWebpHaveSrgbIcc': True, 'sourceBefore': before, 'sourceAfter': after, 'sourceUnchanged': True, 'sampleFrames': [1, (count + 1) // 2, count], 'files': results})
        save(PUBLIC / 'manifest.json', {'schemaVersion': 1, 'frameIndexBase': 1, 'scenes': scenes})
        print(f'{scene}: complete; {entry["sizesBytes"]}', flush=True)
    save(REPORTS / 'tool-versions.json', {name: run(command).decode().splitlines()[0] for name, command in {'ffmpeg': ['ffmpeg', '-version'], 'ffprobe': ['ffprobe', '-version'], 'cwebp': ['cwebp', '-version']}.items()})


if __name__ == '__main__':
    main()
