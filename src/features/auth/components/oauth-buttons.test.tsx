import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/features/auth/api/auth-api';
import { OAuthButtons } from '@/features/auth/components/oauth-buttons';
import * as appleSignIn from '@/features/auth/oauth/apple-sign-in';
import * as googleSignIn from '@/features/auth/oauth/google-sign-in';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, loginWithGoogle: jest.fn(), loginWithApple: jest.fn() };
});

jest.mock('@/features/auth/oauth/google-sign-in', () => ({
  isGoogleSignInAvailable: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOutFromGoogle: jest.fn(),
}));

jest.mock('@/features/auth/oauth/apple-sign-in', () => ({
  isAppleSignInAvailable: jest.fn(),
  signInWithApple: jest.fn(),
}));

const api = jest.mocked(authApi);
const google = jest.mocked(googleSignIn);
const apple = jest.mocked(appleSignIn);

const authSession: authApi.AuthSession = { user: testUser, accessToken: 'access', refreshToken: 'refresh' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  jest.clearAllMocks();
  google.isGoogleSignInAvailable.mockReturnValue(true);
  apple.isAppleSignInAvailable.mockResolvedValue(false);
});

describe('<OAuthButtons />', () => {
  it('renders nothing when no provider is available', async () => {
    google.isGoogleSignInAvailable.mockReturnValue(false);

    await renderWithProviders(<OAuthButtons />);

    await waitFor(() => expect(apple.isAppleSignInAvailable).toHaveBeenCalled());
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('signs in with google and starts the session', async () => {
    google.signInWithGoogle.mockResolvedValue({ type: 'success', idToken: 'google-id-token' });
    api.loginWithGoogle.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<OAuthButtons />, session);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

    await waitFor(() => expect(session.startSession).toHaveBeenCalledWith(authSession));
    expect(api.loginWithGoogle.mock.calls[0][0]).toBe('google-id-token');
  });

  it('notifies the signed-in session', async () => {
    google.signInWithGoogle.mockResolvedValue({ type: 'success', idToken: 'google-id-token' });
    api.loginWithGoogle.mockResolvedValue(authSession);
    const onSignedIn = jest.fn();

    await renderWithProviders(<OAuthButtons onSignedIn={onSignedIn} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(authSession));
  });

  it('ignores a cancelled google sign-in', async () => {
    google.signInWithGoogle.mockResolvedValue({ type: 'cancelled' });
    const session = createSessionValue();

    await renderWithProviders(<OAuthButtons />, session);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

    await waitFor(() => expect(google.signInWithGoogle).toHaveBeenCalled());
    expect(api.loginWithGoogle).not.toHaveBeenCalled();
    expect(session.startSession).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('shows a toast when the api rejects the google token', async () => {
    google.signInWithGoogle.mockResolvedValue({ type: 'success', idToken: 'google-id-token' });
    api.loginWithGoogle.mockRejectedValue(new authApi.AuthApiError(401));

    await renderWithProviders(<OAuthButtons />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

    expect(await screen.findByText(/validar sua conta Google/)).toBeOnTheScreen();
  });

  it('signs in with apple sending the identity token and name', async () => {
    google.isGoogleSignInAvailable.mockReturnValue(false);
    apple.isAppleSignInAvailable.mockResolvedValue(true);
    apple.signInWithApple.mockResolvedValue({
      type: 'success',
      identityToken: 'apple-identity-token',
      fullName: { givenName: 'Ana', familyName: 'Souza' },
    });
    api.loginWithApple.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<OAuthButtons />, session);
    await fireEvent.press(await screen.findByRole('button', { name: 'Continuar com a Apple' }));

    await waitFor(() => expect(session.startSession).toHaveBeenCalledWith(authSession));
    expect(api.loginWithApple.mock.calls[0][0]).toEqual({
      identityToken: 'apple-identity-token',
      fullName: { givenName: 'Ana', familyName: 'Souza' },
    });
  });

  it('shows a toast when apple sign-in fails', async () => {
    google.isGoogleSignInAvailable.mockReturnValue(false);
    apple.isAppleSignInAvailable.mockResolvedValue(true);
    apple.signInWithApple.mockRejectedValue(new Error('apple failed'));

    await renderWithProviders(<OAuthButtons />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Continuar com a Apple' }));

    expect(await screen.findByText('Não foi possível entrar com a Apple. Tente novamente.')).toBeOnTheScreen();
  });

  it('renders google before apple with the provider logos', async () => {
    apple.isAppleSignInAvailable.mockResolvedValue(true);

    await renderWithProviders(<OAuthButtons />);

    await screen.findByRole('button', { name: 'Continuar com a Apple' });
    const labels = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);
    expect(labels).toEqual(['Continuar com o Google', 'Continuar com a Apple']);
    expect(screen.getByTestId('google-logo')).toBeOnTheScreen();
    expect(screen.getByTestId('apple-logo')).toBeOnTheScreen();
  });

  it('disables apple while a google sign-in is in progress', async () => {
    apple.isAppleSignInAvailable.mockResolvedValue(true);
    const pending = deferred<googleSignIn.GoogleSignInResult>();
    google.signInWithGoogle.mockReturnValue(pending.promise);

    await renderWithProviders(<OAuthButtons />);
    const appleButton = await screen.findByRole('button', { name: 'Continuar com a Apple' });
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeBusy());
    expect(appleButton).toBeDisabled();
    await fireEvent.press(appleButton);
    expect(apple.signInWithApple).not.toHaveBeenCalled();

    pending.resolve({ type: 'cancelled' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar com a Apple' })).toBeEnabled());
  });

  it('disables google while an apple sign-in is in progress', async () => {
    apple.isAppleSignInAvailable.mockResolvedValue(true);
    const pending = deferred<appleSignIn.AppleSignInResult>();
    apple.signInWithApple.mockReturnValue(pending.promise);

    await renderWithProviders(<OAuthButtons />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Continuar com a Apple' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar com a Apple' })).toBeBusy());
    expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeDisabled();

    pending.resolve({ type: 'cancelled' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeEnabled());
    expect(api.loginWithApple).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });
});
