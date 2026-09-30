#!/usr/bin/env python3
"""
Derive the brand logo assets from the source JPEG.

Usage:
    /tmp/logoenv/bin/pip install Pillow      # Pillow is not a project dependency
    python3 scripts/build-logo-assets.py /path/to/ellicott-logo.jpeg

Writes into public/images/:
    logo-full.png          full lockup (car/plane/tower + wordmark)
    logo-mark.png          graphic only, above the wordmark
    favicon.png            the mark, centred on a 512x512 transparent canvas
    apple-touch-icon.png   same as favicon.png

Why the background is removed with a BORDER FLOOD FILL
-----------------------------------------------------
The source is a JPEG on a flat white background, so a naive global
"white -> transparent" pass is tempting. It is wrong here: the car has white
paint highlights, a white windscreen and a light swoosh. A global pass punches
visible holes through the vehicle. Flooding inward from the border only clears
pixels that are actually connected to the outside, so interior whites survive.

The wordmark is dark navy, which is why the logo is placed on a white plate
rather than directly on a `bg-brand-gradient` band — see AGENTS.md.
"""

import os
import sys
from collections import deque

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'public', 'images'))

# Content bounds and the ink gap above the wordmark, measured from the source.
# Re-measure if the artwork is replaced.
FULL_BOX = (47, 24, 577, 369)
MARK_BOX = (47, 24, 577, 249)


def make_transparent(img, tol=238):
    """Clear the near-white background by flooding in from the border."""
    img = img.convert('RGBA')
    px = img.load()
    W, H = img.size
    seen = [[False] * W for _ in range(H)]
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        if r < tol or g < tol or b < tol:
            continue  # a real pixel — stop, keep it
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx]:
                seen[ny][nx] = True
                q.append((nx, ny))
    return img


def trim(img, pad=6):
    bbox = img.getchannel('A').getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    W, H = img.size
    return img.crop((max(0, l - pad), max(0, t - pad), min(W, r + pad), min(H, b + pad)))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
        '~/Downloads/ellicott-logo.jpeg')
    if not os.path.exists(src):
        sys.exit(f'source not found: {src}')
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(src).convert('RGB')

    full = trim(make_transparent(im.crop(FULL_BOX)))
    full.save(os.path.join(OUT, 'logo-full.png'))
    print('logo-full.png', full.size, 'aspect', round(full.size[0] / full.size[1], 2))

    mark = trim(make_transparent(im.crop(MARK_BOX)))
    mark.save(os.path.join(OUT, 'logo-mark.png'))
    print('logo-mark.png', mark.size, 'aspect', round(mark.size[0] / mark.size[1], 2))

    S, pad = 512, int(512 * 0.10)
    scale = (S - pad * 2) / max(mark.size)
    nm = mark.resize((int(mark.size[0] * scale), int(mark.size[1] * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    canvas.paste(nm, ((S - nm.size[0]) // 2, (S - nm.size[1]) // 2), nm)
    canvas.save(os.path.join(OUT, 'favicon.png'))
    canvas.save(os.path.join(OUT, 'apple-touch-icon.png'))
    print('favicon.png / apple-touch-icon.png', canvas.size)


if __name__ == '__main__':
    main()
