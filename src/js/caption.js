// Keep the full accessible caption and its layout while revealing visual letters.
export function initCaption() {
  const caption = document.querySelector('.portrait-frame figcaption');
  if (!caption || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const text = caption.textContent;
  const accessible = document.createElement('span');
  accessible.className = 'caption-accessible';
  accessible.textContent = text;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const letters = Array.from(text, character => {
    const letter = document.createElement('span');
    letter.textContent = character;
    letter.className = 'caption-letter';
    visual.append(letter);
    return letter;
  });
  caption.replaceChildren(accessible, visual);
  let timer;
  let index = 0;
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    observer.disconnect();
    caption.textContent = text;
    reduced.removeEventListener('change', stopIfNeeded);
    document.removeEventListener('motionchange', stopIfNeeded);
  }
  function stopIfNeeded() {
    if (reduced.matches || document.body.classList.contains('motion-paused')) finish();
  }
  function type() {
    if (finished) return;
    letters[index - 1]?.classList.remove('caption-cursor');
    if (index === letters.length) { finish(); return; }
    letters[index].classList.add('caption-visible', 'caption-cursor');
    index += 1;
    timer = setTimeout(type, 65);
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      stopIfNeeded();
      if (!finished) type();
    }
  }, {threshold: 0.6});
  reduced.addEventListener('change', stopIfNeeded);
  document.addEventListener('motionchange', stopIfNeeded);
  stopIfNeeded();
  if (!finished) observer.observe(caption);
}
