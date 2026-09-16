import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import { ResetPasswordScreen } from '@/features/auth/screens/reset-password-screen';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Link: jest.requireActual('react-native').Text,
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, resetPassword: jest.fn() };
});

const api = jest.mocked(authApi);
const params = jest.mocked(useLocalSearchParams);

async function submitNewPassword() {
  await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'n3w-s3cure-pass');
  await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'n3w-s3cure-pass');
  await fireEvent.press(screen.getByRole('button', { name: 'Redefinir senha' }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ResetPasswordScreen />', () => {
  it('resets the password with the link token and goes to login', async () => {
    params.mockReturnValue({ token: 'reset-token' });
    api.resetPassword.mockResolvedValue();
    const session = createSessionValue();

    await renderWithProviders(<ResetPasswordScreen />, session);
    await submitNewPassword();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
    expect(api.resetPassword.mock.calls[0][0]).toEqual({ token: 'reset-token', password: 'n3w-s3cure-pass' });
    expect(session.endSession).not.toHaveBeenCalled();
    expect(screen.getByText('Senha redefinida. Entre com a nova senha.')).toBeOnTheScreen();
  });

  it('ends the current session after resetting while signed in', async () => {
    params.mockReturnValue({ token: 'reset-token' });
    api.resetPassword.mockResolvedValue();
    const session = createSessionValue({ status: 'authenticated', user: testUser });

    await renderWithProviders(<ResetPasswordScreen />, session);
    await submitNewPassword();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  it('shows the rate limit message', async () => {
    params.mockReturnValue({ token: 'reset-token' });
    api.resetPassword.mockRejectedValue(new authApi.AuthApiError(429, 45));

    await renderWithProviders(<ResetPasswordScreen />);
    await submitNewPassword();

    expect(await screen.findByText('Muitas tentativas. Tente novamente em 45 s.')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('asks for a new link when the token is missing', async () => {
    params.mockReturnValue({});

    await renderWithProviders(<ResetPasswordScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Solicitar novo link' }));

    expect(router.replace).toHaveBeenCalledWith('/forgot-password');
  });
});
