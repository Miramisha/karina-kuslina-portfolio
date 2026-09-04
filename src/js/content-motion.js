export function initContentMotion() {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const card = document.querySelector('.system-card');
  const replay = document.querySelector('[data-replay]');
  const message = document.querySelector('.system-message');
  const nodes = [...document.querySelectorAll('[data-node]')];
  if (!card || !replay || !message) return;
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
    if (motion.matches || document.body.classList.contains("motion-paused")) {
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
  const activeReveals = new WeakMap();
  function reveal(element, delay = 0) {
    if (motion.matches || document.body.classList.contains('motion-paused') || !element.animate) return;
    activeReveals.get(element)?.cancel();
    const animation = element.animate([
      {opacity: 0, transform: 'translateY(52px)'},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 1000, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
    animations.add(animation);
    activeReveals.set(element, animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
  }
  document.querySelectorAll('.hero-copy .entrance').forEach((element, index) => reveal(element, index * 65));
  reveal(card, 180);
  if ('IntersectionObserver' in window) {
    const revealed = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          revealed.delete(entry.target);
        } else if (!revealed.has(entry.target)) {
          revealed.add(entry.target);
          // Observe the stable container, animate only its contents.
          // Their transforms must not retrigger the intersection observer.
          [...entry.target.children].forEach(element => reveal(element));
        }
      });
    }, {threshold: 0, rootMargin: '60px 0px 60px 0px'});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    const demoObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        playRequest();
        demoObserver.disconnect();
      }
    }, {threshold: 0.5});
    demoObserver.observe(card);
  }
  const stopMotion = () => {
    if (motion.matches || document.body.classList.contains("motion-paused")) {
      clearRun();
      animations.forEach(animation => animation.cancel());
      message.textContent = 'Интерфейс → API → Данные → Ответ';
    }
  };
  motion.addEventListener('change', stopMotion);
  document.addEventListener('motionchange', stopMotion);
  const progress = document.querySelector('.page-progress');
  let scheduled = false;
  function updateProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
    if (!progress) return;
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
}
