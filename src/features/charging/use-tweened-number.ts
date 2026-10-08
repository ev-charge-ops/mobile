import { useEffect, useRef, useState } from 'react';

import { useReduceMotion } from '@/hooks/use-reduce-motion';

export const TWEEN_DURATION = 320;

function easeOut(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export function useTweenedNumber(target: number, duration = TWEEN_DURATION) {
  const reduceMotion = useReduceMotion();
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (reduceMotion || from === target || duration <= 0) {
      current.current = target;
      setValue(target);
      return;
    }
    const startedAt = Date.now();
    let frame = 0;
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      const next = from + (target - from) * easeOut(progress);
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduceMotion]);

  return value;
}
