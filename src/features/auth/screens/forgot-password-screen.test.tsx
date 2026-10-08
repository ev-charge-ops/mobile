import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import { ForgotPasswordScreen } from '@/features/auth/screens/forgot-password-screen';
import { renderWithProviders } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, forgotPassword: jest.fn() };
});

const api = jest.mocked(authApi);

async function sendLink(email: string) {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), email);
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ForgotPasswordScreen />', () => {
  it('explains how oauth accounts handle the password', async () => {
    await renderWithProviders(<ForgotPasswordScreen />);

    expect(screen.getByRole('header', { name: 'Recuperar senha' })).toBeOnTheScreen();
    expect(screen.getByText(/Entrou com Google ou Apple/)).toBeOnTheScreen();
  });

  it('sends the link and shows the sent state', async () => {
    api.forgotPassword.mockResolvedValue();

    await renderWithProviders(<ForgotPasswordScreen />);
    await sendLink('ana@example.com');

    expect(await screen.findByRole('header', { name: 'Verifique seu e-mail' })).toBeOnTheScreen();
    expect(api.forgotPassword.mock.calls[0][0]).toBe('ana@example.com');
    expect(screen.getByTestId('sent-envelope')).toBeOnTheScreen();
    expect(screen.getByText('ana@example.com')).toBeOnTheScreen();
    expect(screen.getByText(/vale por 30 minutos/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para entrar' }));
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('goes back to the form to use another email', async () => {
    api.forgotPassword.mockResolvedValue();

    await renderWithProviders(<ForgotPasswordScreen />);
    await sendLink('ana@example.com');
    await fireEvent.press(await screen.findByRole('button', { name: 'Usar outro e-mail' }));

    expect(await screen.findByRole('button', { name: 'Enviar link' })).toBeOnTheScreen();
  });
});
