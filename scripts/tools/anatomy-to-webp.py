"""Convert Wiki anatomy PNGs in dist/assets/anatomy to WebP (quality 90).

The original PNG hashes stay in the image metadata modules as provenance
(`sha256`, `thumbnailSha256`); scripts/anatomy-webp.json maps each served
WebP file to its own hash and the PNG it was encoded from.

Usage: python3 scripts/tools/anatomy-to-webp.py   (requires Pillow with WebP)
"""
import hashlib, json, pathlib, re

from PIL import Image

root = pathlib.Path(__file__).resolve().parents[2]
anatomy = root / 'dist' / 'assets' / 'anatomy'
manifest_path = root / 'scripts' / 'anatomy-webp.json'
modules = ['combat-images.js', 'combat-images-expanded.js', 'enemy-images-additional.js', 'predator-hunter-images.js']
sha = lambda data: hashlib.sha256(data).hexdigest()

manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
for png in sorted(anatomy.glob('*.png')):
    webp = png.with_suffix('.webp')
    with Image.open(png) as image:
        image.save(webp, 'WEBP', quality=90, method=6)
    manifest[f'./assets/anatomy/{webp.name}'] = {'sha256': sha(webp.read_bytes()), 'sourceSha256': sha(png.read_bytes())}
manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + '\n')

for name in modules:
    module = root / 'dist' / name
    text = module.read_text(encoding='utf-8')
    module.write_text(re.sub(r'(\./assets/anatomy/[a-z-]+)\.png', r'\1.webp', text), encoding='utf-8')
print(f'{len(manifest)} WebP files; PNG originals can now be removed from dist/assets/anatomy')
