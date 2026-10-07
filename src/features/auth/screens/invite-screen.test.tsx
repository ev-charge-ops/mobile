import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import * as googleSignIn from '@/features/auth/oauth/google-sign-in';
import { InviteScreen } from '@/features/auth/screens/invite-screen';
import { hasReturnTarget, setReturnTarget, takeReturnTarget } from '@/features/auth/session/return-target';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Link: jest.requireActual('react-native').Text,
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return {
    ...actual,
    getInvitePreview: jest.fn(),
    acceptInvite: jest.fn(),
    acceptInviteAsCurrentUser: jest.fn(),
    loginWithGoogle: jest.fn(),
  };
});

jest.mock('@/features/auth/oauth/google-sign-in', () => ({
  isGoogleSignInAvailable: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOutFromGoogle: jest.fn(),
}));

const api = jest.mocked(authApi);
const google = jest.mocked(googleSignIn);
const params = jest.mocked(useLocalSearchParams);

const pendingInvite: authApi.InvitePreview = {
  organizationName: 'Residencial Aclimação',
  email: 'ana@example.com',
  unitLabel: 'B · 42',
  expiresAt: '2026-10-20T00:00:00.000Z',
  status: 'PENDING',
};

const invitedUser: authApi.AuthUser = { ...testUser, email: 'Ana@Example.com' };
const authSession: authApi.AuthSession = { user: invitedUser, accessToken: 'access', refreshToken: 'refresh' };

function signedInAs(user: authApi.AuthUser) {
  return createSessionValue({ status: 'authenticated', user });
}

async function fillAccountForm() {
  await fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana Souza');
  await fireEvent.changeText(screen.getByLabelText('Senha'), 'secret-123');
  await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'secret-123');
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta e aceitar' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  takeReturnTarget();
  params.mockReturnValue({ token: 'invite-token' });
  api.getInvitePreview.mockResolvedValue(pendingInvite);
  google.isGoogleSignInAvailable.mockReturnValue(false);
});

describe('<InviteScreen />', () => {
  it('shows the condominium, unit and invited email', async () => {
    await renderWithProviders(<InviteScreen />);

    expect(await screen.findByText('Residencial Aclimação')).toBeOnTheScreen();
    expect(screen.getByText('B · 42')).toBeOnTheScreen();
    expect(screen.getByText('ana@example.com')).toBeOnTheScreen();
    expect(api.getInvitePreview.mock.calls[0][0]).toBe('invite-token');
  });

  it.each([
    ['EXPIRED', 'Convite expirado'],
    ['REVOKED', 'Convite cancelado'],
    ['ACCEPTED', 'Convite já aceito'],
  ] as const)('shows the %s state', async (status, title) => {
    api.getInvitePreview.mockResolvedValue({ ...pendingInvite, status });

    await renderWithProviders(<InviteScreen />);

    expect(await screen.findByText(title)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Criar conta e aceitar' })).not.toBeOnTheScreen();
  });

  it('shows the not found state for an unknown token', async () => {
    api.getInvitePreview.mockRejectedValue(new authApi.AuthApiError(404, null, 'INVITE_NOT_FOUND'));

    await renderWithProviders(<InviteScreen />);

    expect(await screen.findByText('Convite não encontrado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para o início' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('does not call the api without a token', async () => {
    params.mockReturnValue({});

    await renderWithProviders(<InviteScreen />);

    expect(screen.getByText('Convite não encontrado')).toBeOnTheScreen();
    expect(api.getInvitePreview).not.toHaveBeenCalled();
  });

  describe('when signed out', () => {
    it('creates the account, starts the session and goes home', async () => {
      api.acceptInvite.mockResolvedValue(authSession);
      const session = createSessionValue();
      const onAccepted = jest.fn();

      await renderWithProviders(<InviteScreen onAccepted={onAccepted} />, session);
      await screen.findByText('Residencial Aclimação');
      await fillAccountForm();

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
      expect(api.acceptInvite).toHaveBeenCalledWith('invite-token', { name: 'Ana Souza', password: 'secret-123' });
      expect(session.startSession).toHaveBeenCalledWith(authSession);
      expect(onAccepted).toHaveBeenCalled();
      expect(screen.getByText('Convite aceito! Agora você faz parte de Residencial Aclimação.')).toBeOnTheScreen();
    });

    it('validates the password confirmation', async () => {
      await renderWithProviders(<InviteScreen />);
      await screen.findByText('Residencial Aclimação');

      await fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana Souza');
      await fireEvent.changeText(screen.getByLabelText('Senha'), 'secret-123');
      await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'secret-456');
      await fireEvent.press(screen.getByRole('button', { name: 'Criar conta e aceitar' }));

      expect(await screen.findByText('As senhas não coincidem')).toBeOnTheScreen();
      expect(api.acceptInvite).not.toHaveBeenCalled();
    });

    it('explains when the email already has an account', async () => {
      api.acceptInvite.mockRejectedValue(new authApi.AuthApiError(409, null, 'EMAIL_ALREADY_REGISTERED'));

      await renderWithProviders(<InviteScreen />);
      await screen.findByText('Residencial Aclimação');
      await fillAccountForm();

      expect(await screen.findByText(/Este e-mail já tem uma conta/)).toBeOnTheScreen();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('shows the expired state when the invite expires before accepting', async () => {
      api.acceptInvite.mockRejectedValue(new authApi.AuthApiError(410, null, 'INVITE_EXPIRED'));

      await renderWithProviders(<InviteScreen />);
      await screen.findByText('Residencial Aclimação');
      await fillAccountForm();

      expect(await screen.findByText('Convite expirado')).toBeOnTheScreen();
    });

    it('goes to login keeping the invite as the return target', async () => {
      await renderWithProviders(<InviteScreen />);
      await screen.findByText('Residencial Aclimação');

      await fireEvent.press(screen.getByRole('button', { name: 'Já tenho conta' }));

      expect(router.push).toHaveBeenCalledWith('/login');
      expect(takeReturnTarget()).toEqual({ pathname: '/invite', params: { token: 'invite-token' } });
    });

    it('accepts the invite after signing in with google', async () => {
      google.isGoogleSignInAvailable.mockReturnValue(true);
      google.signInWithGoogle.mockResolvedValue({ type: 'success', idToken: 'google-id-token' });
      api.loginWithGoogle.mockResolvedValue(authSession);
      api.acceptInviteAsCurrentUser.mockResolvedValue();
      const session = createSessionValue();

      await renderWithProviders(<InviteScreen />, session);
      await screen.findByText('Residencial Aclimação');
      await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
      expect(session.startSession).toHaveBeenCalledWith(authSession);
      expect(api.acceptInviteAsCurrentUser.mock.calls[0][0]).toBe('invite-token');
    });

    it('does not accept after signing in with google using another email', async () => {
      google.isGoogleSignInAvailable.mockReturnValue(true);
      google.signInWithGoogle.mockResolvedValue({ type: 'success', idToken: 'google-id-token' });
      api.loginWithGoogle.mockResolvedValue({ ...authSession, user: { ...invitedUser, email: 'bia@example.com' } });
      const session = createSessionValue();

      await renderWithProviders(<InviteScreen />, session);
      await screen.findByText('Residencial Aclimação');
      await fireEvent.press(screen.getByRole('button', { name: 'Continuar com o Google' }));

      await waitFor(() => expect(session.startSession).toHaveBeenCalled());
      expect(api.acceptInviteAsCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('when signed in', () => {
    it('offers the acceptance after returning from login', async () => {
      setReturnTarget({ pathname: '/invite', params: { token: 'invite-token' } });

      await renderWithProviders(<InviteScreen />, signedInAs(invitedUser));

      expect(await screen.findByRole('button', { name: 'Aceitar convite' })).toBeOnTheScreen();
      expect(hasReturnTarget()).toBe(false);
    });

    it('accepts the invite and goes home', async () => {
      api.acceptInviteAsCurrentUser.mockResolvedValue();
      const onAccepted = jest.fn();

      await renderWithProviders(<InviteScreen onAccepted={onAccepted} />, signedInAs(invitedUser));
      await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar convite' }));

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
      expect(api.acceptInviteAsCurrentUser.mock.calls[0][0]).toBe('invite-token');
      expect(onAccepted).toHaveBeenCalled();
      expect(screen.getByText('Convite aceito! Agora você faz parte de Residencial Aclimação.')).toBeOnTheScreen();
    });

    it('treats an existing membership as success', async () => {
      api.acceptInviteAsCurrentUser.mockRejectedValue(new authApi.AuthApiError(409, null, 'ALREADY_MEMBER'));
      const onAccepted = jest.fn();

      await renderWithProviders(<InviteScreen onAccepted={onAccepted} />, signedInAs(invitedUser));
      await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar convite' }));

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
      expect(onAccepted).toHaveBeenCalled();
    });

    it('explains an email mismatch and signs out to use another account', async () => {
      const session = signedInAs({ ...testUser, email: 'bia@example.com' });

      await renderWithProviders(<InviteScreen />, session);

      expect(await screen.findByText('Convite para outro e-mail')).toBeOnTheScreen();
      expect(screen.getByText(/enviado para ana@example.com, mas você entrou como bia@example.com/)).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Aceitar convite' })).not.toBeOnTheScreen();

      await fireEvent.press(screen.getByRole('button', { name: 'Sair e entrar com outra conta' }));

      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'));
      expect(session.endSession).toHaveBeenCalled();
      expect(takeReturnTarget()).toEqual({ pathname: '/invite', params: { token: 'invite-token' } });
    });

    it('shows the mismatch when the api rejects the email', async () => {
      api.acceptInviteAsCurrentUser.mockRejectedValue(new authApi.AuthApiError(403, null, 'INVITE_EMAIL_MISMATCH'));

      await renderWithProviders(<InviteScreen />, signedInAs(invitedUser));
      await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar convite' }));

      expect(await screen.findByText('Convite para outro e-mail')).toBeOnTheScreen();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('shows the revoked state when the invite was revoked meanwhile', async () => {
      api.acceptInviteAsCurrentUser.mockRejectedValue(new authApi.AuthApiError(410, null, 'INVITE_REVOKED'));

      await renderWithProviders(<InviteScreen />, signedInAs(invitedUser));
      await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar convite' }));

      expect(await screen.findByText('Convite cancelado')).toBeOnTheScreen();
    });
  });
});
