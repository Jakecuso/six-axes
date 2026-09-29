#!/usr/bin/env python3
"""Resize, strip metadata and re-encode every source photo into assets/img/.

Sources are the images embedded in SIX AXES.docx plus the loose folders on the
Desktop. tools/pool_manifest.tsv records which pool index came from which file;
tools/images.json maps each pool index to an output slug, alt text and caption,
plus an optional 5th entry of transforms: {"rotate": -90, "crop": [l, t, r, b]}.
Rotation is applied first, then the crop, so crop boxes are in rotated space.

Run:  python3 tools/prepare-images.py <pool-dir>
"""
import json, os, sys, glob
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")
WIDTHS = [1600, 800]
# Per-rendition byte budgets. Photos off a phone are noisy and WebP spends a lot
# on that noise, so quality steps down until the file fits rather than being
# fixed globally -- a flat quality makes clean screenshots tiny and busy
# workbench photos enormous.
BUDGET = {1600: 300 * 1024, 800: 90 * 1024}
QUALITY_STEPS = [82, 76, 70, 64, 58, 52]


def encode(img, path, budget):
    """Write the smallest-quality WebP that lands under budget; return its size."""
    for q in QUALITY_STEPS:
        img.save(path, "WEBP", quality=q, method=6)
        size = os.path.getsize(path)
        if size <= budget:
            return size, q
    return size, QUALITY_STEPS[-1]

def main(pool):
    spec = json.load(open(os.path.join(ROOT, "tools", "images.json")))
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for idx, slug, alt, caption, *rest in spec["images"]:
        tf = rest[0] if rest else {}
        matches = glob.glob(os.path.join(pool, idx + ".*"))
        if not matches:
            sys.exit(f"pool index {idx} ({slug}) not found in {pool}")
        im = ImageOps.exif_transpose(Image.open(matches[0]))
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        im = im.convert("RGBA" if has_alpha else "RGB")
        if tf.get("rotate"):
            # Negative is clockwise, matching how you'd describe turning a photo.
            im = im.rotate(tf["rotate"], expand=True)
        if tf.get("crop"):
            im = im.crop(tuple(tf["crop"]))
        entry = {"alt": alt, "caption": caption, "w": im.width, "h": im.height, "sizes": {}}
        for w in WIDTHS:
            # Never upscale: a 589px-wide screenshot stays 589px wide. And when
            # a narrow source would give two identical renditions, only write
            # one -- build.mjs omits srcset for these, so the second is dead
            # weight in the repo.
            target = min(w, im.width)
            if any(v["w"] == target for v in entry["sizes"].values()):
                continue
            r = im if target == im.width else im.resize(
                (target, round(im.height * target / im.width)), Image.LANCZOS)
            name = f"{slug}-{w}.webp"
            size, q = encode(r, os.path.join(OUT, name), BUDGET[w])
            entry["sizes"][w] = {"file": name, "w": r.width, "h": r.height}
            if w == WIDTHS[0]:
                big_q, big_size = q, size
        # Intrinsic size for the layout is the largest rendition actually written.
        big = entry["sizes"][WIDTHS[0]]
        entry["w"], entry["h"] = big["w"], big["h"]
        manifest[slug] = entry
        print(f"{slug:26s} {big['w']:5d}x{big['h']:<5d} {big_size//1024:4d} KB  q{big_q}")
    with open(os.path.join(ROOT, "tools", "image-manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1, sort_keys=True)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"\n{len(manifest)} images, {len(os.listdir(OUT))} files, {total/1048576:.1f} MB total")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: prepare-images.py <pool-dir>"))
