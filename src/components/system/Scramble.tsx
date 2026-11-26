import * as React from 'react';
import { decode, idleText, type DecodeOptions } from '@/lib/scramble';
import { cn } from '@/lib/utils';

type Trigger = 'mount' | 'visible' | 'hover' | 'manual';

interface ScrambleProps extends Pick<DecodeOptions, 'duration' | 'delay'> {
  text: string;
  as?: React.ElementType;
  className?: string;
  /** when to decode. 'visible' (default) waits until in view; 'hover' re-decodes on pointer enter */
  trigger?: Trigger;
  /** change this value to re-run the decode (manual trigger, or data that changed) */
  replayKey?: unknown;
}

/**
 * Decoding text. Screen readers get the real text immediately (sr-only);
 * the animated copy is aria-hidden. Initial HTML is en-dash placeholders of the same
 * shape so layout never shifts.
 */
export function Scramble({ text, as: Tag = 'span', className, trigger = 'visible', replayKey, duration, delay }: ScrambleProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [initial] = React.useState(() => (trigger === 'hover' ? text : idleText(text)));

  const run = React.useCallback(() => {
    if (!ref.current) return () => {};
    return decode(ref.current, text, { duration, delay });
  }, [text, duration, delay]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || trigger === 'hover') return;
    if (trigger === 'manual' && replayKey === undefined) return;
    if (trigger === 'visible') {
      let cancel = () => {};
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          cancel = run();
          io.disconnect();
        }
      }, { rootMargin: '0px 0px -10% 0px' });
      io.observe(el);
      return () => {
        io.disconnect();
        cancel();
      };
    }
    return run();
  }, [run, trigger, replayKey]);

  return (
    <Tag className={cn('decode', className)} onPointerEnter={trigger === 'hover' ? () => run() : undefined}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">{initial}</span>
    </Tag>
  );
}
