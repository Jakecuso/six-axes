# SIX AXES

A scroll-through account of building two six-axis robot arms: Version One, which
fell over, and VOLT, which runs vision-language-action models on local compute.

Live at **https://jakecuso.github.io/six-axes/**

## Editing it

All the writing lives in `content.js`. Change a paragraph there, then:

```sh
node build.mjs
```

That regenerates `index.html`. Commit both and push; GitHub Pages serves the
branch directly, so there is no build step on their side and nothing to install.

## Three things left to fill in

1. **LinkedIn.** `content.js` → `meta.links` has a commented-out entry. Drop your
   URL in and uncomment it. It was left out rather than guessed, because several
   other Jake Mancusos came up in search.
2. **Resume.** Put the PDF in `assets/docs/` and add a `meta.links` entry
   pointing at it.
3. **Video for Phases 14 and 15.** Both are stills-only for now. If you upload
   the voice demos and a failed-grasp recovery clip, add an `embed` field with a
   YouTube ID to those phases and a small block in `build.mjs` to render it.

## Two passages worth a second look

- **Phase 06** turns your note, *"Add a part where I designed a cyncoloid gearbox
  for weight,"* into one sentence. It says you designed a cycloidal gearbox to get
  the reduction you needed without the weight. Expand it if there is more to say.
- **Phase 02** was titled "Four Tools, All at Once" but your own summary and body
  name three (Fusion 360, MATLAB, Blender). The heading now says three. If there
  was a fourth, put it back.

Phase 16's sentence about KUKA was cut, as agreed, since the relationship could
not be described accurately. The rest of that phase stands on the paper.

## Photos

`tools/prepare-images.py` reads the originals (the images embedded in
`SIX AXES.docx`, plus the `first arm/`, `volt OL/`, `inmoov/` and `Jayache/`
folders on the Desktop), deduplicates them by hash, strips metadata, and writes
WebP at 1600px and 800px into `assets/img/`. Quality steps down per file until
each lands under a byte budget, so noisy phone photos do not blow up the repo.

`tools/images.json` maps each source image to its output name, alt text and
caption. `tools/pool_manifest.tsv` records which original file each one came
from. To re-run it you need that pool directory rebuilt; the outputs are
committed, so you only need this if you are adding or replacing photos.

Eight source photos went unused, including the Wright State graduation shot.
They are still in the Desktop folders if you want any of them in.

## Layout

```
content.js                 the 18 phases, the 5 pull quotes, the footer links
build.mjs                  renders content.js -> index.html
index.html                 generated; committed so Pages can serve it
assets/css/site.css        all of the styling
assets/js/site.js          reveals, phase rail, mobile progress bar
assets/fonts/              IBM Plex, self-hosted (no Google Fonts request)
assets/img/                processed photos + og.jpg + favicon.svg
assets/docs/               the paper
tools/                     the image pipeline and its manifests
```

The page works with JavaScript disabled: the reveal animations are opt-in via a
`js` class set on `<html>`, so without them everything is simply visible.
`prefers-reduced-motion: reduce` turns off the transitions and smooth scrolling.
