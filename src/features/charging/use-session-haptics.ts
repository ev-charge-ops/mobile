import { useEffect, useRef } from 'react';

import type { ChargingSessionStatus } from '@/features/charging/api/charging-api';
import { getTransitionHaptic } from '@/features/charging/session-progress';
import { haptics } from '@/lib/haptics';

export function useSessionHaptics(status: ChargingSessionStatus | undefined) {
  const previous = useRef(status);

  useEffect(() => {
    const feedback = getTransitionHaptic(previous.current, status);
    if (status) previous.current = status;
    if (feedback) haptics[feedback]();
  }, [status]);
}
