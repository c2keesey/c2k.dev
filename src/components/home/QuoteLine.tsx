import * as React from 'react';
import { Scramble } from '@/components/system';
import { QUOTES } from '@/data/quotes';

/**
 * One quote a day (the same for everyone that day), and another on request.
 * The new one decodes in place; that's the only motion here, and you asked for it.
 */
export default function QuoteLine({ initial }: { initial: number }) {
  const [i, setI] = React.useState(initial);
  const [turns, setTurns] = React.useState(0);
  const q = QUOTES[i];

  const next = () => {
    setI((n) => (n + 1) % QUOTES.length);
    setTurns((t) => t + 1);
  };

  return (
    <figure className="max-w-[52ch]">
      <blockquote className="text-lg leading-relaxed text-muted-foreground sm:text-xl" aria-live="polite">
        {turns === 0 ? <p>{q.text}</p> : <Scramble as="p" text={q.text} trigger="manual" replayKey={turns} duration={1100} />}
      </blockquote>
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="text-foreground">{q.author}</span>
        <button type="button" onClick={next} className="chrome rounded-xs underline-offset-4 hover:text-foreground hover:underline">
          another quote
        </button>
      </figcaption>
    </figure>
  );
}
