import { useSyncExternalStore } from 'react';

// The visitor's choice: 'system' (follow the device, the default), 'light' or 'dark'. The same key and logic run as an
// inline script in index.html before the first paint, so the page never flashes the wrong theme.
const KEY = 'theme';
const THEME_COLOR = { dark: '#161513', light: '#e6ddd2' }; // the browser's own bar, same as --color-ink
const device = window.matchMedia('(prefers-color-scheme: light)');

const read = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system'; // storage blocked: just follow the device
  }
};

let choice = read();
const resolve = () => (choice === 'system' ? (device.matches ? 'light' : 'dark') : choice);
let state = { choice, theme: resolve() };
const listeners = new Set();

const apply = () => {
  state = { choice, theme: resolve() };
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[state.theme]);
  listeners.forEach((listener) => listener());
};

device.addEventListener('change', apply);
apply();

/**
 * Switches theme. `origin` ({ x, y }, the control's position) spreads the new theme from there like a drop of coffee,
 * where the browser supports view transitions and motion is allowed; otherwise it just switches.
 */
export const setTheme = (next, origin) => {
  const before = state.theme;
  choice = next;
  try {
    if (next === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    // storage blocked: it lasts until the page closes
  }
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (resolve() === before || !origin || still || !document.startViewTransition) {
    apply();
    return;
  }
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document
    .startViewTransition(apply)
    .ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {}); // interrupted by another switch: the theme itself has still changed
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** { choice: 'system' | 'light' | 'dark', theme: 'light' | 'dark' } */
const useTheme = () => useSyncExternalStore(subscribe, () => state);

export default useTheme;
