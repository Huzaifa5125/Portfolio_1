import { observeReveals } from './reveals.ts';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Position alone determines the sequence, so reversing or jumping scroll works. */
export function featuredProgress(
  top: number,
  viewport: number,
  inset: number,
  travel: number,
) {
  const approach = Math.max(1, viewport * 0.75 - inset);
  const distance = inset - top;
  return [
    clamp((approach + distance) / (approach + travel * 0.24)),
    clamp((distance / travel - 0.28) / 0.48),
  ];
}

/** Native sticky positioning pins the pair; no wheel or touch events are blocked. */
export function attachFeaturedScroll(
  track: HTMLElement,
  reduced: MediaQueryList,
) {
  const stage = track.querySelector<HTMLElement>('.featured-pin');
  const cards = Array.from(track.querySelectorAll<HTMLElement>('.project'));
  if (!stage || cards.length !== 2) return () => {};
  const desktop = window.matchMedia('(min-width: 900px)');
  const header = document.querySelector<HTMLElement>('.site-header');
  let mode: 'pinned' | 'flow' | undefined;
  let stopReveals: (() => void) | undefined;
  let frame = 0;
  let inset = 104;
  let height = 0;
  let travel = 0;
  let needsMeasure = true;
  let destroyed = false;
  // Keyboard navigation uses the ordinary document flow for the rest of this mount.
  let keyboardMode = false;

  function clearCards() {
    cards.forEach((card) => {
      ['--card-y', '--card-scale', '--card-opacity'].forEach((key) =>
        card.style.removeProperty(key),
      );
    });
  }

  function measure() {
    needsMeasure = false;
    inset = (header?.offsetHeight ?? 88) + 16;
    height = stage!.offsetHeight;
    travel = Math.round(
      Math.max(720, Math.min(1300, window.innerHeight * 1.25)),
    );
    const fits = height > 0 && height + inset + 24 <= window.innerHeight;
    const next =
      desktop.matches && !reduced.matches && !keyboardMode && fits
        ? 'pinned'
        : 'flow';

    if (next !== mode) {
      stopReveals?.();
      stopReveals = undefined;
      clearCards();
      mode = next;
      track.classList.toggle('is-pinned', next === 'pinned');
      if (next === 'flow') stopReveals = observeReveals(cards, reduced);
    }
    if (next === 'pinned') {
      track.style.setProperty('--pin-top', `${inset}px`);
      track.style.setProperty('--pin-height', `${height}px`);
      track.style.setProperty('--pin-travel', `${travel}px`);
    } else {
      ['--pin-top', '--pin-height', '--pin-travel'].forEach((key) =>
        track.style.removeProperty(key),
      );
    }
  }

  function update() {
    frame = 0;
    if (needsMeasure) measure();
    if (mode !== 'pinned') return;
    const top = track.getBoundingClientRect().top;
    const progress = featuredProgress(top, window.innerHeight, inset, travel);
    cards.forEach((card, index) => {
      // Focused content must remain visible, including programmatic focus.
      const value = card.contains(document.activeElement) ? 1 : progress[index];
      const eased = value * value * (3 - 2 * value);
      card.style.setProperty(
        '--card-y',
        `${((1 - eased) * (height + 32)).toFixed(2)}px`,
      );
      card.style.setProperty('--card-scale', String(0.965 + eased * 0.035));
      card.style.setProperty('--card-opacity', String(clamp(value * 3)));
    });
  }

  function schedule() {
    if (!frame && !destroyed && !document.hidden)
      frame = window.requestAnimationFrame(update);
  }
  function resize() {
    needsMeasure = true;
    schedule();
  }
  function keydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || keyboardMode) return;
    keyboardMode = true;
    // Remove pinning before the browser resolves the next Tab target.
    needsMeasure = true;
    window.cancelAnimationFrame(frame);
    update();
  }
  function visibility() {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else resize();
  }

  update();
  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(resize);
  observer?.observe(stage);
  if (header) observer?.observe(header);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('keydown', keydown);
  track.addEventListener('focusin', schedule);
  track.addEventListener('focusout', schedule);
  reduced.addEventListener('change', resize);
  desktop.addEventListener('change', resize);
  document.addEventListener('visibilitychange', visibility);

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    stopReveals?.();
    clearCards();
    track.classList.remove('is-pinned');
    ['--pin-top', '--pin-height', '--pin-travel'].forEach((key) =>
      track.style.removeProperty(key),
    );
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', keydown);
    track.removeEventListener('focusin', schedule);
    track.removeEventListener('focusout', schedule);
    reduced.removeEventListener('change', resize);
    desktop.removeEventListener('change', resize);
    document.removeEventListener('visibilitychange', visibility);
  };
}
