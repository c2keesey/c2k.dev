import * as React from 'react';
import { decode } from '@/lib/scramble';
import { QUOTES } from '@/data/quotes';

/**
 * The legacy home's rotating quote on the new foundation: mono, "//" comment style,
 * a new quote every 12s that decodes into place. Every quote is laid out invisibly
 * in the same grid cell, so the box is always as tall as the longest one and the
 * page never jumps when the quote changes.
 */
const INTERVAL = 12_000;

export default function RotatingQuote() {
  const textRef = React.useRef<HTMLQuoteElement>(null);
  const authorRef = React.useRef<HTMLElement>(null);
  const [i, setI] = React.useState(0);
  // React owns only the first render of these two spans; decode() writes them after that
  const [first] = React.useState(() => ({ text: `// ${QUOTES[0].text}`, author: `// — ${QUOTES[0].author}` }));

  React.useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % QUOTES.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const q = QUOTES[i];
    const a = textRef.current && decode(textRef.current, `// ${q.text}`, { duration: 1200, delay: i === 0 ? 300 : 0 });
    const b = authorRef.current && decode(authorRef.current, `// — ${q.author}`, { duration: 1200, delay: i === 0 ? 300 : 0 });
    return () => {
      a?.();
      b?.();
    };
  }, [i]);

  const q = QUOTES[i];
  return (
    <figure className="max-w-[68ch] font-mono">
      <span className="sr-only" aria-live="polite">{`${q.text} (${q.author})`}</span>
      <div className="grid [overflow-wrap:anywhere]" aria-hidden="true">
        <div className="[grid-area:1/1]">
          <blockquote ref={textRef} className="text-xs leading-relaxed text-faint-foreground">{first.text}</blockquote>
          <figcaption ref={authorRef} className="mt-1.5 text-2xs text-faint-foreground">{first.author}</figcaption>
        </div>
        {QUOTES.map((x) => (
          <div key={x.text} className="invisible select-none [grid-area:1/1]">
            <p className="text-xs leading-relaxed">{`// ${x.text}`}</p>
            <p className="mt-1.5 text-2xs">{`// — ${x.author}`}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
