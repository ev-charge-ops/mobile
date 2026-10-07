import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/features/auth/api/auth-api';
import { meQueryKey } from '@/features/auth/api/use-me';
import { ChangePasswordScreen } from '@/features/auth/screens/change-password-screen';
import {
  createSessionValue,
  createTestQueryClient,
  renderWithProviders,
  testUser,
} from '@/features/auth/testing/render-with-providers';

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, changeMyPassword: jest.fn() };
});

const api = jest.mocked(authApi);

const newSession = {
  user: { ...testUser, hasPassword: true },
  accessToken: 'new-access',
  refreshToken: 'new-refresh',
};

async function renderScreen(hasPassword: boolean) {
  const onDone = jest.fn();
  const session = createSessionValue({ status: 'authenticated', user: { ...testUser, hasPassword } });
  const queryClient = createTestQueryClient();
  await renderWithProviders(
    <ChangePasswordScreen hasPassword={hasPassword} onBack={jest.fn()} onDone={onDone} />,
    session,
    queryClient,
  );
  return { onDone, session, queryClient };
}

async function fillNewPassword(password = 'n3w-s3cure-pass', confirmation = password) {
  await fireEvent.changeText(screen.getByLabelText('Nova senha'), password);
  await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), confirmation);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ChangePasswordScreen />', () => {
  it('changes the password, stores the new session and goes back', async () => {
    api.changeMyPassword.mockResolvedValue(newSession);
    const { onDone, session, queryClient } = await renderScreen(true);

    expect(screen.getByRole('header', { name: 'Alterar senha' })).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'old-pass-123');
    await fillNewPassword();
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(api.changeMyPassword.mock.calls[0][0]).toEqual({
      currentPassword: 'old-pass-123',
      newPassword: 'n3w-s3cure-pass',
    });
    expect(session.startSession).toHaveBeenCalledWith(newSession);
    expect(queryClient.getQueryData(meQueryKey)).toEqual(newSession.user);
    expect(screen.getByText('Senha alterada')).toBeOnTheScreen();
  });

  it('applies the registration password rules', async () => {
    await renderScreen(true);

    await fillNewPassword('short', 'other');
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByText('Informe sua senha atual')).toBeOnTheScreen();
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres')).toBeOnTheScreen();
    expect(screen.getByText('As senhas não coincidem')).toBeOnTheScreen();
    expect(api.changeMyPassword).not.toHaveBeenCalled();
  });

  it('reports a wrong current password', async () => {
    api.changeMyPassword.mockRejectedValue(new authApi.AuthApiError(400, null, 'INVALID_CURRENT_PASSWORD'));
    const { onDone, session } = await renderScreen(true);

    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'wrong-pass-1');
    await fillNewPassword();
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByText('Senha atual incorreta')).toBeOnTheScreen();
    expect(session.startSession).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('shows the rate limit message', async () => {
    api.changeMyPassword.mockRejectedValue(new authApi.AuthApiError(429, 45));
    await renderScreen(true);

    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'old-pass-123');
    await fillNewPassword();
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByText('Muitas tentativas. Tente novamente em 45 s.')).toBeOnTheScreen();
  });

  it('creates the first password without asking for the current one', async () => {
    api.changeMyPassword.mockResolvedValue(newSession);
    const { onDone } = await renderScreen(false);

    expect(screen.getByRole('header', { name: 'Criar senha' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Senha atual')).not.toBeOnTheScreen();
    await fillNewPassword();
    await fireEvent.press(screen.getByRole('button', { name: 'Criar senha' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(api.changeMyPassword.mock.calls[0][0]).toEqual({ newPassword: 'n3w-s3cure-pass' });
    expect(screen.getByText('Senha criada')).toBeOnTheScreen();
  });

  it('reveals the typed password on demand', async () => {
    await renderScreen(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar nova senha' }));

    expect(screen.getByLabelText('Nova senha')).toHaveProp('secureTextEntry', false);
    expect(screen.getByLabelText('Senha atual')).toHaveProp('secureTextEntry', true);
  });
});
