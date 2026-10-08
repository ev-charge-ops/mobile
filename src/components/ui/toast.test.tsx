import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Zap } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider, useToast, type ToastOptions } from '@/components/ui/toast';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function Trigger({ message, options }: { message: string; options?: ToastOptions }) {
  const toast = useToast();
  return (
    <Pressable onPress={() => toast.show(message, options)}>
      <Text>Mostrar</Text>
    </Pressable>
  );
}

async function renderToast(message: string, options?: ToastOptions) {
  await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ToastProvider>
        <Trigger message={message} options={options} />
      </ToastProvider>
    </SafeAreaProvider>,
  );
  await act(() => fireEvent.press(screen.getByText('Mostrar')));
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Toast', () => {
  it('shows a short message and hides it after the default duration', async () => {
    await renderToast('Conta excluída');

    expect(screen.getByText('Conta excluída')).toBeOnTheScreen();
    expect(screen.getByTestId('toast')).toHaveProp('accessibilityRole', 'alert');

    await act(() => jest.advanceTimersByTime(2600));
    expect(screen.queryByText('Conta excluída')).toBeNull();
  });

  it('shows a titled notice that runs its action and closes when tapped', async () => {
    const onPress = jest.fn();
    await renderToast('Seu veículo começou a carregar.', {
      title: 'Recarga iniciada',
      icon: Zap,
      tone: 'success',
      duration: 4000,
      onPress,
    });

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveProp('accessibilityRole', 'button');
    expect(toast).toHaveProp('accessibilityLabel', 'Recarga iniciada. Seu veículo começou a carregar.');

    await act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText('Recarga iniciada')).toBeOnTheScreen();

    await act(() => fireEvent.press(toast));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('closes when swiped up', async () => {
    await renderToast('Seu veículo terminou de carregar.', { title: 'Recarga concluída' });

    await act(() =>
      fireGestureHandler(getByGestureTestId('toast-pan'), [
        { state: State.BEGAN, translationY: 0, velocityY: 0 },
        { state: State.ACTIVE, translationY: -20, velocityY: -200 },
        { state: State.END, translationY: -60, velocityY: -900 },
      ]),
    );
    await act(() => jest.runOnlyPendingTimers());

    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('stays when the swipe is too short', async () => {
    await renderToast('Seu veículo terminou de carregar.', { title: 'Recarga concluída', duration: 4000 });

    await act(() =>
      fireGestureHandler(getByGestureTestId('toast-pan'), [
        { state: State.BEGAN, translationY: 0, velocityY: 0 },
        { state: State.ACTIVE, translationY: -6, velocityY: -50 },
        { state: State.END, translationY: -10, velocityY: -50 },
      ]),
    );

    expect(screen.getByTestId('toast')).toBeOnTheScreen();
  });
});
