import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as authApi from '@/features/auth/api/auth-api';
import { RegisterScreen } from '@/features/auth/screens/register-screen';
import { createSessionValue, renderWithProviders, testUser } from '@/features/auth/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, register: jest.fn() };
});

const api = jest.mocked(authApi);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<RegisterScreen />', () => {
  it('shows the first of two steps and goes back to login', async () => {
    await renderWithProviders(<RegisterScreen />);

    expect(screen.getByRole('progressbar', { name: 'Etapa 1 de 2' })).toBeOnTheScreen();
    expect(screen.getByText('Etapa 1 de 2 · Seus dados')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Criar conta' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('creates the account without the form only fields', async () => {
    const authSession = { user: testUser, accessToken: 'access', refreshToken: 'refresh' };
    api.register.mockResolvedValue(authSession);
    const session = createSessionValue();

    await renderWithProviders(<RegisterScreen />, session);
    await fireEvent.changeText(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@example.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 's3cure-passw0rd');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 's3cure-passw0rd');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(session.startSession).toHaveBeenCalledWith(authSession));
    expect(api.register.mock.calls[0][0]).toEqual({ name: 'Ana Souza', email: 'ana@example.com', password: 's3cure-passw0rd' });
  });
});
