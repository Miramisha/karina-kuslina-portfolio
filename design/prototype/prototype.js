(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const card = document.querySelector('.system-card');
  const replay = document.querySelector('[data-replay]');
  const message = document.querySelector('.system-message');
  const nodes = [...document.querySelectorAll('[data-node]')];
  let timers = [];
  let running = false;
  const clearRun = () => {
    timers.forEach(clearTimeout);
    timers = [];
    nodes.forEach(node => node.classList.remove('is-active'));
    card.classList.remove('is-running');
    running = false;
    replay.disabled = false;
  };
  function playRequest() {
    if (running) return;
    clearRun();
    if (motion.matches) {
      message.textContent = 'Интерфейс → API → Данные → Ответ';
      return;
    }
    running = true;
    replay.disabled = true;
    message.textContent = 'Запрос проходит через систему…';
    card.classList.add('is-running');
    nodes.forEach((node, index) => {
      timers.push(setTimeout(() => {
        nodes.forEach(item => item.classList.remove('is-active'));
        node.classList.add('is-active');
      }, index * 540));
    });
    timers.push(setTimeout(() => {
      clearRun();
      message.textContent = 'Ответ получен. Система работает.';
    }, 1800));
  }
  replay.addEventListener('click', playRequest);
  const animations = new Set();
  function reveal(element, delay = 0) {
    if (motion.matches || !element.animate) return;
    const animation = element.animate([
      {opacity: 0, transform: 'translateY(22px)'},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 650, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
  }
  document.querySelectorAll('.hero-copy .entrance').forEach((element, index) => reveal(element, index * 65));
  reveal(card, 180);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    const demoObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        playRequest();
        demoObserver.disconnect();
      }
    }, {threshold: 0.5});
    demoObserver.observe(card);
  }
  motion.addEventListener('change', () => {
    if (motion.matches) {
      clearRun();
      animations.forEach(animation => animation.cancel());
      message.textContent = 'Интерфейс → API → Данные → Ответ';
    }
  });
  const progress = document.querySelector('.page-progress');
  let scheduled = false;
  function updateProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateProgress);
    }
  }, {passive: true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();

// Decorative portrait motion is local, pausable and respects reduced motion.
(() => {
  const scene = document.querySelector('[data-portrait]');
  const toggle = document.querySelector('[data-motion-toggle]');
  if (!scene || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  function sync() {
    const stopped = paused || reduced.matches;
    document.body.classList.toggle('motion-paused', stopped);
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.disabled = reduced.matches;
    toggle.textContent = reduced.matches ? 'Движение отключено в настройках' : paused ? 'Включить анимацию ▷' : 'Пауза анимации Ⅱ';
    if (stopped) resetTilt();
  }
  function resetTilt() {
    scene.style.setProperty('--portrait-rx', '0deg');
    scene.style.setProperty('--portrait-ry', '0deg');
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  scene.addEventListener('pointermove', event => {
    if (paused || reduced.matches || !fine.matches) return;
    const rect = scene.getBoundingClientRect();
    scene.style.setProperty('--portrait-rx', `${(0.5 - (event.clientY - rect.top) / rect.height) * 5}deg`);
    scene.style.setProperty('--portrait-ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 6}deg`);
  });
  scene.addEventListener('pointerleave', resetTilt);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      document.body.classList.toggle('motion-offscreen', !entries[0].isIntersecting);
    }).observe(scene);
  }
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-hidden', document.hidden);
  });
  sync();
})();

// Deterministic curved trails: the same scroll position always produces the same frame.
(() => {
  const canvas = document.querySelector('[data-comet-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const flights = [
    {start: 0.01, end: 0.43, side: 1, size: 1},
    {start: 0.29, end: 0.76, side: -1, size: 0.85},
    {start: 0.66, end: 1.06, side: 1, size: 0.7}
  ];
  let width = 0, height = 0, frame = 0;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    schedule();
  }
  function point(t, side) {
    const travel = Math.min(340, width * 0.28);
    const x = -35 + travel * (0.42 * t + 0.58 * t * t);
    return {x: side === 1 ? x : width - x, y: -160 + t * (height + 360)};
  }
  function draw() {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    if (reduced.matches || document.body.classList.contains('motion-paused')) return;
    const range = document.documentElement.scrollHeight - height;
    const scroll = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
    flights.forEach((flight, index) => {
      if (width < 520 && index === 2) return;
      const t = (scroll - flight.start) / (flight.end - flight.start);
      if (t <= 0 || t >= 1) return;
      const fade = Math.min(1, t / 0.1, (1 - t) / 0.12);
      const scale = flight.size * (width < 520 ? 0.72 : 1);
      const length = (width < 520 ? 150 : 230) / (height + 360);
      ctx.save();
      ctx.globalAlpha = fade * 0.78;
      ctx.lineCap = 'round';
      // A tapered amber plume, followed by a thinner luminous core.
      for (const soft of [true, false]) {
        ctx.shadowBlur = soft ? 14 * scale : 0;
        ctx.shadowColor = 'rgba(255,163,68,0.8)';
        for (let i = 0; i < 42; i++) {
          const a = i / 42, b = (i + 1) / 42;
          const from = point(t - length * (1 - a), flight.side);
          const to = point(t - length * (1 - b), flight.side);
          ctx.strokeStyle = `rgba(255,${Math.round(155 + b * 67)},${Math.round(62 + b * 115)},${b * b * (soft ? 0.22 : 0.8)})`;
          ctx.lineWidth = (soft ? 9 : 2.6) * scale * b + 0.12;
          ctx.beginPath();ctx.moveTo(from.x, from.y);ctx.lineTo(to.x, to.y);ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
      // Small fragments sit along the past trajectory, preserving reverse playback.
      for (let i = 1; i <= 10; i++) {
        const lag = length * (0.13 + i * 0.085);
        const p = point(t - lag, flight.side);
        const spread = Math.sin(i * 2.4) * (5 + i * 1.4) * scale;
        const alpha = (1 - i / 12) * 0.6;
        ctx.fillStyle = `rgba(255,197,120,${alpha})`;
        ctx.beginPath();ctx.arc(p.x + spread,p.y + Math.cos(i * 1.8) * 5,Math.max(.45,(1.6 - i * .1) * scale),0,Math.PI * 2);ctx.fill();
      }
      const head = point(t, flight.side);
      const halo = ctx.createRadialGradient(head.x,head.y,0,head.x,head.y,24 * scale);
      halo.addColorStop(0,'rgba(255,237,203,0.9)');
      halo.addColorStop(.15,'rgba(255,184,88,0.55)');
      halo.addColorStop(.45,'rgba(255,157,51,0.15)');
      halo.addColorStop(1,'rgba(255,157,51,0)');
      ctx.fillStyle = halo;ctx.beginPath();ctx.arc(head.x,head.y,24 * scale,0,Math.PI * 2);ctx.fill();
      ctx.fillStyle = '#fff2db';ctx.beginPath();ctx.arc(head.x,head.y,2.6 * scale,0,Math.PI * 2);ctx.fill();
      ctx.restore();
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',resize);
  reduced.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  resize();
})();
