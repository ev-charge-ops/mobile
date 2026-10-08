import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import * as googleSignIn from '@/features/auth/oauth/google-sign-in';
import { LoginScreen } from '@/features/auth/screens/login-screen';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, login: jest.fn() };
});

jest.mock('@/features/auth/oauth/google-sign-in', () => ({
  isGoogleSignInAvailable: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOutFromGoogle: jest.fn(),
}));

const api = jest.mocked(authApi);
const google = jest.mocked(googleSignIn);

beforeEach(() => {
  jest.clearAllMocks();
  google.isGoogleSignInAvailable.mockReturnValue(true);
});

describe('<LoginScreen />', () => {
  it('renders the hero, the form and the alternatives', async () => {
    await renderWithProviders(<LoginScreen />);

    expect(screen.getByTestId('auth-hero')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Entrar' })).toBeOnTheScreen();
    expect(screen.getByText('Use o e-mail cadastrado no condomínio.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeOnTheScreen();
    expect(screen.getByText('Google')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Receber link por e-mail' })).toBeOnTheScreen();
  });

  it('signs in with email and password', async () => {
    const authSession = { user: testUser, accessToken: 'access', refreshToken: 'refresh' };
    api.login.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<LoginScreen />, session);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@example.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'secret-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(session.startSession).toHaveBeenCalledWith(authSession));
  });

  it('opens the forgot password, email link and sign up flows', async () => {
    await renderWithProviders(<LoginScreen />);

    await fireEvent.press(screen.getByRole('link', { name: 'Esqueci a senha' }));
    expect(router.push).toHaveBeenCalledWith('/forgot-password');

    await fireEvent.press(screen.getByRole('button', { name: 'Receber link por e-mail' }));
    expect(router.push).toHaveBeenCalledWith('/login/email');

    await fireEvent.press(screen.getByRole('link', { name: 'Criar conta' }));
    expect(router.replace).toHaveBeenCalledWith('/register');
  });
});
