#!/usr/bin/env python3
"""Render the three figures Phase 16 uses out of the paper PDF.

These do not come from the photo pool, so they are not in images.json. Run after
prepare-images.py, which writes the manifest this appends to.

Needs poppler's pdftoppm on PATH.  Run:  python3 tools/paper-figures.py
"""
import json, os, subprocess, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "assets", "docs", "how-much-does-depth-matter.pdf")
OUT = os.path.join(ROOT, "assets", "img")
BUDGET = {1600: 300 * 1024, 800: 90 * 1024}
QUALITY_STEPS = [82, 76, 70, 64, 58, 52]

# slug -> (page, crop box at 200dpi or None for the whole page, alt, caption)
FIGURES = {
    "p16-paper-cover": (1, None,
        "First page of the paper: How Much Does Depth Matter? An Input-Modality "
        "Ablation Study of Lightweight Convolutional Grasp Detection on the "
        "Cornell Grasping Dataset",
        "Seven pages and fifteen training runs. Every number in it comes back\n        out of a script."),
    "p16-accuracy": (4, (105, 615, 845, 1180),
        "Bar chart of mean grasp detection accuracy by input modality: depth-only "
        "92.3 percent, RGB-only 91.5 percent, fused RGB-D 90.8 percent, with "
        "cross-validation error bars",
        "Depth 92.3%, RGB 91.5%, RGB-D 90.8%. Same training budget for all three, "
        "and the gaps are not statistically significant."),
    "p16-grasp": (5, (130, 145, 1575, 1050),
        "Qualitative RGB-D predictions for three objects: the RGB input, the "
        "predicted quality, angle and width maps, and the resulting grasp rectangle",
        "RGB in, grasp rectangle out."),
}

def main():
    manifest = json.load(open(os.path.join(ROOT, "tools", "image-manifest.json")))
    with tempfile.TemporaryDirectory() as tmp:
        for slug, (page, box, alt, caption) in FIGURES.items():
            subprocess.run(["pdftoppm", "-png", "-r", "200", "-f", str(page),
                            "-l", str(page), PDF, f"{tmp}/{slug}"], check=True)
            src = next(f for f in os.listdir(tmp) if f.startswith(slug))
            im = Image.open(os.path.join(tmp, src)).convert("RGB")
            if box:
                im = im.crop(box)
            entry = {"alt": alt, "caption": caption, "sizes": {}}
            for w in (1600, 800):
                t = min(w, im.width)
                # Skip a second rendition identical to the first; build.mjs
                # omits srcset for these anyway.
                if any(v["w"] == t for v in entry["sizes"].values()):
                    continue
                r = im if t == im.width else im.resize(
                    (t, round(im.height * t / im.width)), Image.LANCZOS)
                name = f"{slug}-{w}.webp"
                path = os.path.join(OUT, name)
                for q in QUALITY_STEPS:
                    r.save(path, "WEBP", quality=q, method=6)
                    if os.path.getsize(path) <= BUDGET[w]:
                        break
                entry["sizes"][str(w)] = {"file": name, "w": r.width, "h": r.height}
            big = entry["sizes"]["1600"]
            entry["w"], entry["h"] = big["w"], big["h"]
            manifest[slug] = entry
            print(f"{slug:18s} {big['w']}x{big['h']}")
    json.dump(manifest, open(os.path.join(ROOT, "tools", "image-manifest.json"), "w"),
              indent=1, sort_keys=True)

if __name__ == "__main__":
    main()
