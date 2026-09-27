// Reveals, rail tracking and the mobile progress strip.
// Everything here is progressive: with JS off, content.js output is already
// fully visible and the rail links are ordinary anchors.

const phases = [...document.querySelectorAll(".phase")];
const reveal = [...phases, ...document.querySelectorAll(".pull")];
const railItems = [...document.querySelectorAll(".rail li")];
const fill = document.querySelector(".bar__fill");
const label = document.querySelector(".bar__label");
const motionOK = !matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal once, then stop watching: nothing here should re-animate on scroll back.
if (motionOK && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  reveal.forEach((el) => io.observe(el));
} else {
  reveal.forEach((el) => el.classList.add("is-in"));
}

// Which phase is being read: the last one whose head has passed the marker.
let current = -1;
function track() {
  const marker = innerHeight * 0.38;
  let next = -1;
  for (let i = 0; i < phases.length; i++) {
    if (phases[i].getBoundingClientRect().top <= marker) next = i;
    else break;
  }
  if (next !== current) {
    current = next;
    railItems.forEach((li, i) => li.classList.toggle("is-current", i === current));
    if (label) {
      label.textContent = current < 0
        ? ""
        : `${String(current + 1).padStart(2, "0")} / ${phases.length}  ${phases[current].querySelector("h2").textContent}`;
    }
  }
  if (fill) {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.width = `${max > 0 ? Math.min(1, scrollY / max) * 100 : 0}%`;
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { track(); ticking = false; });
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll, { passive: true });
track();
