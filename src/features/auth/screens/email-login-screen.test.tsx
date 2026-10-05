import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import { EmailLoginScreen } from '@/features/auth/screens/email-login-screen';
import { clearReturnTarget, setReturnTarget } from '@/features/auth/session/return-target';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) },
  useLocalSearchParams: jest.fn(),
  Link: jest.requireActual('react-native').Text,
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, requestEmailLogin: jest.fn(), verifyEmailLogin: jest.fn() };
});

const api = jest.mocked(authApi);
const params = jest.mocked(useLocalSearchParams);

const authSession: authApi.AuthSession = { user: testUser, accessToken: 'access', refreshToken: 'refresh' };

async function requestCode() {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@example.com');
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar link e código' }));
  await screen.findByText('Verifique seu e-mail');
}

beforeEach(() => {
  jest.clearAllMocks();
  params.mockReturnValue({});
});

afterEach(() => {
  jest.useRealTimers();
  clearReturnTarget();
});

describe('<EmailLoginScreen />', () => {
  it('requests a code, verifies it and starts the session', async () => {
    api.requestEmailLogin.mockResolvedValue();
    api.verifyEmailLogin.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<EmailLoginScreen />, session);
    await requestCode();
    await fireEvent.changeText(screen.getByLabelText('Código'), '042817');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(api.requestEmailLogin.mock.calls[0][0]).toBe('ana@example.com');
    expect(api.verifyEmailLogin.mock.calls[0][0]).toEqual({ email: 'ana@example.com', code: '042817' });
    expect(session.startSession).toHaveBeenCalledWith(authSession);
  });

  it('does not go home when a return target is pending', async () => {
    setReturnTarget({ pathname: '/verify-email', params: { token: 'verify-token' } });
    api.requestEmailLogin.mockResolvedValue();
    api.verifyEmailLogin.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<EmailLoginScreen />, session);
    await requestCode();
    await fireEvent.changeText(screen.getByLabelText('Código'), '042817');

    await waitFor(() => expect(session.startSession).toHaveBeenCalledWith(authSession));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('shows an error for an invalid code', async () => {
    api.requestEmailLogin.mockResolvedValue();
    api.verifyEmailLogin.mockRejectedValue(new authApi.AuthApiError(401));

    await renderWithProviders(<EmailLoginScreen />);
    await requestCode();
    await fireEvent.changeText(screen.getByLabelText('Código'), '000000');

    expect(await screen.findByText('Código inválido ou expirado')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('enables resending the code after 30 seconds', async () => {
    jest.useFakeTimers();
    api.requestEmailLogin.mockResolvedValue();

    await renderWithProviders(<EmailLoginScreen />);
    await requestCode();

    expect(screen.getByRole('button', { name: 'Reenviar código em 0:30' })).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar código' }));

    await waitFor(() => expect(api.requestEmailLogin).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Enviamos um novo código para ana@example.com.')).toBeOnTheScreen();
  });

  it('shows the rate limit message when requesting a code', async () => {
    api.requestEmailLogin.mockRejectedValue(new authApi.AuthApiError(429, 50));

    await renderWithProviders(<EmailLoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar link e código' }));

    expect(await screen.findByText('Muitas tentativas. Tente novamente em 50 s.')).toBeOnTheScreen();
  });

  it('signs in once with the magic link token', async () => {
    params.mockReturnValue({ token: 'magic-token' });
    api.verifyEmailLogin.mockResolvedValue(authSession);
    const session = createSessionValue();

    const { rerender } = await renderWithProviders(<EmailLoginScreen />, session);
    await rerender(<EmailLoginScreen />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(api.verifyEmailLogin).toHaveBeenCalledTimes(1);
    expect(api.verifyEmailLogin.mock.calls[0][0]).toEqual({ token: 'magic-token' });
    expect(session.startSession).toHaveBeenCalledWith(authSession);
  });

  it('offers the code flow when the magic link is invalid', async () => {
    params.mockReturnValue({ token: 'expired' });
    api.verifyEmailLogin.mockRejectedValue(new authApi.AuthApiError(401));

    await renderWithProviders(<EmailLoginScreen />);

    expect(await screen.findByText(/link de acesso é inválido/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar com código' }));
    expect(screen.getByRole('button', { name: 'Enviar link e código' })).toBeOnTheScreen();
  });

  it('goes back to the email step keeping the address', async () => {
    api.requestEmailLogin.mockResolvedValue();

    await renderWithProviders(<EmailLoginScreen />);
    await requestCode();
    expect(screen.getByText('ana@example.com')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Trocar e-mail' }));

    expect(await screen.findByRole('header', { name: 'Entrar sem senha' })).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toHaveDisplayValue('ana@example.com');
  });
});
