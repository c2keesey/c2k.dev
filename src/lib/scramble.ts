/**
 * Decode engine — the site's signature motion (docs/design-system.md §Motion).
 * Characters are "born" as glyphs, cycle through a hex-heavy charset, then resolve
 * left-to-right with jitter. Framework-free so Astro scripts and React share it.
 */
export const GLYPHS = '0123456789abcdefABCDEF~!@#$%^&*()+=_';
export const IDLE_CHAR = '–';

export interface DecodeOptions {
  /** total time from first glyph to fully resolved, ms (default 900) */
  duration?: number;
  /** wait before starting, ms */
  delay?: number;
  /** charset for in-flight glyphs */
  glyphs?: string;
  /** called once with the final text */
  onDone?: () => void;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Placeholder of en-dashes with the same shape as `text`. */
export function idleText(text: string): string {
  return Array.from(text).map((c) => (c === ' ' ? ' ' : IDLE_CHAR)).join('');
}

type Cell = { ch: string; state: 'idle' | 'glyph' | 'done' };

/** Pure frame function: what every character looks like `elapsed` ms in. */
export function makeTimeline(text: string, duration = 900, glyphs = GLYPHS) {
  const chars = Array.from(text);
  const birthWindow = duration * 0.3;
  const resolveWindow = duration * 0.7;
  const birth: number[] = [];
  const resolve: number[] = [];
  chars.forEach((_, i) => {
    const bias = (i / Math.max(chars.length, 1)) * birthWindow * 0.5;
    birth[i] = bias + Math.random() * birthWindow * 0.5;
    resolve[i] = birthWindow + bias + Math.random() * resolveWindow * 0.4;
  });
  return (elapsed: number): Cell[] =>
    chars.map((ch, i) => {
      if (ch === ' ') return { ch, state: 'done' };
      if (elapsed >= resolve[i]) return { ch, state: 'done' };
      if (elapsed >= birth[i]) return { ch: glyphs[(Math.random() * glyphs.length) | 0], state: 'glyph' };
      return { ch: IDLE_CHAR, state: 'idle' };
    });
}

function paint(el: HTMLElement, cells: Cell[]) {
  const frag = document.createDocumentFragment();
  for (const c of cells) {
    if (c.state === 'done') {
      frag.appendChild(document.createTextNode(c.ch));
    } else {
      const s = document.createElement('span');
      s.className = c.state === 'glyph' ? 'decode-glyph' : 'decode-idle';
      s.textContent = c.ch;
      frag.appendChild(s);
    }
  }
  el.replaceChildren(frag);
}

/**
 * Decode `text` into `el`. Returns a cancel function.
 * Under prefers-reduced-motion the text is set immediately.
 */
export function decode(el: HTMLElement, text: string, opts: DecodeOptions = {}): () => void {
  const { duration = 900, delay = 0, glyphs = GLYPHS, onDone } = opts;
  if (prefersReducedMotion()) {
    el.textContent = text;
    onDone?.();
    return () => {};
  }
  const frame = makeTimeline(text, duration, glyphs);
  let raf = 0;
  let start: number | null = null;
  paint(el, frame(0));
  const timer = window.setTimeout(() => {
    const step = (t: number) => {
      start ??= t;
      const elapsed = t - start;
      if (elapsed >= duration) {
        el.textContent = text;
        onDone?.();
        return;
      }
      paint(el, frame(elapsed));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }, delay);
  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    el.textContent = text;
  };
}
