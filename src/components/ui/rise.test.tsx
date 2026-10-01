import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { getRiseDelay, Rise, RISE_MAX_INDEX } from '@/components/ui/rise';

describe('getRiseDelay', () => {
  it('staggers by 60 ms per index', () => {
    expect(getRiseDelay(0)).toBe(0);
    expect(getRiseDelay(3)).toBe(180);
  });

  it('clamps negative and long indexes', () => {
    expect(getRiseDelay(-2)).toBe(0);
    expect(getRiseDelay(RISE_MAX_INDEX + 20)).toBe(RISE_MAX_INDEX * 60);
  });
});

describe('Rise', () => {
  it('renders its children', async () => {
    await render(
      <Rise index={2} testID="rise">
        <Text>Olá</Text>
      </Rise>,
    );

    expect(screen.getByTestId('rise')).toBeTruthy();
    expect(screen.getByText('Olá')).toBeTruthy();
  });
});
