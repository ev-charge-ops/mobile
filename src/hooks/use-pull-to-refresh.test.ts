import { act, renderHook } from '@testing-library/react-native';

import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('usePullToRefresh', () => {
  it('starts idle', async () => {
    const { result } = await renderHook(() => usePullToRefresh(jest.fn().mockResolvedValue(undefined)));

    expect(result.current.refreshing).toBe(false);
  });

  it('is refreshing only while the pull refetch is in flight', async () => {
    const pending = deferred();
    const refetch = jest.fn(() => pending.promise);
    const { result } = await renderHook(() => usePullToRefresh(refetch));

    let refresh: Promise<void> = Promise.resolve();
    await act(async () => {
      refresh = result.current.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      pending.resolve();
      await refresh;
    });

    expect(result.current.refreshing).toBe(false);
  });

  it('resets after a failed refetch', async () => {
    const refetch = jest.fn().mockRejectedValue(new Error('offline'));
    const { result } = await renderHook(() => usePullToRefresh(refetch));

    await act(async () => {
      await result.current.onRefresh().catch(() => undefined);
    });

    expect(result.current.refreshing).toBe(false);
  });
});
