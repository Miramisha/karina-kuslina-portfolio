export function initPortrait() {
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
    document.dispatchEvent(new Event("motionchange"));
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
}
