import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with the value and only settles on the last change after the delay', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');

    await rerender({ value: 'b' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'c' });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});
