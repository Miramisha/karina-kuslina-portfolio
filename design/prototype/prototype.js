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
