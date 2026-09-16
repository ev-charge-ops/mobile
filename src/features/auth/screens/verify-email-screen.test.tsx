import { fireEvent, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import { VerifyEmailScreen } from '@/features/auth/screens/verify-email-screen';
import { renderWithProviders } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Link: jest.requireActual('react-native').Text,
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, confirmEmailVerification: jest.fn() };
});

const api = jest.mocked(authApi);
const params = jest.mocked(useLocalSearchParams);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<VerifyEmailScreen />', () => {
  it('confirms the token once and shows the success state', async () => {
    params.mockReturnValue({ token: 'verify-token' });
    api.confirmEmailVerification.mockResolvedValue();

    const { rerender } = await renderWithProviders(<VerifyEmailScreen />);
    await rerender(<VerifyEmailScreen />);

    expect(await screen.findByText('E-mail confirmado')).toBeOnTheScreen();
    expect(api.confirmEmailVerification).toHaveBeenCalledTimes(1);
    expect(api.confirmEmailVerification.mock.calls[0][0]).toBe('verify-token');

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('shows an error for an expired token', async () => {
    params.mockReturnValue({ token: 'expired' });
    api.confirmEmailVerification.mockRejectedValue(new authApi.AuthApiError(400));

    await renderWithProviders(<VerifyEmailScreen />);

    expect(await screen.findByText('Não foi possível confirmar')).toBeOnTheScreen();
    expect(screen.getByText(/inválido ou expirado/)).toBeOnTheScreen();
  });

  it('does not call the api without a token', async () => {
    params.mockReturnValue({});

    await renderWithProviders(<VerifyEmailScreen />);

    expect(screen.getByText('Link inválido')).toBeOnTheScreen();
    expect(api.confirmEmailVerification).not.toHaveBeenCalled();
  });
});
