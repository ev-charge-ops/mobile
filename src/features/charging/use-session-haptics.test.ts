import { renderHook } from '@testing-library/react-native';

import type { ChargingSessionStatus } from '@/features/charging/api/charging-api';
import { useSessionHaptics } from '@/features/charging/use-session-haptics';
import { haptics } from '@/lib/haptics';

jest.mock('@/lib/haptics', () => ({
  haptics: { success: jest.fn(), warning: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

function renderStatusHook(initial: ChargingSessionStatus | undefined) {
  return renderHook(({ status }: { status: ChargingSessionStatus | undefined }) => useSessionHaptics(status), {
    initialProps: { status: initial },
  });
}

describe('useSessionHaptics', () => {
  it('fires success once when the charger is released', async () => {
    const { rerender } = await renderStatusHook('PENDING');
    expect(haptics.success).not.toHaveBeenCalled();

    await rerender({ status: 'ACTIVE' });
    await rerender({ status: 'ACTIVE' });

    expect(haptics.success).toHaveBeenCalledTimes(1);
  });

  it('warns once when the idle fee starts', async () => {
    const { rerender } = await renderStatusHook('GRACE');

    await rerender({ status: 'IDLE' });
    await rerender({ status: 'IDLE' });

    expect(haptics.warning).toHaveBeenCalledTimes(1);
  });

  it('stays silent when the session loads already active', async () => {
    const { rerender } = await renderStatusHook(undefined);

    await rerender({ status: 'ACTIVE' });

    expect(haptics.success).not.toHaveBeenCalled();
  });
});
