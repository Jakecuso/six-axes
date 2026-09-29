// Renders content.js into index.html. No dependencies: run `node build.mjs`.
import { readFileSync, writeFileSync } from "node:fs";
import { meta, phases } from "./content.js";

const img = JSON.parse(readFileSync("./tools/image-manifest.json", "utf8"));

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const pad = (n) => String(n).padStart(2, "0");

// [text](url) -> anchor. External links get the usual rel hygiene.
const rich = (s) => esc(s).replace(
  /\[([^\]]+)\]\(([^)]+)\)/g,
  (_, text, href) => {
    const ext = /^https?:/.test(href);
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
  });

function figure(slug, { lead = false, eager = false } = {}) {
  const m = img[slug];
  if (!m) throw new Error(`no processed image for "${slug}" — run tools/prepare-images.py`);
  const big = m.sizes["1600"], small = m.sizes["800"] ?? m.sizes["1600"];
  // Small assets (the logo, the 589px kinematics screenshot) have identical
  // renditions; a srcset there would just make the browser guess.
  const srcset = big.w === small.w ? "" :
    ` srcset="assets/img/${small.file} ${small.w}w, assets/img/${big.file} ${big.w}w"` +
    ` sizes="(max-width: 1000px) 100vw, 640px"`;
  return `<figure class="shot${lead ? " shot--lead" : ""}">
<div class="shot__frame"><img src="assets/img/${big.file}"${srcset}
 width="${big.w}" height="${big.h}" alt="${esc(m.alt)}"
 loading="${eager ? "eager" : "lazy"}" decoding="async"></div>${
   m.caption ? `\n<figcaption>${esc(m.caption)}</figcaption>` : ""}
</figure>`;
}

function block(b) {
  if (typeof b === "string") return `<p>${rich(b)}</p>`;
  if (b.list) return `<ol class="findings">${
    b.list.map((x) => `<li>${rich(x)}</li>`).join("")}</ol>`;
  if (b.commands) return `<ul class="commands">${
    b.commands.map((x) => `<li><q>${esc(x)}</q></li>`).join("")}</ul>`;
  if (b.tools) return `<figure class="tools">
<ul>${b.tools.map((t) =>
  `<li><span class="tools__name">${esc(t.name)}</span>` +
  `<span class="tools__role">${esc(t.role)}</span></li>`).join("")}</ul>
<figcaption>${esc(b.question)}</figcaption>
</figure>`;
  throw new Error(`unknown block: ${JSON.stringify(b)}`);
}

function phaseHtml(p) {
  const n = pad(p.n);
  const cls = ["phase", p.redline && "phase--redline", p.unfinished && "phase--open"]
    .filter(Boolean).join(" ");
  const shots = p.images.map((s, i) => figure(s, { lead: !p.gallery && i === 0 }));
  const media = p.gallery
    ? `<div class="gallery">${shots.join("\n")}</div>`
    : shots.join("\n");
  const paper = p.paper ? `
<a class="paper" href="${p.paper.href}" target="_blank" rel="noopener">
<span class="paper__label">Read the paper</span>
<span class="paper__title">${esc(p.paper.title)}</span>
<span class="paper__meta">PDF &middot; 7 pages</span></a>` : "";

  return `<section id="phase-${n}" class="${cls}" aria-labelledby="h-${n}">
<div class="phase__head">
<p class="phase__num"><span class="phase__word">Phase</span> ${n}</p>
<h2 id="h-${n}">${esc(p.title)}</h2>
<p class="phase__summary">${esc(p.summary)}</p>
</div>
<div class="phase__body">
${p.body.map(block).join("\n")}${paper}
${media}
</div>
</section>`;
}

const railHtml = phases.map((p) => {
  const n = pad(p.n);
  return `<li><a href="#phase-${n}"><span class="rail__n">${n}</span>` +
         `<span class="rail__t">${esc(p.title)}</span></a></li>`;
}).join("\n");

const bodyHtml = phases.map((p) => {
  const section = phaseHtml(p);
  return p.quote
    ? `${section}\n<aside class="pull"><blockquote><p>${esc(p.quote)}</p></blockquote></aside>`
    : section;
}).join("\n\n");

const hero = img[meta.hero].sizes["1600"];
const heroSmall = img[meta.hero].sizes["800"];

const html = `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)} &mdash; ${esc(meta.byline)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="author" content="${esc(meta.byline)}">
<meta name="theme-color" content="#0b1622">
<link rel="canonical" href="${meta.url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(meta.title)} &mdash; ${esc(meta.tagline)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${meta.url}">
<meta property="og:image" content="${meta.url}assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/plex-cond-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/plex-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
<script>document.documentElement.className="js";</script>
</head>
<body>
<a class="skip" href="#phase-01">Skip to Phase 01</a>

<div class="bar" aria-hidden="true"><span class="bar__fill"></span><span class="bar__label"></span></div>

<header class="hero">
<div class="hero__media">
<img src="assets/img/${hero.file}"
 srcset="assets/img/${heroSmall.file} ${heroSmall.w}w, assets/img/${hero.file} ${hero.w}w"
 sizes="100vw" width="${hero.w}" height="${hero.h}"
 alt="${esc(img[meta.hero].alt)}" fetchpriority="high" decoding="async">
</div>
<div class="hero__inner">
<h1>${esc(meta.title)}</h1>
<p class="hero__tagline">${esc(meta.tagline)}</p>
</div>
<dl class="titleblock">
<div><dt>Drawn by</dt><dd>${esc(meta.byline)}</dd></div>
<div><dt>Practice</dt><dd>${esc(meta.org)}</dd></div>
<div><dt>Location</dt><dd>${esc(meta.location)}</dd></div>
<div><dt>Sheets</dt><dd>${phases.length}</dd></div>
</dl>
<p class="hero__scroll"><a href="#phase-01">Scroll.</a></p>
</header>

<nav class="rail" aria-label="Phases">
<ol>
${railHtml}
</ol>
</nav>

<main id="main">
${bodyHtml}
</main>

<footer class="end" id="contact">
<div class="end__inner">
<h2>Let's talk</h2>
<p class="end__org">${esc(meta.org)}<br><span>${esc(meta.location)}</span></p>
<ul class="end__links">
${meta.links.map((l) => {
  const ext = /^https?:/.test(l.href);
  return `<li><a href="${l.href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a></li>`;
}).join("\n")}
</ul>
${figure(meta.logo)}
</div>
</footer>

<script type="module" src="assets/js/site.js"></script>
</body>
</html>
`;

writeFileSync("index.html", html);
const used = new Set([meta.hero, meta.logo, ...phases.flatMap((p) => p.images)]);
const unused = Object.keys(img).filter((s) => !used.has(s));
console.log(`index.html written: ${phases.length} phases, ${used.size} images, ${(html.length / 1024).toFixed(0)} KB`);
if (unused.length) console.log(`unused images: ${unused.join(", ")}`);
