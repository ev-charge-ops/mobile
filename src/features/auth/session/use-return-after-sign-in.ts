import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { takeReturnTarget } from '@/features/auth/session/return-target';
import type { SessionStatus } from '@/features/auth/session/session-store';

export function useReturnAfterSignIn(status: SessionStatus) {
  const previousStatusRef = useRef(status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previousStatus !== 'anonymous' || status !== 'authenticated') return;
    const target = takeReturnTarget();
    if (target) router.replace(target);
  }, [status]);
}
