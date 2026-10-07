import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { hasReturnTarget, setReturnTarget, takeReturnTarget } from '@/features/auth/session/return-target';
import type { SessionStatus } from '@/features/auth/session/session-store';
import { useReturnAfterSignIn } from '@/features/auth/session/use-return-after-sign-in';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

function Probe({ status }: { status: SessionStatus }) {
  useReturnAfterSignIn(status);
  return null;
}

const returnTarget = { pathname: '/verify-email', params: { token: 'abc' } } as const;

beforeEach(() => {
  jest.clearAllMocks();
  takeReturnTarget();
});

describe('useReturnAfterSignIn', () => {
  it('returns to the pending target after signing in', async () => {
    setReturnTarget(returnTarget);
    const { rerender } = await render(<Probe status="anonymous" />);

    await rerender(<Probe status="authenticated" />);

    expect(router.replace).toHaveBeenCalledWith(returnTarget);
    expect(hasReturnTarget()).toBe(false);
  });

  it('does nothing after signing in without a target', async () => {
    const { rerender } = await render(<Probe status="anonymous" />);

    await rerender(<Probe status="authenticated" />);

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('keeps the target when a stored session is restored', async () => {
    setReturnTarget(returnTarget);
    const { rerender } = await render(<Probe status="loading" />);

    await rerender(<Probe status="authenticated" />);

    expect(router.replace).not.toHaveBeenCalled();
    expect(hasReturnTarget()).toBe(true);
  });
});
