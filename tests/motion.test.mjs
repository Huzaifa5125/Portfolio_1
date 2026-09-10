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

function pointerField() {
  const field = element();
  const glow = element();
  const ring = element();
  field.querySelector = (selector) =>
    selector === '.pointer-glow' ? glow : ring;
  return { field, glow, ring };
}

test('cursor light follows smoothly, fades at rest, and releases its frame loop', (t) => {
  const { reduced, win, frames, tick } = environment(t);
  const fine = eventTarget({ matches: true });
  const { field, glow, ring } = pointerField();
  const cleanup = attachPointerField(field, reduced, fine);
  win.emit('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 100 });
  for (let i = 0; i < 12; i++) tick();
  assert.equal(Number(ring.style.opacity), 1, 'halo fades into view');
  win.emit('pointermove', { pointerType: 'mouse', clientX: 600, clientY: 300 });
  tick();
  const x = (layer) =>
    Number(layer.style.transform.match(/translate3d\(([\d.]+)px/)[1]);
  assert.ok(x(ring) > 100 && x(ring) < 600, 'halo eases toward the pointer');
  assert.ok(x(glow) < x(ring), 'ambient light has a softer response');
  assert.equal(frames.size, 1, 'one animation loop drives both layers');
  for (let i = 0; i < 55; i++) tick();
  assert.ok(Number(ring.style.opacity) < 1, 'stationary effect fades');
  for (let i = 0; i < 40 && frames.size; i++) tick();
  assert.equal(frames.size, 0, 'no animation frames run at rest');
  assert.equal(glow.style.opacity, '0');
  assert.equal(ring.style.opacity, '0');
  win.emit('pointermove', { pointerType: 'mouse', clientX: 500, clientY: 400 });
  tick();
  assert.ok(
    Number(ring.style.opacity) > 0,
    'the next movement restarts the effect',
  );
  assert.match(
    ring.style.transform,
    /500.00px, 400.00px/,
    'restarts at the new pointer, without flying across the page',
  );
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(win.listeners.get('pointermove').size, 0);
  assert.equal(win.listeners.get('scroll').size, 0);
});

test('cursor halo responds to links and resets when scrolling, leaving, or cancelling', (t) => {
  const { reduced, win, doc, frames, tick } = environment(t);
  const { field, ring } = pointerField();
  const cleanup = attachPointerField(
    field,
    reduced,
    eventTarget({ matches: true }),
  );
  const event = {
    pointerType: 'mouse',
    clientX: 100,
    clientY: 100,
    target: { closest: () => ({}) },
  };
  win.emit('pointermove', event);
  tick();
  assert.ok(field.classList.contains('pointer-engaged'));
  win.emit('pointermove', { ...event, target: { closest: () => null } });
  assert.equal(field.classList.contains('pointer-engaged'), false);
  for (const [surface, type] of [
    [win, 'scroll'],
    [win, 'blur'],
    [win, 'pointercancel'],
    [doc.documentElement, 'pointerleave'],
  ]) {
    win.emit('pointermove', event);
    tick();
    surface.emit(type);
    assert.equal(frames.size, 0);
    assert.equal(ring.style.opacity, '0');
    assert.equal(field.classList.contains('pointer-engaged'), false);
  }
  cleanup();
  assert.equal(doc.documentElement.listeners.get('pointerleave').size, 0);
});

test('cursor light respects reduced motion, touch, pointer changes, and background tabs', (t) => {
  const { reduced, win, frames, doc, tick } = environment(t, true);
  const fine = eventTarget({ matches: true });
  const { field, glow, ring } = pointerField();
  const cleanup = attachPointerField(field, reduced, fine);
  const event = { pointerType: 'mouse', clientX: 100, clientY: 100 };
  win.emit('pointermove', event);
  assert.equal(frames.size, 0);
  reduced.matches = false;
  win.emit('pointermove', { ...event, pointerType: 'touch' });
  assert.equal(frames.size, 0);
  fine.matches = false;
  win.emit('pointermove', event);
  assert.equal(frames.size, 0);
  fine.matches = true;
  win.emit('pointermove', event);
  tick();
  fine.matches = false;
  fine.emit('change');
  assert.equal(frames.size, 0);
  fine.matches = true;
  win.emit('pointermove', event);
  tick();
  doc.hidden = true;
  doc.emit('visibilitychange');
  assert.equal(frames.size, 0);
  assert.equal(glow.style.opacity, '0');
  win.emit('pointermove', event);
  assert.equal(frames.size, 0, 'hidden pages cannot restart the effect');
  doc.hidden = false;
  win.emit('pointermove', event);
  tick();
  reduced.matches = true;
  reduced.emit('change');
  assert.equal(frames.size, 0);
  assert.equal(ring.style.opacity, '0');
  cleanup();
  assert.equal(doc.listeners.get('visibilitychange').size, 0);
  assert.equal(fine.listeners.get('change').size, 0);
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
