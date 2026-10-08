import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { OPENING_EXIT_MS, OPENING_INTRO_MS, OpeningScreen } from '@/features/auth/screens/opening-screen';

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('<OpeningScreen />', () => {
  it('shows the brand, the tagline and the loader', async () => {
    await render(<OpeningScreen ready={false} onDone={jest.fn()} />);

    expect(screen.getByLabelText('EV ChargeOps')).toBeOnTheScreen();
    expect(screen.getByText('EV ChargeOps')).toBeOnTheScreen();
    expect(screen.getByText('Recarga compartilhada, conta clara')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'Carregando' })).toBeOnTheScreen();
  });

  it('waits for the session before leaving', async () => {
    const onDone = jest.fn();
    const view = await render(<OpeningScreen ready={false} onDone={onDone} />);

    await act(async () => {
      jest.advanceTimersByTime(OPENING_INTRO_MS + OPENING_EXIT_MS);
    });
    expect(onDone).not.toHaveBeenCalled();

    await view.rerender(<OpeningScreen ready onDone={onDone} />);
    await act(async () => {
      jest.advanceTimersByTime(OPENING_EXIT_MS);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('plays the intro before leaving when the session is already restored', async () => {
    const onDone = jest.fn();
    await render(<OpeningScreen ready onDone={onDone} />);

    await act(async () => {
      jest.advanceTimersByTime(OPENING_INTRO_MS - 1);
    });
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    await act(async () => {
      jest.advanceTimersByTime(OPENING_EXIT_MS);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skips the intro when reduce motion is on', async () => {
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
    const onDone = jest.fn();
    await render(<OpeningScreen ready onDone={onDone} />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
