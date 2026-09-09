'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const storageKey = 'huzaifa-theme';
const changeEvent = 'portfolio-theme-change';
type Theme = 'light' | 'dark';
let sessionPreference: Theme | null = null;

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
function getServerTheme(): Theme {
  return 'light';
}

function subscribe(onChange: () => void) {
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  function sync() {
    let saved: string | null = sessionPreference;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {
      /* Use this session's choice. */
    }
    document.documentElement.dataset.theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : system.matches
          ? 'dark'
          : 'light';
    onChange();
  }
  function storage(event: StorageEvent) {
    if (!event.key || event.key === storageKey) {
      sessionPreference = null;
      sync();
    }
  }
  system.addEventListener('change', sync);
  window.addEventListener('storage', storage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    system.removeEventListener('change', sync);
    window.removeEventListener('storage', storage);
    window.removeEventListener(changeEvent, onChange);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  function toggle() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    sessionPreference = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Keep the theme for this session. */
    }
    window.dispatchEvent(new Event(changeEvent));
  }

  return (
    <Button
      className="theme-toggle"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={theme === 'dark'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <Moon className="theme-moon" aria-hidden="true" />
      <Sun className="theme-sun" aria-hidden="true" />
    </Button>
  );
}
