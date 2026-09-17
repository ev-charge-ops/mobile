import { useEffect, useState } from 'react';

export function useCooldown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) setEndsAt(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const start = (seconds: number) => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  };

  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { remaining, start };
}
