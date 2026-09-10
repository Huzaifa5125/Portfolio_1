'use client';

import { useEffect } from 'react';
import { observeReveals } from './reveals';
import { attachPointerField } from './pointer-field';

/** Progressive enhancement: the complete portfolio stays readable without JS. */
export default function PortfolioMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const root = document.documentElement;
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tilt]'),
    );
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main > section[id]'),
    );
    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('nav a'),
    );
    const cleanups: Array<() => void> = [];
    const parallax = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]'),
    );
    const rules = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-rule]'),
    );
    const field = document.querySelector<HTMLElement>('.pointer-field');
    const stopReveals = observeReveals(reveals, reducedMotion);
    if (field)
      cleanups.push(attachPointerField(field, reducedMotion, finePointer));
    let scrollFrame = 0;

    function updateScroll() {
      scrollFrame = 0;
      // Read geometry together before any style writes to avoid layout thrashing.
      const distance = root.scrollHeight - window.innerHeight;
      const parallaxPositions = parallax.map((element) => ({
        element,
        rect: (element.parentElement ?? element).getBoundingClientRect(),
      }));
      const rulePositions = rules.map((rule) => ({
        rule,
        top: rule.getBoundingClientRect().top,
      }));
      const sectionPositions = sections.map((section) => ({
        section,
        top: section.getBoundingClientRect().top,
      }));
      root.style.setProperty(
        '--page-progress',
        String(
          distance > 0
            ? Math.min(1, Math.max(0, window.scrollY / distance))
            : 0,
        ),
      );
      root.classList.toggle('has-scrolled', window.scrollY > 24);
      parallaxPositions.forEach(({ element, rect }) => {
        if (reducedMotion.matches) {
          element.style.removeProperty('--parallax-y');
          return;
        }
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const center = rect.top + rect.height / 2;
        const progress = Math.max(
          -1,
          Math.min(1, (window.innerHeight / 2 - center) / window.innerHeight),
        );
        element.style.setProperty(
          '--parallax-y',
          `${progress * Number(element.dataset.parallax ?? 24)}px`,
        );
      });
      rulePositions.forEach(({ rule, top }) => {
        const progress = reducedMotion.matches
          ? 1
          : Math.min(
              1,
              Math.max(
                0,
                (window.innerHeight - top) / (window.innerHeight * 0.45),
              ),
            );
        rule.style.setProperty('--rule-progress', String(progress));
      });
      let current = '';
      sectionPositions.forEach(({ section, top }) => {
        if (top <= window.innerHeight * 0.4) current = `#${section.id}`;
      });
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === current)
          link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function scheduleScroll() {
      if (!scrollFrame)
        scrollFrame = window.requestAnimationFrame(updateScroll);
    }

    cards.forEach((card) => {
      let frame = 0;
      let x = 0;
      let y = 0;
      function move(event: PointerEvent) {
        if (
          reducedMotion.matches ||
          !finePointer.matches ||
          event.pointerType === 'touch'
        )
          return;
        const rect = card.getBoundingClientRect();
        x = Math.max(
          -0.5,
          Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5),
        );
        y = Math.max(
          -0.5,
          Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5),
        );
        if (!frame)
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            card.style.setProperty('--tilt-x', `${-y * 2.5}deg`);
            card.style.setProperty('--tilt-y', `${x * 2.5}deg`);
            card.style.setProperty('--pointer-x', `${(x + 0.5) * 100}%`);
            card.style.setProperty('--pointer-y', `${(y + 0.5) * 100}%`);
          });
      }
      function reset() {
        window.cancelAnimationFrame(frame);
        frame = 0;
        ['--tilt-x', '--tilt-y', '--pointer-x', '--pointer-y'].forEach(
          (property) => card.style.removeProperty(property),
        );
      }
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', reset);
      card.addEventListener('pointercancel', reset);
      reducedMotion.addEventListener('change', reset);
      finePointer.addEventListener('change', reset);
      cleanups.push(() => {
        reset();
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', reset);
        card.removeEventListener('pointercancel', reset);
        reducedMotion.removeEventListener('change', reset);
        finePointer.removeEventListener('change', reset);
      });
    });

    updateScroll();
    reducedMotion.addEventListener('change', scheduleScroll);
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    return () => {
      stopReveals();
      parallax.forEach((element) =>
        element.style.removeProperty('--parallax-y'),
      );
      rules.forEach((rule) => rule.style.removeProperty('--rule-progress'));
      cleanups.forEach((cleanup) => cleanup());
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
      reducedMotion.removeEventListener('change', scheduleScroll);
      root.style.removeProperty('--page-progress');
      root.classList.remove('has-scrolled');
      navLinks.forEach((link) => link.removeAttribute('aria-current'));
    };
  }, []);

  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      <div className="pointer-field" aria-hidden="true">
        <div className="pointer-background">
          <span className="pointer-glow" />
        </div>
        <div className="pointer-foreground">
          <span className="pointer-ring" />
        </div>
      </div>
    </>
  );
}
