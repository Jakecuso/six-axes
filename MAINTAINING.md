# Maintaining the site

## Changing the writing

Everything on the page comes from `content.js`. Edit it, then:

```sh
node build.mjs
```

That rewrites `index.html`. Commit both and push. GitHub Pages serves the branch
directly, so nothing builds on their side and there is nothing to install.

## Adding your LinkedIn or a resume

`meta.links` at the top of `content.js` has commented-out slots for both. For the
resume, put the PDF in `assets/docs/` and point the link at it.

## Adding video to Phases 14 and 15

Both are stills-only. To add a YouTube embed, give the phase an `embed` field
with the video ID and render it in `build.mjs` alongside the other block types.

## Photos

```sh
python3 tools/prepare-images.py <pool-dir>   # the 60 photos
python3 tools/paper-figures.py               # the 3 figures cut from the paper
node build.mjs
```

`tools/images.json` is the source of truth: one row per image giving its pool
index, output name, alt text, caption, and optional `rotate` / `crop`. Rotation
runs before the crop, so crop boxes are in rotated space. The script strips
metadata and writes WebP at 1600px and 800px, stepping quality down per file
until each lands under its byte budget — a flat quality made screenshots tiny and
phone photos enormous.

`tools/pool_manifest.tsv` records which original file each pool index came from.
The pool itself is rebuilt from `SIX AXES.docx` and the folders beside it; the
outputs are committed, so you only need any of this to add or replace a photo.

`tools/paper-figures.py` needs poppler's `pdftoppm` on PATH.

## Layout

```
content.js             the 18 phases, the 5 pull quotes, the footer links
build.mjs              renders content.js -> index.html
index.html             generated; committed so Pages can serve it
assets/css/site.css    all of the styling
assets/js/site.js      reveals, phase rail, mobile progress bar
assets/fonts/          IBM Plex, self-hosted, so the page makes no third-party requests
assets/img/            processed photos, og.jpg, favicon.svg
assets/docs/           the paper
tools/                 the image pipeline and its manifests
```

The page works with JavaScript off: reveals are opt-in via a `js` class set on
`<html>`, so without it everything is simply visible. `prefers-reduced-motion:
reduce` turns off the transitions and smooth scrolling.
