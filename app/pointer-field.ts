/** A bounded particle trail disperses on idle, then releases its animation frame. */
export function attachPointerField(
  field: HTMLElement,
  reduced: MediaQueryList,
  fine: MediaQueryList,
) {
  const particles = Array.from(
    field.querySelectorAll<HTMLElement>('.pointer-dot'),
  ).map((element, index) => ({
    element,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: index * 2.399963,
    opacity: 0.9 - index / 60,
  }));
  if (!particles.length) return () => {};
  let frame = 0;
  let previousTime = 0;
  let lastMove = 0;
  let scatterStart = 0;
  let mode: 'idle' | 'follow' | 'scatter' = 'idle';
  let targetX = 0;
  let targetY = 0;

  function reset() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    mode = 'idle';
    particles.forEach((particle) => {
      particle.element.style.opacity = '0';
    });
    field.classList.remove('pointer-active');
  }

  function draw(time: number) {
    frame = 0;
    const delta = previousTime ? Math.min(time - previousTime, 40) : 16;
    previousTime = time;
    if (mode === 'follow' && time - lastMove > 160) {
      mode = 'scatter';
      scatterStart = time;
      particles.forEach((particle, index) => {
        const speed = 90 + (index % 7) * 22;
        particle.vx = Math.cos(particle.angle) * speed;
        particle.vy = Math.sin(particle.angle) * speed;
      });
    }
    const fade =
      mode === 'scatter' ? Math.min(1, (time - scatterStart) / 1100) : 0;
    if (fade === 1) {
      reset();
      return;
    }

    particles.forEach((particle, index) => {
      if (mode === 'follow') {
        const leader = particles[index - 1];
        const aimX = leader ? leader.x : targetX;
        const aimY = leader ? leader.y : targetY;
        const ease = 1 - Math.exp(-delta / (32 + index * 2.5));
        particle.x +=
          (aimX + Math.cos(particle.angle + time * 0.002) * 4 - particle.x) *
          ease;
        particle.y +=
          (aimY + Math.sin(particle.angle + time * 0.002) * 4 - particle.y) *
          ease;
      } else {
        particle.x += (particle.vx * delta) / 1000;
        particle.y += (particle.vy * delta) / 1000;
        const drag = Math.exp(-delta / 850);
        particle.vx *= drag;
        particle.vy *= drag;
      }
      particle.element.style.transform = `translate3d(${particle.x.toFixed(2)}px, ${particle.y.toFixed(2)}px, 0) scale(${1 - fade * 0.65})`;
      particle.element.style.opacity = String(
        particle.opacity * (1 - fade) ** 1.2,
      );
    });
    frame = window.requestAnimationFrame(draw);
  }

  function move(event: PointerEvent) {
    if (reduced.matches || !fine.matches || event.pointerType === 'touch')
      return;
    if (
      mode !== 'idle' &&
      targetX === event.clientX &&
      targetY === event.clientY
    )
      return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (mode === 'idle') {
      particles.forEach((particle, index) => {
        particle.x = targetX + Math.cos(particle.angle) * (5 + index * 0.8);
        particle.y = targetY + Math.sin(particle.angle) * (5 + index * 0.8);
      });
    }
    mode = 'follow';
    lastMove = window.performance.now();
    field.classList.add('pointer-active');
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  function visibility() {
    if (document.hidden) reset();
  }
  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  return () => {
    reset();
    window.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', reset);
    window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', reset);
    fine.removeEventListener('change', reset);
  };
}
