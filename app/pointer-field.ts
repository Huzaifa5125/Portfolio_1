/** A soft light and a trailing halo; no frame loop remains running at rest. */
export function attachPointerField(
  field: HTMLElement,
  reduced: MediaQueryList,
  fine: MediaQueryList,
) {
  const glow = field.querySelector<HTMLElement>('.pointer-glow');
  const ring = field.querySelector<HTMLElement>('.pointer-ring');
  if (!glow || !ring) return () => {};
  const layers = [
    { element: glow, x: 0, y: 0, response: 180 },
    { element: ring, x: 0, y: 0, response: 65 },
  ];
  let frame = 0;
  let previousTime = 0;
  let lastMove = 0;
  let startedAt = 0;
  let active = false;
  let targetX = 0;
  let targetY = 0;

  function reset() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    active = false;
    layers.forEach(({ element }) => {
      element.style.opacity = '0';
    });
    field.classList.remove('pointer-engaged');
  }

  function draw(time: number) {
    frame = 0;
    const delta = previousTime ? Math.min(time - previousTime, 40) : 16;
    previousTime = time;
    const fadeIn = Math.min(1, (time - startedAt) / 180);
    const fadeOut = Math.max(0, 1 - Math.max(0, time - lastMove - 650) / 650);
    if (fadeOut === 0) {
      reset();
      return;
    }
    layers.forEach((layer) => {
      const ease = 1 - Math.exp(-delta / layer.response);
      layer.x += (targetX - layer.x) * ease;
      layer.y += (targetY - layer.y) * ease;
      layer.element.style.transform = `translate3d(${layer.x.toFixed(2)}px, ${layer.y.toFixed(2)}px, 0)`;
      layer.element.style.opacity = String(fadeIn * fadeOut);
    });
    frame = window.requestAnimationFrame(draw);
  }

  function move(event: PointerEvent) {
    if (
      reduced.matches ||
      !fine.matches ||
      document.hidden ||
      event.pointerType === 'touch'
    )
      return;
    const target = event.target as Element | null;
    const interactive = Boolean(
      target?.closest?.('a, button, [role="button"]'),
    );
    if (interactive) field.classList.add('pointer-engaged');
    else field.classList.remove('pointer-engaged');
    if (active && targetX === event.clientX && targetY === event.clientY)
      return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!active) {
      startedAt = window.performance.now();
      layers.forEach((layer) => {
        layer.x = targetX;
        layer.y = targetY;
      });
    }
    active = true;
    lastMove = window.performance.now();
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  function visibility() {
    if (document.hidden) reset();
  }
  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  // Scrolling can move a different target under the pointer; clear hover state.
  window.addEventListener('scroll', reset, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  return () => {
    reset();
    window.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', reset);
    window.removeEventListener('pointercancel', reset);
    window.removeEventListener('blur', reset);
    window.removeEventListener('scroll', reset);
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', reset);
    fine.removeEventListener('change', reset);
  };
}
