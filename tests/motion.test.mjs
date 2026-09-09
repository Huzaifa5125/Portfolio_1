import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { observeReveals } from '../app/reveals.ts';
import { attachPointerField } from '../app/pointer-field.ts';

function eventTarget(extra = {}) {
  const listeners = new Map();
  return {
    ...extra,
    listeners,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    emit(type, event = {}) {
      listeners.get(type)?.forEach((callback) => callback(event));
    },
  };
}
function element(top = 900, height = 200) {
  const classes = new Set();
  return {
    dataset: {},
    animations: [],
    top,
    height,
    style: {},
    classList: {
      add: (key) => classes.add(key),
      remove: (key) => classes.delete(key),
      contains: (key) => classes.has(key),
    },
    getBoundingClientRect() {
      return {
        top: this.top,
        bottom: this.top + this.height,
        height: this.height,
      };
    },
    contains(node) {
      return node === this;
    },
    closest() {
      return this;
    },
    animate(keyframes, options) {
      const animation = {
        keyframes,
        options,
        cancelled: false,
        cancel() {
          this.cancelled = true;
        },
      };
      this.animations.push(animation);
      return animation;
    },
  };
}
function environment(t, matches = false) {
  const observers = [];
  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.observed = new Set();
      observers.push(this);
    }
    observe(el) {
      this.observed.add(el);
    }
    disconnect() {
      this.disconnected = true;
    }
    emit(el, isIntersecting) {
      this.callback([
        {
          target: el,
          isIntersecting,
          boundingClientRect: el.getBoundingClientRect(),
        },
      ]);
    }
  }
  const frames = new Map();
  let frameId = 0;
  let now = 0;
  const doc = eventTarget({
    activeElement: null,
    hidden: false,
    documentElement: eventTarget(),
  });
  const win = eventTarget({
    innerHeight: 800,
    performance: { now: () => now },
    IntersectionObserver: Observer,
    requestAnimationFrame(callback) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
  });
  Object.assign(globalThis, {
    document: doc,
    window: win,
    IntersectionObserver: Observer,
  });
  t.after(() => {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.IntersectionObserver;
  });
  function tick(delta = 16) {
    now += delta;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  }
  return {
    observers,
    frames,
    doc,
    win,
    tick,
    reduced: eventTarget({ matches }),
  };
}

test('scroll reveals replay after leaving above and below the viewport', (t) => {
  const { reduced, observers } = environment(t);
  const el = element(100);
  const cleanup = observeReveals([el], reduced);
  const observer = observers[0];
  observer.emit(el, true);
  assert.equal(
    el.animations.length,
    0,
    'initially visible content does not flash',
  );
  el.top = -250;
  observer.emit(el, false);
  assert.ok(el.classList.contains('reveal-pending'));
  el.top = -50;
  observer.emit(el, true);
  assert.equal(el.animations.length, 1);
  assert.match(el.animations[0].keyframes[0].transform, /-\d+px/);
  el.top = 900;
  observer.emit(el, false);
  assert.ok(el.animations[0].cancelled);
  el.top = 700;
  observer.emit(el, true);
  assert.equal(el.animations.length, 2);
  assert.match(el.animations[1].keyframes[0].transform, /0, \d+px/);
  assert.ok(
    observer.observed.has(el),
    'element remains observed for future visits',
  );
  cleanup();
  assert.ok(el.animations[1].cancelled);
  assert.ok(observer.disconnected);
});

test('partially visible and focused content is never hidden', (t) => {
  const { reduced, observers, doc } = environment(t);
  const el = element(-50, 1000);
  const cleanup = observeReveals([el], reduced);
  observers[0].emit(el, false);
  assert.equal(el.classList.contains('reveal-pending'), false);
  el.top = 900;
  doc.activeElement = el;
  observers[0].emit(el, false);
  assert.equal(el.classList.contains('reveal-pending'), false);
  doc.activeElement = null;
  observers[0].emit(el, false);
  assert.ok(el.classList.contains('reveal-pending'));
  doc.emit('focusin', { target: el });
  assert.equal(el.classList.contains('reveal-pending'), false);
  cleanup();
});

test('reduced motion disables reveals immediately and cleanup removes listeners', (t) => {
  const { reduced, observers, doc } = environment(t, true);
  const el = element();
  const cleanup = observeReveals([el], reduced);
  assert.equal(observers.length, 0);
  assert.equal(el.classList.contains('reveal-pending'), false);
  reduced.matches = false;
  reduced.emit('change');
  assert.ok(el.classList.contains('reveal-pending'));
  el.top = 700;
  observers[0].emit(el, true);
  reduced.matches = true;
  reduced.emit('change');
  assert.ok(el.animations[0].cancelled);
  assert.equal(el.classList.contains('reveal-pending'), false);
  cleanup();
  assert.equal(reduced.listeners.get('change').size, 0);
  assert.equal(doc.listeners.get('focusin').size, 0);
});

test('pointer dots follow, scatter on pause, fade, and release the animation loop', (t) => {
  const { reduced, win, frames, tick } = environment(t);
  const fine = eventTarget({ matches: true });
  const field = element();
  const dots = Array.from({ length: 28 }, () => element());
  field.querySelectorAll = () => dots;
  const cleanup = attachPointerField(field, reduced, fine);
  win.emit('pointermove', { pointerType: 'touch', clientX: 10, clientY: 10 });
  assert.equal(frames.size, 0);
  win.emit('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 100 });
  tick();
  assert.ok(
    dots.every((dot) => Number(dot.style.opacity) > 0.4),
    'trail is visible',
  );
  assert.equal(frames.size, 1, 'animation continues through the pause');
  const following = dots.map((dot) => dot.style.transform);
  for (let i = 0; i < 35; i++) tick();
  assert.ok(
    dots.every((dot, i) => dot.style.transform !== following[i]),
    'dots scatter outward',
  );
  assert.ok(Number(dots[0].style.opacity) < 0.8, 'scattered dots fade');
  for (let i = 0; i < 100 && frames.size; i++) tick();
  assert.equal(frames.size, 0, 'idle particles stop requesting frames');
  assert.ok(dots.every((dot) => dot.style.opacity === '0'));
  assert.equal(field.classList.contains('pointer-active'), false);
  win.emit('pointermove', { pointerType: 'mouse', clientX: 500, clientY: 400 });
  tick();
  assert.ok(
    dots.every((dot) => Number(dot.style.opacity) > 0.4),
    'trail restarts on the next movement',
  );
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(win.listeners.get('pointermove').size, 0);
});

test('moving again during scattering gathers the same dots back into a trail', (t) => {
  const { reduced, win, frames, tick } = environment(t);
  const field = element();
  const dots = Array.from({ length: 28 }, () => element());
  field.querySelectorAll = () => dots;
  const cleanup = attachPointerField(
    field,
    reduced,
    eventTarget({ matches: true }),
  );
  win.emit('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 100 });
  for (let i = 0; i < 40; i++) tick();
  assert.ok(Number(dots[0].style.opacity) < 0.7);
  const scattered = dots[0].style.transform;
  win.emit('pointermove', { pointerType: 'mouse', clientX: 600, clientY: 300 });
  tick();
  assert.equal(Number(dots[0].style.opacity), 0.9);
  assert.notEqual(dots[0].style.transform, scattered);
  assert.equal(frames.size, 1, 'only one frame loop runs');
  cleanup();
});

test('pointer trail respects reduced motion, touch, and background tabs', (t) => {
  const { reduced, win, frames, doc, tick } = environment(t, true);
  const fine = eventTarget({ matches: true });
  const field = element();
  const dots = Array.from({ length: 28 }, () => element());
  field.querySelectorAll = () => dots;
  const cleanup = attachPointerField(field, reduced, fine);
  const event = { pointerType: 'mouse', clientX: 100, clientY: 100 };
  win.emit('pointermove', event);
  assert.equal(frames.size, 0);
  reduced.matches = false;
  fine.matches = false;
  win.emit('pointermove', event);
  assert.equal(frames.size, 0);
  fine.matches = true;
  win.emit('pointermove', event);
  tick();
  doc.hidden = true;
  doc.emit('visibilitychange');
  assert.equal(frames.size, 0);
  assert.ok(dots.every((dot) => dot.style.opacity === '0'));
  doc.hidden = false;
  win.emit('pointermove', event);
  tick();
  reduced.matches = true;
  reduced.emit('change');
  assert.equal(frames.size, 0);
  assert.ok(dots.every((dot) => dot.style.opacity === '0'));
  cleanup();
});

test('theme bootstrap restores preferences and tolerates blocked storage', () => {
  const source = readFileSync(
    new URL('../app/layout.tsx', import.meta.url),
    'utf8',
  );
  const script = source.match(/__html:\s*`([^`]+)`/)[1];
  function theme(saved, systemDark, blocked = false) {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(script, {
      document,
      window: { matchMedia: () => ({ matches: systemDark }) },
      localStorage: {
        getItem() {
          if (blocked) throw new Error('blocked');
          return saved;
        },
      },
    });
    return document.documentElement.dataset.theme;
  }
  assert.equal(theme('dark', false), 'dark');
  assert.equal(theme('light', true), 'light');
  assert.equal(theme(null, true), 'dark');
  assert.equal(theme(null, false, true), 'light');
});
