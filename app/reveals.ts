/** Replay when an element fully leaves and re-enters the viewport. */
export function observeReveals(
  elements: HTMLElement[],
  reducedMotion: MediaQueryList,
) {
  const animations = new Map<HTMLElement, Animation>();
  const offsets = new Map<HTMLElement, number>();
  let observer: IntersectionObserver | undefined;

  function cancel(element: HTMLElement) {
    animations.get(element)?.cancel();
    animations.delete(element);
  }

  function show(element: HTMLElement) {
    cancel(element);
    element.classList.remove('reveal-pending');
    offsets.delete(element);
  }

  function configure() {
    observer?.disconnect();
    elements.forEach(show);
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            if (!element.classList.contains('reveal-pending')) return;
            const offset = offsets.get(element) ?? 22;
            const isProject = element.dataset.reveal === 'project';
            show(element);
            if (element.contains(document.activeElement)) return;
            const animation = element.animate(
              [
                {
                  opacity: 0,
                  transform: `translate3d(0, ${offset * (isProject ? 1.5 : 1)}px, 0)`,
                  scale: isProject ? '0.985' : '1',
                },
                { opacity: 1, transform: 'translate3d(0, 0, 0)', scale: '1' },
              ],
              {
                duration: isProject ? 900 : 700,
                delay: Number(element.dataset.delay ?? 0),
                easing: 'cubic-bezier(.16,1,.3,1)',
                fill: 'backwards',
              },
            );
            animations.set(element, animation);
            animation.onfinish = () => {
              if (animations.get(element) === animation)
                animations.delete(element);
            };
          } else if (!element.contains(document.activeElement)) {
            // Do not hide partially visible content near an observer boundary.
            const rect = entry.boundingClientRect;
            if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
              cancel(element);
              offsets.set(element, rect.bottom <= 0 ? -22 : 22);
              element.classList.add('reveal-pending');
            }
          }
        });
      },
      { threshold: 0 },
    );

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (
        (rect.bottom <= 0 || rect.top >= window.innerHeight) &&
        !element.contains(document.activeElement)
      ) {
        offsets.set(element, rect.bottom <= 0 ? -22 : 22);
        element.classList.add('reveal-pending');
      }
      // Keep every element observed, including those initially on screen.
      observer?.observe(element);
    });
  }

  function focus(event: FocusEvent) {
    const element = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-reveal]',
    );
    if (element) show(element);
  }

  configure();
  reducedMotion.addEventListener('change', configure);
  document.addEventListener('focusin', focus);
  return () => {
    observer?.disconnect();
    elements.forEach(show);
    reducedMotion.removeEventListener('change', configure);
    document.removeEventListener('focusin', focus);
  };
}
