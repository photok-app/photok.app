// Scroll-based reveal for sections
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.feature-card, .download-badges, .privacy-text, .opensource-text, .opensource-graphic').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Inject reveal CSS dynamically so it degrades gracefully without JS
const style = document.createElement('style');
style.textContent = `
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .feature-card.reveal { transition-delay: calc(var(--card-index, 0) * 0.06s); }
`;
document.head.appendChild(style);

// Stagger feature cards
document.querySelectorAll('.feature-card').forEach((card, i) => {
  card.style.setProperty('--card-index', i);
});

const mosaic = document.querySelector('.mosaic');
if (mosaic) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const friction = 4;
  const baseSpeed = reduceMotion ? 0 : 18;

  const columns = [...mosaic.querySelectorAll('.mosaic-col')].map((col, i) => {
    const state = {
      col,
      track: col.querySelector('.mosaic-track'),
      speed: col.classList.contains('mosaic-col--down') ? baseSpeed : -baseSpeed,
      anchorOffset: 0,
      anchorTime: performance.now() / 1000,
      releaseVelocity: 0,
      drag: null,
    };
    state.speed *= [1, 0.9, 1.1][i % 3];
    return state;
  });

  const offsetAt = (c, t) => {
    if (c.drag) return c.drag.offset;
    const elapsed = Math.max(0, t - c.anchorTime);
    const decay = (c.releaseVelocity / friction) * (1 - Math.exp(-friction * elapsed));
    return c.anchorOffset + c.speed * elapsed + decay;
  };

  columns.forEach((c) => {
    c.col.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      c.col.setPointerCapture(e.pointerId);
      const now = performance.now() / 1000;
      const offset = offsetAt(c, now);
      c.drag = { startY: e.clientY, startOffset: offset, offset, samples: [{ t: now, y: e.clientY }] };
      c.col.classList.add('is-dragging');
    });
    c.col.addEventListener('pointermove', (e) => {
      if (!c.drag) return;
      const now = performance.now() / 1000;
      c.drag.offset = c.drag.startOffset + (e.clientY - c.drag.startY);
      c.drag.samples.push({ t: now, y: e.clientY });
      c.drag.samples = c.drag.samples.filter((s) => now - s.t < 0.1);
    });
    const release = () => {
      if (!c.drag) return;
      const now = performance.now() / 1000;
      const samples = c.drag.samples.filter((s) => now - s.t < 0.1);
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last && first ? last.t - first.t : 0;
      c.releaseVelocity = dt > 0.01 ? (last.y - first.y) / dt : 0;
      c.anchorOffset = c.drag.offset;
      c.anchorTime = now;
      c.drag = null;
      c.col.classList.remove('is-dragging');
    };
    c.col.addEventListener('pointerup', release);
    c.col.addEventListener('pointercancel', release);
  });

  let frame = null;
  const render = () => {
    const t = performance.now() / 1000;
    columns.forEach((c) => {
      const period = c.track.offsetHeight / 2;
      if (!period) return;
      const offset = offsetAt(c, t);
      const shift = ((offset % period) + period) % period;
      c.track.style.transform = `translate3d(0, ${shift - period}px, 0)`;
    });
    frame = requestAnimationFrame(render);
  };

  mosaic.classList.add('mosaic--js');
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && frame === null) {
      frame = requestAnimationFrame(render);
    } else if (!entry.isIntersecting && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }).observe(mosaic);
}
